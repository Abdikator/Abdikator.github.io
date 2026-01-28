const MAX_RESULTS = 50;
const PAGE_SIZE = 10;
const ARABIC_EDITION = "quran-simple";
const ARABIC_MEDINA_EDITION = "quran-uthmani";
const TOTAL_SURAHS = 114;
const DEFAULT_MAX_AYAH = 286;
const TOTAL_PAGES = 604;
const ARABIC_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;
const BASMALAH_NORMALIZED = "بسم الله الرحمن الرحيم";
const BASMALAH_REGEX = new RegExp(
  "^\\s*ب[\\u064B-\\u0652\\u0670\\u0640]*س[\\u064B-\\u0652\\u0670\\u0640]*م[\\u064B-\\u0652\\u0670\\u0640]*\\s+" +
    "[ٱإأآا][\\u064B-\\u0652\\u0670\\u0640]*ل[\\u064B-\\u0652\\u0670\\u0640]*ل[\\u064B-\\u0652\\u0670\\u0640]*ه[\\u064B-\\u0652\\u0670\\u0640]*\\s+" +
    "[ٱإأآا]ل[\\u064B-\\u0652\\u0670\\u0640]*ر[\\u064B-\\u0652\\u0670\\u0640]*ح[\\u064B-\\u0652\\u0670\\u0640]*م[\\u064B-\\u0652\\u0670\\u0640]*ن[\\u064B-\\u0652\\u0670\\u0640]*\\s+" +
    "[ٱإأآا]ل[\\u064B-\\u0652\\u0670\\u0640]*ر[\\u064B-\\u0652\\u0670\\u0640]*ح[\\u064B-\\u0652\\u0670\\u0640]*ي[\\u064B-\\u0652\\u0670\\u0640]*م[\\u064B-\\u0652\\u0670\\u0640]*\\s*"
);

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
  pendingPage: 0,
};

const modalState = {
  surahNumber: 1,
  ayahNumber: 1,
  pageNumber: 1,
  translationKeys: ["en"],
  arabicOnly: false,
  translationTouched: false,
  mode: "browse",
};

const elements = {
  topic: document.getElementById("topic"),
  searchBtn: document.getElementById("searchBtn"),
  searchForm: document.getElementById("searchForm"),
  browseBtn: document.getElementById("browseBtn"),
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
  modalNav: document.getElementById("modalNav"),
  navToggle: document.getElementById("navToggle"),
  navOverlay: document.getElementById("navOverlay"),
  surahSelect: document.getElementById("surahSelect"),
  ayahInput: document.getElementById("ayahInput"),
  pageInput: document.getElementById("pageInput"),
  pagePrevBtn: document.getElementById("pagePrevBtn"),
  pageNextBtn: document.getElementById("pageNextBtn"),
  modalTranslation: document.getElementById("modalTranslation"),
  surahContainer: document.getElementById("surahContainer"),
};

let verseCache = new Map();
let activeEditionKey = "";
let surahMeta = new Map();
let pageSwipeStartX = null;
let pageSwipeStartY = null;

function normalizeArabic(text) {
  return String(text || "")
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[ٱإأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

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

function getDefaultModalTranslationKeys() {
  const keys = getSelectedLanguageKeys();
  return keys.length ? keys : ["en"];
}

function setModalTranslationSelection(selection, options = {}) {
  const { touch = false } = options;
  const keys = Array.isArray(selection?.keys) ? selection.keys : [];
  const normalizedKeys = keys.filter((key) => TRANSLATIONS[key]);
  const arabicOnly = Boolean(selection?.arabicOnly) || normalizedKeys.length === 0;
  const primaryKey = normalizedKeys[0];

  modalState.arabicOnly = arabicOnly;
  modalState.translationKeys = arabicOnly ? [] : normalizedKeys;

  if (touch) {
    modalState.translationTouched = true;
  }

  if (elements.modalTranslation) {
    elements.modalTranslation.value = arabicOnly ? "arabic" : primaryKey || "en";
  }

  updateMedinaStyles();
}

function readModalTranslationSelection() {
  if (!elements.modalTranslation) {
    return { arabicOnly: true, keys: [] };
  }

  const value = elements.modalTranslation.value;
  if (!value || value === "arabic") {
    return { arabicOnly: true, keys: [] };
  }

  return { arabicOnly: false, keys: [value] };
}

function syncModalSelectionFromMain() {
  setModalTranslationSelection({
    arabicOnly: false,
    keys: getDefaultModalTranslationKeys(),
  });
}

function getModalEditionIds() {
  if (modalState.arabicOnly) {
    return [ARABIC_EDITION];
  }

  const translationEditions = modalState.translationKeys
    .map((key) => TRANSLATIONS[key]?.edition)
    .filter(Boolean);

  return [ARABIC_EDITION, ...translationEditions];
}

function isPageViewActive() {
  return modalState.arabicOnly === true;
}

function clampPageNumber(value) {
  const page = Number(value) || 1;
  return Math.min(Math.max(page, 1), TOTAL_PAGES);
}

function updateMedinaStyles() {
  if (!elements.surahContainer) return;
  const isPage = isPageViewActive();
  const isMedina = isPage;
  elements.surahContainer.classList.toggle("is-medina", isMedina);
  elements.surahContainer.classList.toggle("is-page", isPage);
  setPageControlsEnabled(isPage);
}

function setNavOverlay(open) {
  if (!elements.navOverlay || !elements.navToggle) return;
  elements.navOverlay.classList.toggle("is-open", open);
  elements.navOverlay.setAttribute("aria-hidden", String(!open));
  elements.navToggle.setAttribute("aria-expanded", String(open));
  elements.navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

function toggleNavOverlay() {
  if (!elements.navOverlay) return;
  setNavOverlay(!elements.navOverlay.classList.contains("is-open"));
}

function handleNavOverlayClick(event) {
  if (event.target === elements.navOverlay) {
    setNavOverlay(false);
  }
}

function handlePageSwipeStart(event) {
  if (!isPageViewActive()) return;
  const touch = event.touches ? event.touches[0] : event;
  pageSwipeStartX = touch.clientX;
  pageSwipeStartY = touch.clientY;
}

function handlePageSwipeMove(event) {
  if (pageSwipeStartX === null || pageSwipeStartY === null) return;
  const touch = event.touches ? event.touches[0] : event;
  const dx = touch.clientX - pageSwipeStartX;
  const dy = touch.clientY - pageSwipeStartY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
    event.preventDefault();
  }
}

function handlePageSwipeEnd(event) {
  if (pageSwipeStartX === null || pageSwipeStartY === null) return;
  const touch = event.changedTouches ? event.changedTouches[0] : event;
  const dx = touch.clientX - pageSwipeStartX;
  const dy = touch.clientY - pageSwipeStartY;
  const threshold = 55;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
    if (dx < 0) {
      changeMushafPage(1);
    } else {
      changeMushafPage(-1);
    }
  }

  pageSwipeStartX = null;
  pageSwipeStartY = null;
}

function setPageControlsEnabled(enabled) {
  if (!elements.pageInput || !elements.pagePrevBtn || !elements.pageNextBtn) return;
  elements.pageInput.disabled = !enabled;
  elements.pagePrevBtn.disabled = !enabled || modalState.pageNumber <= 1;
  elements.pageNextBtn.disabled = !enabled || modalState.pageNumber >= TOTAL_PAGES;
}

function syncPageControls(pageNumber) {
  if (!elements.pageInput) return;
  const page = clampPageNumber(pageNumber ?? modalState.pageNumber ?? 1);
  modalState.pageNumber = page;
  elements.pageInput.value = String(page);
  elements.pageInput.max = String(TOTAL_PAGES);
  if (elements.pagePrevBtn && elements.pageNextBtn) {
    elements.pagePrevBtn.disabled = page <= 1;
    elements.pageNextBtn.disabled = page >= TOTAL_PAGES;
  }
}

function getSurahNameFromMeta(surahNumber) {
  const meta = surahMeta.get(Number(surahNumber));
  return meta?.englishName || "";
}

function updateAyahBounds(surahNumber, totalAyahs) {
  if (!elements.ayahInput) return;
  const meta = surahMeta.get(Number(surahNumber));
  const maxAyahs = totalAyahs || meta?.numberOfAyahs || DEFAULT_MAX_AYAH;
  elements.ayahInput.max = String(maxAyahs);
  if (Number(elements.ayahInput.value) > maxAyahs) {
    elements.ayahInput.value = String(maxAyahs);
  }
}

function syncModalControls(options = {}) {
  const { totalAyahs } = options;
  if (elements.surahSelect) {
    elements.surahSelect.value = String(modalState.surahNumber);
  }

  if (elements.ayahInput) {
    updateAyahBounds(modalState.surahNumber, totalAyahs);
    elements.ayahInput.value = String(modalState.ayahNumber);
  }

  syncPageControls(modalState.pageNumber);

  if (elements.modalTranslation) {
    elements.modalTranslation.value = modalState.arabicOnly
      ? "arabic"
      : modalState.translationKeys[0] || "en";
  }
}

function populateSurahOptions(list) {
  if (!elements.surahSelect) return;

  elements.surahSelect.innerHTML = list
    .map((surah) => {
      const label = surah.englishName ? `${surah.number}. ${surah.englishName}` : `Surah ${surah.number}`;
      return `<option value="${surah.number}">${escapeHtml(label)}</option>`;
    })
    .join("");
}

async function loadSurahList() {
  if (!elements.surahSelect) return;

  try {
    const response = await fetch("https://api.alquran.cloud/v1/surah");
    if (!response.ok) {
      throw new Error("Surah list request failed");
    }

    const data = await response.json();
    const list = Array.isArray(data.data) ? data.data : [];
    if (list.length) {
      surahMeta = new Map();
      list.forEach((surah) => {
        surahMeta.set(Number(surah.number), {
          englishName: surah.englishName,
          numberOfAyahs: surah.numberOfAyahs,
        });
      });
      populateSurahOptions(list);
      syncModalControls();
      return;
    }
  } catch (error) {
    // fall through to fallback list
  }

  const fallback = Array.from({ length: TOTAL_SURAHS }, (_, index) => ({
    number: index + 1,
    englishName: "",
    numberOfAyahs: null,
  }));

  surahMeta = new Map();
  fallback.forEach((surah) => {
    surahMeta.set(Number(surah.number), {
      englishName: surah.englishName,
      numberOfAyahs: surah.numberOfAyahs,
    });
  });
  populateSurahOptions(fallback);
  syncModalControls();
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

function updateUrlState() {
  if (!window?.history?.replaceState) return;

  const params = new URLSearchParams();
  if (state.currentQuery) {
    params.set("q", state.currentQuery);
  }

  const languageKeys = getSelectedLanguageKeys();
  if (!(languageKeys.length === 1 && languageKeys[0] === "en")) {
    params.set("lang", languageKeys.join(","));
  }

  if (state.currentPage > 0) {
    params.set("page", String(state.currentPage + 1));
  }

  const queryString = params.toString();
  const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);
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

async function fetchVerseByTopic(options = {}) {
  const { pageIndex = 0, updateUrl = true } = options;
  const topic = elements.topic.value.trim();
  if (!topic) {
    setStatus("Enter a topic to search.", "error");
    elements.topic.focus();
    return;
  }

  setLoading(true);
  setStatus("Searching for verses...", "info");

  const searchId = ++state.lastSearchId;
  state.currentQuery = topic;

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
      state.pendingPage = 0;
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
    const totalPages = Math.max(1, Math.ceil(uniqueResults.length / PAGE_SIZE));
    state.currentPage = Math.min(Math.max(pageIndex, 0), totalPages - 1);
    state.pendingPage = 0;
    verseCache.clear();

    await renderResults();

    const total = uniqueResults.length;
    setStatus(`Found ${total} verse${total === 1 ? "" : "s"}.`, "success");
    if (updateUrl) {
      updateUrlState();
    }
  } catch (error) {
    if (searchId !== state.lastSearchId) return;
    state.results = [];
    state.currentPage = 0;
    state.pendingPage = 0;
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

  const arabicItem =
    editionMap[ARABIC_EDITION] ||
    editionMap[ARABIC_MEDINA_EDITION] ||
    items[0];
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
    .filter((id) => id !== ARABIC_EDITION && id !== ARABIC_MEDINA_EDITION)
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

function parseSurahData(dataArray, highlightAyah, editionIds) {
  const items = Array.isArray(dataArray) ? dataArray : [];
  const editionMap = {};

  items.forEach((item) => {
    if (item?.edition?.identifier) {
      editionMap[item.edition.identifier] = item;
    }
  });

  const arabicItem =
    editionMap[ARABIC_EDITION] ||
    editionMap[ARABIC_MEDINA_EDITION] ||
    items[0];
  if (!arabicItem?.ayahs) {
    return { rows: "", surahName: "", totalAyahs: 0, highlightAyah: 0 };
  }

  const surahNumber = arabicItem.surah?.number || arabicItem.ayahs?.[0]?.surah?.number;
  const showBasmalah = shouldShowBasmalah(surahNumber);
  const hasBasmalahAyah =
    showBasmalah && isBasmalahText(arabicItem.ayahs?.[0]?.text);
  const totalAyahs = arabicItem.ayahs.length - (hasBasmalahAyah ? 1 : 0);
  const safeHighlight = Math.min(Math.max(Number(highlightAyah) || 1, 1), totalAyahs);
  const translationItems = editionIds
    .filter((id) => id !== ARABIC_EDITION && id !== ARABIC_MEDINA_EDITION)
    .map((id) => editionMap[id])
    .filter(Boolean);
  const showTranslations = translationItems.length > 0;
  const basmalahLine = showBasmalah ? buildBasmalahLine() : "";

  const rows = arabicItem.ayahs
    .map((ayah, index) => {
      const number = ayah.numberInSurah;
      if (hasBasmalahAyah && index === 0) {
        return basmalahLine;
      }

      const displayNumber = hasBasmalahAyah ? number - 1 : number;
      if (displayNumber < 1) {
        return "";
      }

      const isHighlighted = Number(displayNumber) === Number(safeHighlight);
      const needsBasmalah = showBasmalah && !hasBasmalahAyah && number === 1;
      const basmalahOnly = needsBasmalah && isBasmalahText(ayah.text);
      let ayahText = needsBasmalah ? stripBasmalahText(ayah.text) : ayah.text;
      const prefix = needsBasmalah ? basmalahLine : "";
      if (basmalahOnly) {
        return basmalahLine;
      }
      if (needsBasmalah && !ayahText) {
        ayahText = ayah.text;
      }

      if (!showTranslations) {
        return `
          <div class="verse-row verse-row--arabic-only ${isHighlighted ? "is-highlighted" : ""}">
            <div class="verse-col">
              <div class="verse-label">Ayah ${displayNumber}</div>
              ${prefix}
              <p class="verse-arabic">${escapeHtml(ayahText)}</p>
            </div>
          </div>
        `;
      }

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
            <div class="verse-label">Ayah ${displayNumber}</div>
            <div class="translation-list">${buildTranslationBlocks(translations)}</div>
          </div>
          <div class="verse-col">
            <div class="verse-label">Arabic - Ayah ${displayNumber}</div>
            ${prefix}
            <p class="verse-arabic">${escapeHtml(ayahText)}</p>
          </div>
        </div>
      `;
    })
    .join("");

  return {
    rows,
    surahName: arabicItem.surah?.englishName || "",
    totalAyahs,
    highlightAyah: safeHighlight,
  };
}

function toArabicIndic(number) {
  return String(number).replace(/\d/g, (digit) =>
    "٠١٢٣٤٥٦٧٨٩"[Number(digit)]
  );
}

function buildSurahDivider(surah, fallbackLabel) {
  const arabicName = surah?.name;
  const englishName = surah?.englishName;
  const title = arabicName || englishName || fallbackLabel || "سورة";
  const subtitle = arabicName ? englishName : "";

  return `
    <div class="surah-divider">
      <div class="surah-title">
        ${escapeHtml(title)}
        ${subtitle ? `<span>${escapeHtml(subtitle)}</span>` : ""}
      </div>
    </div>
  `;
}

function shouldShowBasmalah(surahNumber) {
  return Number(surahNumber) !== 1 && Number(surahNumber) !== 9;
}

function buildBasmalahLine() {
  return `
    <div class="basmalah-line" aria-label="Basmallah">
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </div>
  `;
}

function stripBasmalahText(text) {
  if (!text) return "";
  const cleaned = normalizeArabic(text);
  if (!cleaned.startsWith(BASMALAH_NORMALIZED)) {
    return String(text || "").trim();
  }

  return String(text || "").replace(BASMALAH_REGEX, "").trim();
}

function isBasmalahText(text) {
  if (!text) return false;
  return normalizeArabic(text) === BASMALAH_NORMALIZED;
}

function buildPageTranslationPanel(ayahs, label, highlightKey) {
  if (!ayahs.length) return "";
  const title = label ? escapeHtml(label) : "Translation";
  const lines = ayahs
    .map((ayah) => {
      const surahNumber = ayah.surah?.number;
      const numberInSurah = ayah.numberInSurah;
      const key = surahNumber && numberInSurah ? `${surahNumber}:${numberInSurah}` : "";
      const isHighlighted = highlightKey && key === highlightKey;
      const numberLabel = surahNumber && numberInSurah
        ? toArabicIndic(`${surahNumber}:${numberInSurah}`)
        : toArabicIndic(numberInSurah || "");
      return `
        <div class="page-translation-line ${isHighlighted ? "is-highlighted" : ""}">
          <div class="page-translation-number">${numberLabel}</div>
          <p class="page-translation-text">${escapeHtml(ayah.text)}</p>
        </div>
      `;
    })
    .join("");

  return `
    <div class="page-translation-panel">
      <div class="page-translation-title">${title}</div>
      ${lines}
    </div>
  `;
}

function buildPageMarkup(ayahs, highlightKey, pageNumber, surahLabel, options = {}) {
  const offsets = options.offsets || new Map();
  if (!ayahs.length) return "";

  let lastSurahNumber = null;
  const pageText = ayahs
    .map((ayah) => {
      const surahNumber = ayah.surah?.number;
      const numberInSurah = ayah.numberInSurah;
      const offset = surahNumber ? offsets.get(surahNumber) || 0 : 0;
      const displayNumber = numberInSurah ? numberInSurah - offset : numberInSurah;
      const displayKey =
        surahNumber && displayNumber ? `${surahNumber}:${displayNumber}` : "";
      const isHighlighted = highlightKey && displayKey === highlightKey;
      const divider = surahNumber && surahNumber !== lastSurahNumber
        ? buildSurahDivider(ayah.surah)
        : "";
      if (surahNumber && surahNumber !== lastSurahNumber) {
        lastSurahNumber = surahNumber;
      }

      const needsBasmalah =
        surahNumber && numberInSurah === 1 && shouldShowBasmalah(surahNumber);
      const basmalahLine = needsBasmalah ? buildBasmalahLine() : "";
      const isBasmalahAyah = needsBasmalah && offset === 1 && isBasmalahText(ayah.text);
      const ayahText = needsBasmalah ? stripBasmalahText(ayah.text) : ayah.text;

      if (isBasmalahAyah) {
        return `${divider}${basmalahLine}`;
      }

      if (displayNumber < 1) {
        return "";
      }

      const ayahNumber = displayNumber ? toArabicIndic(displayNumber) : "";
      const separator = ayahNumber
        ? `<span class="ayah-separator" aria-hidden="true"><span class="ayah-number">${ayahNumber}</span></span>`
        : "";

      return `
        ${divider}${basmalahLine}
        <span class="page-ayah ${isHighlighted ? "is-highlighted" : ""}" data-key="${displayKey}">
          <span class="ayah-text">${escapeHtml(ayahText)}</span>${separator}
        </span>
      `;
    })
    .join(" ");

  const safeLabel = surahLabel ? escapeHtml(surahLabel) : "Quran";

  return `
    <div class="page-frame">
      <div class="page-header">
        <span>${safeLabel}</span>
        <span>Page ${pageNumber}</span>
      </div>
      <div class="page-text">${pageText}</div>
      <div class="page-footer">
        <span>${safeLabel}</span>
        <span>Page ${pageNumber}</span>
      </div>
    </div>
  `;
}

function parsePageData(pagePayload, highlightKey) {
  const pageData = pagePayload?.data || pagePayload || {};
  const ayahs = Array.isArray(pageData.ayahs) ? pageData.ayahs : [];
  const pageNumber =
    pageData.number ||
    pageData.page ||
    pageData.pageNumber ||
    pageData.page_number ||
    modalState.pageNumber ||
    1;

  const surahNames = [];
  const seen = new Set();
  let highlightMeta = null;
  const basmalahOffsets = new Map();

  ayahs.forEach((ayah) => {
    const surahNumber = ayah.surah?.number;
    if (!surahNumber || basmalahOffsets.has(surahNumber)) return;
    if (ayah.numberInSurah !== 1) return;

    const offset =
      shouldShowBasmalah(surahNumber) && isBasmalahText(ayah.text) ? 1 : 0;
    basmalahOffsets.set(surahNumber, offset);
  });

  const firstAyah = ayahs[0];
  const defaultMeta = firstAyah
    ? {
        surahNumber: firstAyah.surah?.number || modalState.surahNumber,
        ayahNumber: Math.max(
          1,
          (firstAyah.numberInSurah || modalState.ayahNumber) -
            (basmalahOffsets.get(firstAyah.surah?.number) || 0)
        ),
      }
    : null;

  ayahs.forEach((ayah) => {
    const surahName = ayah.surah?.name || ayah.surah?.englishName;
    const surahNumber = ayah.surah?.number;
    if (surahName && !seen.has(surahName)) {
      surahNames.push(surahName);
      seen.add(surahName);
    }

    if (highlightKey && surahNumber && ayah.numberInSurah) {
      const offset = basmalahOffsets.get(surahNumber) || 0;
      const displayNumber = ayah.numberInSurah - offset;
      const key = `${surahNumber}:${displayNumber}`;
      if (key === highlightKey) {
        highlightMeta = { surahNumber, ayahNumber: displayNumber };
      }
    }
  });

  const surahLabel =
    surahNames.length > 1
      ? `${surahNames[0]} — ${surahNames[surahNames.length - 1]}`
      : surahNames[0] || "";

  return {
    html: buildPageMarkup(ayahs, highlightKey, pageNumber, surahLabel, {
      offsets: basmalahOffsets,
    }),
    pageNumber,
    surahLabel,
    highlightMeta,
    defaultMeta,
  };
}

async function fetchAyahPageNumber(surahNumber, ayahNumber) {
  const reference = `${surahNumber}:${ayahNumber}`;
  const response = await fetch(
    `https://api.alquran.cloud/v1/ayah/${reference}/${ARABIC_EDITION}`
  );

  if (!response.ok) {
    throw new Error("Ayah lookup failed");
  }

  const data = await response.json();
  const ayahData = data.data || {};
  return (
    ayahData.page ||
    ayahData.pageNumber ||
    ayahData.page_number ||
    null
  );
}

async function openPageView(pageNumber, options = {}) {
  const { highlightKey = "" } = options;
  const targetPage = clampPageNumber(pageNumber);
  modalState.pageNumber = targetPage;

  updateMedinaStyles();

  if (!elements.modal.classList.contains("is-open")) {
    openModal();
  }

  elements.modalTitle.textContent = "Quran Mushaf";
  elements.modalSubtitle.textContent = `Page ${targetPage}`;
  elements.surahContainer.innerHTML = "<div class=\"empty-state\">Loading page...</div>";

  syncPageControls(targetPage);

  try {
    let data;
    let translationData = null;
    const translationEdition =
      !modalState.arabicOnly && modalState.translationKeys.length
        ? TRANSLATIONS[modalState.translationKeys[0]]?.edition
        : null;
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/page/${targetPage}/${ARABIC_MEDINA_EDITION}`
      );
      if (!response.ok) {
        throw new Error("Page request failed");
      }
      data = await response.json();
    } catch (error) {
      const fallbackResponse = await fetch(
        `https://api.alquran.cloud/v1/page/${targetPage}/${ARABIC_EDITION}`
      );
      if (!fallbackResponse.ok) {
        throw error;
      }
      data = await fallbackResponse.json();
    }

    const parsed = parsePageData(data, highlightKey);
    let translationMarkup = "";
    if (translationEdition) {
      try {
        const translationResponse = await fetch(
          `https://api.alquran.cloud/v1/page/${targetPage}/${translationEdition}`
        );
        if (translationResponse.ok) {
          translationData = await translationResponse.json();
        }
      } catch (error) {
        translationData = null;
      }
    }

    if (translationData?.data?.ayahs?.length) {
      const label = TRANSLATIONS[modalState.translationKeys[0]]?.label || "Translation";
      translationMarkup = buildPageTranslationPanel(
        translationData.data.ayahs,
        label,
        highlightKey
      );
    }

    elements.surahContainer.innerHTML =
      (parsed.html || "<div class=\"empty-state\">Unable to load this page.</div>") +
      translationMarkup;

    const nextMeta = parsed.highlightMeta || parsed.defaultMeta;
    if (nextMeta) {
      if (nextMeta.surahNumber) {
        modalState.surahNumber = nextMeta.surahNumber;
      }
      if (nextMeta.ayahNumber) {
        modalState.ayahNumber = nextMeta.ayahNumber;
      }
    }

    elements.modalSubtitle.textContent = parsed.surahLabel
      ? `Page ${parsed.pageNumber} • ${parsed.surahLabel}`
      : `Page ${parsed.pageNumber}`;

    syncPageControls(parsed.pageNumber);
    syncModalControls();

    requestAnimationFrame(() => {
      centerHighlightedVerse();
    });
  } catch (error) {
    elements.surahContainer.innerHTML =
      "<div class=\"empty-state\">Unable to load this page.</div>";
  }
}

async function openSurahModal(surahNumber, ayahNumber, surahName, options = {}) {
  const { mode, translationSelection, updateControls = true } = options;

  const normalizedSurah = Math.min(
    Math.max(1, Number(surahNumber) || 1),
    TOTAL_SURAHS
  );
  const normalizedAyah = Math.max(1, Number(ayahNumber) || 1);

  modalState.surahNumber = normalizedSurah;
  modalState.ayahNumber = normalizedAyah;
  if (mode) {
    modalState.mode = mode;
  }
  if (translationSelection) {
    setModalTranslationSelection(translationSelection);
  }

  if (isPageViewActive()) {
    openModal();
    updateMedinaStyles();
    let pageNumber = modalState.pageNumber || 1;
    try {
      const resolvedPage = await fetchAyahPageNumber(normalizedSurah, normalizedAyah);
      if (resolvedPage) {
        pageNumber = resolvedPage;
      }
    } catch (error) {
      // keep existing page number fallback
    }

    await openPageView(pageNumber, {
      highlightKey: `${normalizedSurah}:${normalizedAyah}`,
    });
    return;
  }

  openModal();
  updateMedinaStyles();

  const initialName = surahName || getSurahNameFromMeta(normalizedSurah);
  elements.modalTitle.textContent = initialName
    ? `Surah ${initialName}`
    : `Surah ${normalizedSurah}`;
  elements.modalSubtitle.textContent = `Surah ${normalizedSurah} • Ayah ${normalizedAyah}`;
  elements.surahContainer.innerHTML = "<div class=\"empty-state\">Loading surah...</div>";

  if (updateControls) {
    syncModalControls();
  }

  const editionIds = getModalEditionIds();
  const needsMedinaFallback =
    editionIds.length === 1 && editionIds[0] === ARABIC_MEDINA_EDITION;

  try {
    let data;
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${normalizedSurah}/editions/${editionIds.join(",")}`
      );

      if (!response.ok) {
        throw new Error("Surah request failed");
      }

      data = await response.json();
    } catch (error) {
      if (editionIds.length > 1 || needsMedinaFallback) {
        const fallbackResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${normalizedSurah}/editions/${ARABIC_EDITION}`
        );

        if (!fallbackResponse.ok) {
          throw error;
        }

        data = await fallbackResponse.json();
      } else {
        throw error;
      }
    }

    const parsed = parseSurahData(data.data || [], normalizedAyah, editionIds);
    modalState.ayahNumber = parsed.highlightAyah || normalizedAyah;

    if (parsed.surahName) {
      elements.modalTitle.textContent = `Surah ${parsed.surahName}`;
    }
    elements.modalSubtitle.textContent = `Surah ${normalizedSurah} • Ayah ${modalState.ayahNumber}`;

    elements.surahContainer.innerHTML =
      parsed.rows || "<div class=\"empty-state\">Unable to load this surah.</div>";

    if (updateControls) {
      syncModalControls({ totalAyahs: parsed.totalAyahs });
    }

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
  setNavOverlay(false);
}

function closeModal() {
  elements.modal.classList.remove("is-open");
  elements.modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  setNavOverlay(false);
}

function centerHighlightedVerse() {
  const highlighted =
    elements.surahContainer.querySelector(".verse-row.is-highlighted") ||
    elements.surahContainer.querySelector(".page-ayah.is-highlighted");
  if (!highlighted) return;

  if (highlighted.classList.contains("page-ayah")) {
    highlighted.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

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
  updateUrlState();
}

function handleLanguageChange() {
  updateEditionKey();
  if (state.results.length) {
    renderResults();
  }
  if (!modalState.translationTouched) {
    syncModalSelectionFromMain();
  }
  updateUrlState();
}

function handleBrowseClick() {
  if (!modalState.translationTouched) {
    syncModalSelectionFromMain();
  }
  openSurahModal(1, 1, getSurahNameFromMeta(1), { mode: "browse" });
}

function handleModalNavSubmit(event) {
  event.preventDefault();
  const surahNumber = Number(elements.surahSelect.value) || 1;
  const ayahNumber = Number(elements.ayahInput.value) || 1;
  setNavOverlay(false);
  if (isPageViewActive()) {
    const highlightKey = `${surahNumber}:${ayahNumber}`;
    fetchAyahPageNumber(surahNumber, ayahNumber)
      .then((pageNumber) => {
        const targetPage = pageNumber || modalState.pageNumber || 1;
        openPageView(targetPage, { highlightKey });
      })
      .catch(() => {
        openPageView(modalState.pageNumber || 1, { highlightKey });
      });
    return;
  }

  openSurahModal(surahNumber, ayahNumber, getSurahNameFromMeta(surahNumber), {
    mode: "browse",
  });
}

function handleSurahSelectChange() {
  const surahNumber = Number(elements.surahSelect.value) || 1;
  updateAyahBounds(surahNumber);
}

function handleModalTranslationChange() {
  const selection = readModalTranslationSelection();
  setModalTranslationSelection(selection, { touch: true });

  if (modalState.arabicOnly) {
    const highlightKey = `${modalState.surahNumber}:${modalState.ayahNumber}`;
    openPageView(modalState.pageNumber || 1, { highlightKey });
    return;
  }

  openSurahModal(
    modalState.surahNumber,
    modalState.ayahNumber,
    getSurahNameFromMeta(modalState.surahNumber),
    { mode: modalState.mode }
  );
}

function changeMushafPage(delta) {
  if (!isPageViewActive()) return;
  const nextPage = clampPageNumber(modalState.pageNumber + delta);
  if (nextPage === modalState.pageNumber) return;
  openPageView(nextPage);
}

function handlePageInputChange() {
  if (!isPageViewActive()) return;
  const pageValue = clampPageNumber(elements.pageInput.value);
  openPageView(pageValue);
}

function handlePageInputKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  handlePageInputChange();
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

  if (!modalState.translationTouched) {
    setModalTranslationSelection({
      arabicOnly: false,
      keys: getSelectedLanguageKeys(),
    });
  }

  openSurahModal(surahNumber, ayahNumber, surahName, { mode: "search" });
}

function handleModalClick(event) {
  const target = event.target;
  if (target.dataset.action === "close") {
    closeModal();
  }
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchVerseByTopic();
});
elements.browseBtn.addEventListener("click", handleBrowseClick);
elements.topic.addEventListener("input", () => autoResize(elements.topic));
elements.prevBtn.addEventListener("click", () => changePage(-1));
elements.nextBtn.addEventListener("click", () => changePage(1));
elements.languageOptions.addEventListener("change", handleLanguageChange);
elements.resultsList.addEventListener("click", handleResultsClick);
elements.modal.addEventListener("click", handleModalClick);
elements.modalNav.addEventListener("submit", handleModalNavSubmit);
elements.surahSelect.addEventListener("change", handleSurahSelectChange);
elements.modalTranslation.addEventListener("change", handleModalTranslationChange);
elements.pagePrevBtn.addEventListener("click", () => changeMushafPage(-1));
elements.pageNextBtn.addEventListener("click", () => changeMushafPage(1));
elements.pageInput.addEventListener("change", handlePageInputChange);
elements.pageInput.addEventListener("keydown", handlePageInputKeydown);
elements.navToggle.addEventListener("click", toggleNavOverlay);
elements.navOverlay.addEventListener("click", handleNavOverlayClick);
elements.surahContainer.addEventListener("touchstart", handlePageSwipeStart, { passive: true });
elements.surahContainer.addEventListener("touchmove", handlePageSwipeMove, { passive: false });
elements.surahContainer.addEventListener("touchend", handlePageSwipeEnd, { passive: true });
window.addEventListener("resize", () => {
  if (!elements.modal.classList.contains("is-open")) return;
  setNavOverlay(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.modal.classList.contains("is-open")) return;
  if (elements.navOverlay && elements.navOverlay.classList.contains("is-open")) {
    setNavOverlay(false);
    return;
  }
  closeModal();
});

autoResize(elements.topic);
updateEditionKey();
renderEmptyState("Search for a topic to see results.");

function applyLanguageFromParams(langParam) {
  if (!langParam) return;
  const keys = langParam
    .split(",")
    .map((item) => item.trim())
    .filter((item) => TRANSLATIONS[item]);

  if (!keys.length) return;

  const inputs = elements.languageOptions.querySelectorAll("input[name='translation']");
  inputs.forEach((input) => {
    input.checked = keys.includes(input.value);
  });
}

function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  const lang = params.get("lang");
  const pageParam = Number.parseInt(params.get("page"), 10);

  if (lang) {
    applyLanguageFromParams(lang);
  }

  updateEditionKey();
  if (!modalState.translationTouched) {
    syncModalSelectionFromMain();
  }

  if (query) {
    elements.topic.value = query;
    autoResize(elements.topic);
    const pageIndex = Number.isFinite(pageParam) ? Math.max(pageParam - 1, 0) : 0;
    fetchVerseByTopic({ pageIndex, updateUrl: false });
  }
}

initFromUrl();
loadSurahList();
