const MAX_RESULTS = 50;
const PAGE_SIZE = 10;
const ARABIC_EDITION = "quran-simple";

const TRANSLATIONS = {
  en: { label: "English", edition: "en.sahih" },
  fr: { label: "French", edition: "fr.hamidullah" },
  es: { label: "Spanish", edition: "es.cortes" },
  ur: { label: "Urdu", edition: "ur.junagarhi" },
  fa: { label: "Farsi", edition: "fa.ayati" },
  tr: { label: "Turkish", edition: "tr.diyanet" },
};

const EDITION_LABELS = Object.values(TRANSLATIONS).reduce((acc, item) => {
  acc[item.edition] = item.label;
  return acc;
}, {});

const state = {
  results: [],
  currentPage: 0,
  currentQuery: "",
  isLoading: false,
  lastSearchId: 0,
  renderId: 0,
};

const elements = {
  topic: document.getElementById("topic"),
  searchBtn: document.getElementById("searchBtn"),
  status: document.getElementById("status"),
  resultsCount: document.getElementById("resultsCount"),
  resultsList: document.getElementById("fetched-verses"),
  pageIndicator: document.getElementById("pageIndicator"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  languageOptions: document.getElementById("languageOptions"),
  modal: document.getElementById("surahModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalSubtitle: document.getElementById("modalSubtitle"),
  surahContainer: document.getElementById("surahContainer"),
};

let verseCache = new Map();
let activeEditionKey = "";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function autoResize(element) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

function getSelectedLanguageKeys() {
  const checked = Array.from(
    elements.languageOptions.querySelectorAll("input[name='translation']:checked")
  );

  if (checked.length === 0) {
    const fallback = elements.languageOptions.querySelector("input[value='en']");
    if (fallback) {
      fallback.checked = true;
      return ["en"];
    }
  }

  return checked.map((input) => input.value);
}

function getSelectedEditionIds() {
  const keys = getSelectedLanguageKeys();
  const editions = [ARABIC_EDITION];

  keys.forEach((key) => {
    const edition = TRANSLATIONS[key]?.edition;
    if (edition) {
      editions.push(edition);
    }
  });

  return editions;
}

function updateEditionKey() {
  const editions = getSelectedEditionIds();
  const key = editions.join("|");
  if (key !== activeEditionKey) {
    activeEditionKey = key;
    verseCache.clear();
  }
  return editions;
}

function setStatus(message, tone = "info") {
  elements.status.textContent = message;
  elements.status.dataset.tone = tone;
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  elements.searchBtn.disabled = isLoading;
  elements.searchBtn.textContent = isLoading ? "Searching..." : "Search";
}

function updateResultsCount() {
  if (!state.results.length) {
    elements.resultsCount.textContent = "No results yet.";
    elements.pageIndicator.textContent = "";
    return;
  }

  const total = state.results.length;
  elements.resultsCount.textContent = `${total} result${total === 1 ? "" : "s"} found`;
}

function updatePagination() {
  const totalPages = Math.max(1, Math.ceil(state.results.length / PAGE_SIZE));
  elements.pageIndicator.textContent = state.results.length
    ? `Page ${state.currentPage + 1} of ${totalPages}`
    : "";
  elements.prevBtn.disabled = state.currentPage <= 0;
  elements.nextBtn.disabled = state.currentPage >= totalPages - 1;
}

function renderEmptyState(message) {
  elements.resultsList.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  updateResultsCount();
  updatePagination();
}

async function renderResults() {
  const renderId = ++state.renderId;
  const total = state.results.length;

  elements.resultsList.innerHTML = "";

  if (!total) {
    renderEmptyState("Search for a topic to see results.");
    return;
  }

  updateResultsCount();
  updatePagination();

  const start = state.currentPage * PAGE_SIZE;
  const pageItems = state.results.slice(start, start + PAGE_SIZE);
  const editionIds = updateEditionKey();

  const cards = pageItems.map((result) => {
    const verseId = result.verse_id || result.verseId || "";
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <div class="result-header">
        <div>
          <div class="result-title">Loading verse...</div>
          <div class="result-meta">Fetching verse details…</div>
        </div>
        <button class="btn btn-primary btn-small" data-action="reveal" data-verse-id="${verseId}">Reveal</button>
      </div>
      <div class="result-body">
        <div class="loading-line"></div>
        <div class="loading-line short"></div>
      </div>
    `;
    elements.resultsList.appendChild(card);
    return { card, result };
  });

  await Promise.all(
    cards.map(async ({ card, result }) => {
      try {
        const verseData = await getVerseData(result.verse_id, editionIds);
        if (renderId !== state.renderId) return;

        card.querySelector(".result-title").textContent = `${verseData.surahName} • Ayah ${verseData.ayahNumber}`;
        card.querySelector(".result-meta").textContent = `Surah ${verseData.surahNumber}`;

        const body = card.querySelector(".result-body");
        body.innerHTML = `
          <p class="arabic-text">${escapeHtml(verseData.arabicText)}</p>
          <div class="translation-list">${buildTranslationBlocks(verseData.translations)}</div>
        `;

        const revealBtn = card.querySelector("[data-action='reveal']");
        revealBtn.dataset.surah = verseData.surahNumber;
        revealBtn.dataset.ayah = verseData.ayahNumber;
        revealBtn.dataset.surahName = verseData.surahName;
      } catch (error) {
        if (renderId !== state.renderId) return;
        card.innerHTML = "<div class=\"empty-state\">Unable to load this verse.</div>";
      }
    })
  );
}

async function fetchVerseByTopic() {
  const topic = elements.topic.value.trim();
  if (!topic) {
    setStatus("Enter a topic to search.", "error");
    elements.topic.focus();
    return;
  }

  setLoading(true);
  setStatus("Searching for verses...", "info");

  const searchId = ++state.lastSearchId;

  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/search?q=${encodeURIComponent(topic)}&size=${MAX_RESULTS}&page=1`
    );

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    const searchData = await response.json();
    if (searchId !== state.lastSearchId) return;

    const rawResults = searchData.search?.results || [];
    if (rawResults.length === 0) {
      state.results = [];
      state.currentPage = 0;
      verseCache.clear();
      renderEmptyState("No verses found for that topic.");
      setStatus("No verses found. Try a different topic.", "error");
      return;
    }

    const uniqueResults = [];
    const seen = new Set();

    for (const result of rawResults) {
      if (!result.verse_id) continue;
      if (seen.has(result.verse_id)) continue;
      seen.add(result.verse_id);
      uniqueResults.push(result);
      if (uniqueResults.length >= MAX_RESULTS) break;
    }

    state.results = uniqueResults;
    state.currentPage = 0;
    verseCache.clear();

    await renderResults();

    const total = uniqueResults.length;
    setStatus(`Found ${total} verse${total === 1 ? "" : "s"}.`, "success");
  } catch (error) {
    if (searchId !== state.lastSearchId) return;
    state.results = [];
    state.currentPage = 0;
    renderEmptyState("Search failed. Please try again.");
    setStatus("Search failed. Please try again.", "error");
  } finally {
    if (searchId === state.lastSearchId) {
      setLoading(false);
    }
  }
}

async function getVerseData(verseId, editionIds) {
  const cacheKey = `${verseId}|${activeEditionKey}`;
  if (verseCache.has(cacheKey)) {
    return verseCache.get(cacheKey);
  }

  let data;
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${verseId}/editions/${editionIds.join(",")}`
    );

    if (!response.ok) {
      throw new Error("Verse request failed");
    }

    data = await response.json();
  } catch (error) {
    if (editionIds.length > 1) {
      const fallbackResponse = await fetch(
        `https://api.alquran.cloud/v1/ayah/${verseId}/editions/${ARABIC_EDITION}`
      );

      if (!fallbackResponse.ok) {
        throw error;
      }

      data = await fallbackResponse.json();
    } else {
      throw error;
    }
  }

  const normalized = normalizeAyahData(data.data || [], editionIds);
  verseCache.set(cacheKey, normalized);
  return normalized;
}

function normalizeAyahData(dataArray, editionIds) {
  const items = Array.isArray(dataArray) ? dataArray : [];
  const editionMap = {};

  items.forEach((item) => {
    if (item?.edition?.identifier) {
      editionMap[item.edition.identifier] = item;
    }
  });

  const arabicItem = editionMap[ARABIC_EDITION] || items[0];
  if (!arabicItem) {
    return {
      arabicText: "",
      translations: [],
      surahNumber: "",
      ayahNumber: "",
      surahName: "",
    };
  }

  const translations = editionIds
    .filter((id) => id !== ARABIC_EDITION)
    .map((id) => {
      const item = editionMap[id];
      if (!item?.text) return null;
      return { edition: id, text: item.text };
    })
    .filter(Boolean);

  return {
    arabicText: arabicItem.text,
    translations,
    surahNumber: arabicItem.surah.number,
    ayahNumber: arabicItem.numberInSurah,
    surahName: arabicItem.surah.englishName,
  };
}

function buildTranslationBlocks(translations) {
  if (!translations.length) {
    return `
      <div class="translation-block">
        <div class="translation-label">Translation</div>
        <p class="translation-text">Translation unavailable for selected languages.</p>
      </div>
    `;
  }

  return translations
    .map((translation) => {
      const label = EDITION_LABELS[translation.edition] || "Translation";
      return `
        <div class="translation-block">
          <div class="translation-label">${escapeHtml(label)}</div>
          <p class="translation-text">${escapeHtml(translation.text)}</p>
        </div>
      `;
    })
    .join("");
}

function buildSurahRows(dataArray, highlightAyah, editionIds) {
  const items = Array.isArray(dataArray) ? dataArray : [];
  const editionMap = {};

  items.forEach((item) => {
    if (item?.edition?.identifier) {
      editionMap[item.edition.identifier] = item;
    }
  });

  const arabicItem = editionMap[ARABIC_EDITION] || items[0];
  if (!arabicItem?.ayahs) return "";

  const translationItems = editionIds
    .filter((id) => id !== ARABIC_EDITION)
    .map((id) => editionMap[id])
    .filter(Boolean);

  return arabicItem.ayahs
    .map((ayah, index) => {
      const number = ayah.numberInSurah;
      const isHighlighted = Number(number) === Number(highlightAyah);

      const translations = translationItems
        .map((item) => {
          const tAyah = item.ayahs[index];
          if (!tAyah?.text) return null;
          return { edition: item.edition.identifier, text: tAyah.text };
        })
        .filter(Boolean);

      return `
        <div class="verse-row ${isHighlighted ? "is-highlighted" : ""}">
          <div class="verse-col">
            <div class="verse-label">Ayah ${number}</div>
            <div class="translation-list">${buildTranslationBlocks(translations)}</div>
          </div>
          <div class="verse-col">
            <div class="verse-label">Arabic - Ayah ${number}</div>
            <p class="verse-arabic">${escapeHtml(ayah.text)}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

async function openSurahModal(surahNumber, ayahNumber, surahName) {
  openModal();

  elements.modalTitle.textContent = surahName
    ? `Surah ${surahName}`
    : `Surah ${surahNumber}`;
  elements.modalSubtitle.textContent = `Surah ${surahNumber} • Ayah ${ayahNumber}`;
  elements.surahContainer.innerHTML = "<div class=\"empty-state\">Loading surah...</div>";

  const editionIds = updateEditionKey();

  try {
    let data;
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editionIds.join(",")}`
      );

      if (!response.ok) {
        throw new Error("Surah request failed");
      }

      data = await response.json();
    } catch (error) {
      if (editionIds.length > 1) {
        const fallbackResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${ARABIC_EDITION}`
        );

        if (!fallbackResponse.ok) {
          throw error;
        }

        data = await fallbackResponse.json();
      } else {
        throw error;
      }
    }

    const rows = buildSurahRows(data.data || [], ayahNumber, editionIds);

    elements.surahContainer.innerHTML =
      rows || "<div class=\"empty-state\">Unable to load this surah.</div>";

    requestAnimationFrame(() => {
      centerHighlightedVerse();
    });
  } catch (error) {
    elements.surahContainer.innerHTML =
      "<div class=\"empty-state\">Unable to load this surah.</div>";
  }
}

function openModal() {
  elements.modal.classList.add("is-open");
  elements.modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal() {
  elements.modal.classList.remove("is-open");
  elements.modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function centerHighlightedVerse() {
  const highlighted = elements.surahContainer.querySelector(".verse-row.is-highlighted");
  if (!highlighted) return;

  const containerHeight = elements.surahContainer.clientHeight;
  const targetOffset =
    highlighted.offsetTop - (containerHeight / 2) + highlighted.clientHeight / 2;

  elements.surahContainer.scrollTo({
    top: Math.max(0, targetOffset),
    behavior: "smooth",
  });
}

function changePage(delta) {
  const totalPages = Math.max(1, Math.ceil(state.results.length / PAGE_SIZE));
  const nextPage = Math.min(Math.max(state.currentPage + delta, 0), totalPages - 1);
  if (nextPage === state.currentPage) return;
  state.currentPage = nextPage;
  renderResults();
}

function handleLanguageChange() {
  updateEditionKey();
  if (state.results.length) {
    renderResults();
  }
}

async function handleResultsClick(event) {
  const button = event.target.closest("[data-action='reveal']");
  if (!button) return;

  let surahNumber = Number(button.dataset.surah);
  let ayahNumber = Number(button.dataset.ayah);
  let surahName = button.dataset.surahName || "";

  if (!surahNumber || !ayahNumber) {
    const verseId = button.dataset.verseId;
    if (!verseId) {
      setStatus("Unable to locate this verse. Please retry.", "error");
      return;
    }

    try {
      const verseData = await getVerseData(verseId, updateEditionKey());
      surahNumber = verseData.surahNumber;
      ayahNumber = verseData.ayahNumber;
      surahName = verseData.surahName;

      button.dataset.surah = surahNumber;
      button.dataset.ayah = ayahNumber;
      button.dataset.surahName = surahName;
    } catch (error) {
      setStatus("Unable to load this surah. Please retry.", "error");
      return;
    }
  }

  openSurahModal(surahNumber, ayahNumber, surahName);
}

function handleModalClick(event) {
  const target = event.target;
  if (target.dataset.action === "close") {
    closeModal();
  }
}

elements.searchBtn.addEventListener("click", fetchVerseByTopic);
elements.topic.addEventListener("input", () => autoResize(elements.topic));
elements.prevBtn.addEventListener("click", () => changePage(-1));
elements.nextBtn.addEventListener("click", () => changePage(1));
elements.languageOptions.addEventListener("change", handleLanguageChange);
elements.resultsList.addEventListener("click", handleResultsClick);
elements.modal.addEventListener("click", handleModalClick);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && elements.modal.classList.contains("is-open")) {
    closeModal();
  }
});

autoResize(elements.topic);
updateEditionKey();
renderEmptyState("Search for a topic to see results.");
