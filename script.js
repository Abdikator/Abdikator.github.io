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
const DESKTOP_NAV_QUERY = window.matchMedia("(min-width: 701px)");
const TWO_PAGE_SPREAD_QUERY = window.matchMedia("(min-width: 1100px)");
const MOBILE_WHEEL_QUERY = window.matchMedia("(max-width: 700px) and (pointer: coarse)");
const MUSHAF_IMAGE_BASE = "assets/mushaf-pages";
const MUSHAF_IMAGE_EXT = "webp";
const MUSHAF_IMAGE_FALLBACK_EXT = "png";
const ENABLE_TEXT_PAGE_FALLBACK = true;
const MUSHAF_ZOOM_LEVELS = [100, 125, 150];
const WHEEL_LONG_PRESS_MS = 380;
const WHEEL_EDGE_ZONE_PX = 36;
const WHEEL_CANCEL_MOVE_PX = 12;
const WHEEL_STEP_DEGREES = 10;
const WHEEL_VISIBLE_NEIGHBORS = 3;
const DEFAULT_MAIN_LANGUAGE_KEY = "en";
const DEFAULT_MODAL_MODE = "browse";
const ROUTE_PARAM_KEYS = [
  "q",
  "lang",
  "page",
  "view",
  "surah",
  "ayah",
  "mushafPage",
  "zoom",
  "modalLang",
  "modalMode",
];
const ROUTE_BACKUP_KEY = "quranExplorer.appState.v1";
const ROUTE_BACKUP_VERSION = 1;
const ROUTE_BACKUP_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const FALLBACK_SURAH_NAMES_AR = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
];

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
  mushafZoom: 100,
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
  arabicQuickBtn: document.getElementById("arabicQuickBtn"),
  status: document.getElementById("status"),
  resultsCount: document.getElementById("resultsCount"),
  resultsList: document.getElementById("fetched-verses"),
  pageIndicator: document.getElementById("pageIndicator"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  languageOptions: document.getElementById("languageOptions"),
  modal: document.getElementById("surahModal"),
  modalCard: document.getElementById("modalCard"),
  modalTitle: document.getElementById("modalTitle"),
  modalSubtitle: document.getElementById("modalSubtitle"),
  modalNav: document.getElementById("modalNav"),
  navToggle: document.getElementById("navToggle"),
  navOverlay: document.getElementById("navOverlay"),
  surahSelect: document.getElementById("surahSelect"),
  ayahInput: document.getElementById("ayahInput"),
  pageInput: document.getElementById("pageInput"),
  goBtn: document.getElementById("goBtn"),
  pagePrevBtn: document.getElementById("pagePrevBtn"),
  pageNextBtn: document.getElementById("pageNextBtn"),
  pageMenuBtnBottom: document.getElementById("pageMenuBtnBottom"),
  pagePrevBtnBottom: document.getElementById("pagePrevBtnBottom"),
  pageNextBtnBottom: document.getElementById("pageNextBtnBottom"),
  pageCloseBtnBottom: document.getElementById("pageCloseBtnBottom"),
  mushafZoom: document.getElementById("mushafZoom"),
  modalTranslation: document.getElementById("modalTranslation"),
  surahContainer: document.getElementById("surahContainer"),
  mushafWheelOverlay: document.getElementById("mushafWheelOverlay"),
  mushafWheelFocus: document.getElementById("mushafWheelFocus"),
  mushafWheelNeighbors: document.getElementById("mushafWheelNeighbors"),
};

let verseCache = new Map();
let activeEditionKey = "";
let surahMeta = new Map();
let pageSwipeStartX = null;
let pageSwipeStartY = null;
let mushafImageCache = new Map();
let surahStartPageCache = new Map();
let wheelState = {
  active: false,
  longPressTimer: null,
  trackingTouchId: null,
  startX: null,
  startY: null,
  centerX: null,
  centerY: null,
  baseSurah: 1,
  selectedSurah: 1,
  lastAngle: null,
  accumulatedAngle: 0,
  isCommitting: false,
};
let lastInlineNavMode = DESKTOP_NAV_QUERY.matches;
let lastTwoPageSpreadMode = TWO_PAGE_SPREAD_QUERY.matches;
let isApplyingRouteState = false;
let routeApplyRequestId = 0;
let modalRenderRequestId = 0;

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
  if (!elements.languageOptions) {
    return [DEFAULT_MAIN_LANGUAGE_KEY];
  }

  const selected = String(elements.languageOptions.value || DEFAULT_MAIN_LANGUAGE_KEY).trim();
  const normalized = TRANSLATIONS[selected] ? selected : DEFAULT_MAIN_LANGUAGE_KEY;

  if (elements.languageOptions.value !== normalized) {
    elements.languageOptions.value = normalized;
  }

  return [normalized];
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

function isMushafCanvasVisible() {
  if (!elements.surahContainer) return false;
  return Boolean(elements.surahContainer.querySelector(".mushaf-page-canvas"));
}

function isMushafInteractionActive() {
  return isPageViewActive() || isMushafCanvasVisible();
}

function clampSurahNumber(value) {
  return Math.min(Math.max(1, Number(value) || 1), TOTAL_SURAHS);
}

function clampPageNumber(value) {
  const page = Number(value) || 1;
  return Math.min(Math.max(page, 1), TOTAL_PAGES);
}

function clampMushafZoom(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return MUSHAF_ZOOM_LEVELS[0];
  }
  return MUSHAF_ZOOM_LEVELS.reduce((closest, candidate) =>
    Math.abs(candidate - parsed) < Math.abs(closest - parsed) ? candidate : closest
  );
}

function formatMushafPageFile(pageNumber, options = {}) {
  const { pad = true } = options;
  const normalized = String(clampPageNumber(pageNumber));
  return pad ? normalized.padStart(3, "0") : normalized;
}

function getMushafImageUrl(pageNumber, extension = MUSHAF_IMAGE_EXT, options = {}) {
  const ext = String(extension || MUSHAF_IMAGE_EXT).replace(/^\./, "");
  return `${MUSHAF_IMAGE_BASE}/${formatMushafPageFile(pageNumber, options)}.${ext}`;
}

function getMushafImageCandidates(pageNumber) {
  const fallbackExt = String(MUSHAF_IMAGE_FALLBACK_EXT || "").toLowerCase();
  const primaryExt = String(MUSHAF_IMAGE_EXT || "").toLowerCase();
  const extensions = [primaryExt];
  if (fallbackExt && fallbackExt !== primaryExt) {
    extensions.push(fallbackExt);
  }

  const candidates = [];
  extensions.forEach((ext) => {
    // Prefer simple numeric names first: 1.png, 2.png ... 604.png
    candidates.push(getMushafImageUrl(pageNumber, ext, { pad: false }));
    // Then try zero-padded names: 001.png ... 604.png
    candidates.push(getMushafImageUrl(pageNumber, ext, { pad: true }));
  });

  return [...new Set(candidates)];
}

function getExpectedMushafPathLabel(pageNumber) {
  return getMushafImageCandidates(pageNumber).join(", ");
}

function getDesktopSpreadPages(pageNumber) {
  const currentPage = clampPageNumber(pageNumber);
  if (!shouldUseTwoPageSpread()) {
    return { leftPage: currentPage, rightPage: null };
  }

  // Mushaf spread order (RTL book):
  // odd page on the right, following even page on the left.
  if (currentPage % 2 === 1) {
    return {
      leftPage: Math.min(currentPage + 1, TOTAL_PAGES),
      rightPage: currentPage,
    };
  }

  return {
    leftPage: currentPage,
    rightPage: Math.max(currentPage - 1, 1),
  };
}

function preloadMushafImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(url);
    image.onerror = () => reject(new Error(`Unable to load ${url}`));
    image.src = url;
  });
}

async function resolveMushafImageUrl(pageNumber) {
  const page = clampPageNumber(pageNumber);
  if (mushafImageCache.has(page)) {
    return mushafImageCache.get(page) || "";
  }

  const candidates = getMushafImageCandidates(page);

  for (const candidate of candidates) {
    try {
      await preloadMushafImage(candidate);
      mushafImageCache.set(page, candidate);
      return candidate;
    } catch (error) {
      // try next candidate
    }
  }

  mushafImageCache.set(page, "");
  return "";
}

function buildMushafImageMarkup(options = {}) {
  const {
    pages = [],
    zoomPercent = MUSHAF_ZOOM_LEVELS[0],
  } = options;
  const zoom = clampMushafZoom(zoomPercent) / 100;
  const safePages = Array.isArray(pages) && pages.length
    ? pages
    : [{ pageNumber: modalState.pageNumber || 1, state: "loading" }];

  const tiles = safePages
    .map((page) => {
      const safePageNumber = clampPageNumber(page.pageNumber);
      const state = page.state || "ready";
      const errorMessage = page.errorMessage || "Page image unavailable.";
      const tileClass = page.isCurrent ? "is-current" : "";
      const stageMarkup =
        state === "loading"
          ? `
              <div class="mushaf-image-skeleton" aria-hidden="true">
                <div class="loading-line"></div>
                <div class="loading-line short"></div>
                <div class="loading-line"></div>
                <div class="loading-line short"></div>
              </div>
            `
          : state === "error"
            ? `<div class="mushaf-image-error">${escapeHtml(errorMessage)}</div>`
            : `<img
                class="mushaf-page-image"
                src="${escapeHtml(page.imageUrl || "")}"
                alt="Quran Mushaf page ${safePageNumber}"
                loading="eager"
                decoding="async"
              >`;

      return `
        <div class="mushaf-page-tile ${tileClass}" data-page="${safePageNumber}">
          ${stageMarkup}
        </div>
      `;
    })
    .join("");

  const spreadClass = safePages.length > 1 ? "is-spread" : "is-single";

  return `
    <div class="mushaf-page-canvas" style="--mushaf-zoom: ${zoom};">
      <div class="mushaf-image-stage">
        <div class="mushaf-spread ${spreadClass}">
          ${tiles}
        </div>
      </div>
    </div>
  `;
}

function preloadAdjacentMushafPages(pageNumber) {
  const page = clampPageNumber(pageNumber);
  const neighbors = [page - 1, page + 1].filter(
    (candidate) => candidate >= 1 && candidate <= TOTAL_PAGES
  );
  neighbors.forEach((candidate) => {
    resolveMushafImageUrl(candidate).catch(() => {
      // no-op; just warm the cache when available
    });
  });
}

function applyMushafZoomToCurrentView() {
  if (!elements.surahContainer) return;
  const frame = elements.surahContainer.querySelector(".mushaf-page-canvas");
  if (!frame) return;
  frame.style.setProperty("--mushaf-zoom", String(clampMushafZoom(modalState.mushafZoom) / 100));
}

function updateMedinaStyles() {
  if (!elements.surahContainer) return;
  const isPage = isPageViewActive();
  const isMedina = isPage;
  elements.surahContainer.classList.toggle("is-medina", isMedina);
  elements.surahContainer.classList.toggle("is-page", isPage);
  if (elements.modalCard) {
    elements.modalCard.classList.toggle("is-page-mode", isPage);
  }
  setPageControlsEnabled(isPage);
}

function useInlineNav() {
  return DESKTOP_NAV_QUERY.matches;
}

function shouldUseTwoPageSpread() {
  return useInlineNav() && TWO_PAGE_SPREAD_QUERY.matches;
}

function getTouchByIdentifier(touchList, touchId) {
  if (!touchList || touchId === null || touchId === undefined) return null;
  for (let index = 0; index < touchList.length; index += 1) {
    const touch = touchList[index];
    if (touch.identifier === touchId) {
      return touch;
    }
  }
  return null;
}

function getTrackedTouchFromEvent(event) {
  if (!event || wheelState.trackingTouchId === null) return null;
  const activeTouch = getTouchByIdentifier(event.touches, wheelState.trackingTouchId);
  if (activeTouch) return activeTouch;
  return getTouchByIdentifier(event.changedTouches, wheelState.trackingTouchId);
}

function isWheelLongPressPending() {
  return !wheelState.active && wheelState.longPressTimer !== null;
}

function clearWheelLongPressTimer() {
  if (wheelState.longPressTimer !== null) {
    clearTimeout(wheelState.longPressTimer);
    wheelState.longPressTimer = null;
  }
}

function setMushafWheelOverlayActive(active) {
  if (!elements.mushafWheelOverlay) return;
  elements.mushafWheelOverlay.classList.toggle("is-active", active);
  elements.mushafWheelOverlay.setAttribute("aria-hidden", String(!active));
  if (elements.modalCard) {
    elements.modalCard.classList.toggle("is-wheel-active", active);
  }
}

function resetMushafWheelTrackingState() {
  wheelState.active = false;
  wheelState.trackingTouchId = null;
  wheelState.startX = null;
  wheelState.startY = null;
  wheelState.centerX = null;
  wheelState.centerY = null;
  wheelState.baseSurah = clampSurahNumber(modalState.surahNumber || 1);
  wheelState.selectedSurah = wheelState.baseSurah;
  wheelState.lastAngle = null;
  wheelState.accumulatedAngle = 0;
}

function cancelMushafWheelInteraction() {
  clearWheelLongPressTimer();
  setMushafWheelOverlayActive(false);
  resetMushafWheelTrackingState();
}

function canUseMushafWheel() {
  if (!elements.modal?.classList.contains("is-open")) return false;
  if (!isPageViewActive()) return false;
  if (!MOBILE_WHEEL_QUERY.matches) return false;
  if (!elements.mushafWheelOverlay || !elements.mushafWheelFocus || !elements.mushafWheelNeighbors) {
    return false;
  }
  if (elements.navOverlay?.classList.contains("is-open")) return false;
  return true;
}

function isTouchInWheelEdgeZone(touch) {
  if (!elements.surahContainer || !touch) return false;
  const bounds = elements.surahContainer.getBoundingClientRect();
  return (
    touch.clientX >= (bounds.right - WHEEL_EDGE_ZONE_PX) &&
    touch.clientY >= bounds.top &&
    touch.clientY <= bounds.bottom
  );
}

function getWheelAngleDegrees(clientX, clientY) {
  if (wheelState.centerX === null || wheelState.centerY === null) return null;
  return Math.atan2(clientY - wheelState.centerY, clientX - wheelState.centerX) * (180 / Math.PI);
}

function normalizeAngleDelta(delta) {
  let normalized = delta;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function getSurahArabicNameFromFallback(surahNumber) {
  const safeSurah = clampSurahNumber(surahNumber);
  return FALLBACK_SURAH_NAMES_AR[safeSurah - 1] || `سورة ${safeSurah}`;
}

function getSurahArabicName(surahNumber) {
  const safeSurah = clampSurahNumber(surahNumber);
  const meta = surahMeta.get(safeSurah);
  return meta?.arabicName || getSurahArabicNameFromFallback(safeSurah);
}

function getSurahArabicLabel(surahNumber) {
  const safeSurah = clampSurahNumber(surahNumber);
  const arabicName = getSurahArabicName(safeSurah);
  return `${safeSurah}. ${arabicName || `سورة ${safeSurah}`}`;
}

function renderMushafWheel() {
  if (!elements.mushafWheelFocus || !elements.mushafWheelNeighbors) return;
  const selectedSurah = clampSurahNumber(wheelState.selectedSurah || modalState.surahNumber || 1);
  wheelState.selectedSurah = selectedSurah;

  elements.mushafWheelFocus.innerHTML = `
    <span class="mushaf-wheel-focus-number">${selectedSurah}</span>
    <span class="mushaf-wheel-focus-name">${escapeHtml(getSurahArabicName(selectedSurah))}</span>
  `;

  const neighbors = [];
  const angleStep = 18;
  for (let offset = -WHEEL_VISIBLE_NEIGHBORS; offset <= WHEEL_VISIBLE_NEIGHBORS; offset += 1) {
    if (offset === 0) continue;
    const candidateSurah = selectedSurah + offset;
    if (candidateSurah < 1 || candidateSurah > TOTAL_SURAHS) continue;
    neighbors.push(`
      <div
        class="mushaf-wheel-chip"
        style="--chip-angle:${offset * angleStep}deg;--chip-distance:${Math.abs(offset)};"
      >
        ${escapeHtml(getSurahArabicLabel(candidateSurah))}
      </div>
    `);
  }

  elements.mushafWheelNeighbors.innerHTML = neighbors.join("");
}

function activateMushafWheel() {
  if (!canUseMushafWheel() || wheelState.startX === null || wheelState.startY === null) {
    cancelMushafWheelInteraction();
    return;
  }

  const cardBounds = elements.modalCard?.getBoundingClientRect();
  if (!cardBounds) {
    cancelMushafWheelInteraction();
    return;
  }

  const wheelRadius = 108;
  const localCenterX = Math.max(
    wheelRadius + 12,
    cardBounds.width - wheelRadius - 14
  );
  const minCenterY = wheelRadius + 12;
  const maxCenterY = Math.max(minCenterY, cardBounds.height - wheelRadius - 12);
  const localCenterY = Math.min(
    Math.max(wheelState.startY - cardBounds.top, minCenterY),
    maxCenterY
  );

  wheelState.centerX = cardBounds.left + localCenterX;
  wheelState.centerY = cardBounds.top + localCenterY;
  wheelState.baseSurah = clampSurahNumber(modalState.surahNumber || 1);
  wheelState.selectedSurah = wheelState.baseSurah;
  wheelState.lastAngle = getWheelAngleDegrees(wheelState.startX, wheelState.startY);
  wheelState.accumulatedAngle = 0;
  wheelState.active = true;

  elements.mushafWheelOverlay.style.setProperty("--wheel-center-x", `${localCenterX}px`);
  elements.mushafWheelOverlay.style.setProperty("--wheel-center-y", `${localCenterY}px`);
  setMushafWheelOverlayActive(true);
  renderMushafWheel();
}

function startMushafWheelLongPress(touch) {
  clearWheelLongPressTimer();
  wheelState.trackingTouchId = touch.identifier;
  wheelState.startX = touch.clientX;
  wheelState.startY = touch.clientY;
  wheelState.longPressTimer = setTimeout(() => {
    clearWheelLongPressTimer();
    activateMushafWheel();
  }, WHEEL_LONG_PRESS_MS);
}

function updateMushafWheelSelectionFromTouch(touch) {
  if (!wheelState.active || !touch) return;
  const nextAngle = getWheelAngleDegrees(touch.clientX, touch.clientY);
  if (!Number.isFinite(nextAngle)) return;

  if (!Number.isFinite(wheelState.lastAngle)) {
    wheelState.lastAngle = nextAngle;
    return;
  }

  const delta = normalizeAngleDelta(nextAngle - wheelState.lastAngle);
  wheelState.lastAngle = nextAngle;
  wheelState.accumulatedAngle += delta;

  const rawStepCount = wheelState.accumulatedAngle / WHEEL_STEP_DEGREES;
  const stepCount = rawStepCount > 0
    ? Math.floor(rawStepCount)
    : Math.ceil(rawStepCount);
  if (!stepCount) return;

  wheelState.accumulatedAngle -= stepCount * WHEEL_STEP_DEGREES;
  const nextSurah = clampSurahNumber(wheelState.selectedSurah + stepCount);
  if (nextSurah === wheelState.selectedSurah) return;

  wheelState.selectedSurah = nextSurah;
  renderMushafWheel();
}

async function resolveSurahStartPage(surahNumber) {
  const safeSurah = clampSurahNumber(surahNumber);
  if (surahStartPageCache.has(safeSurah)) {
    return surahStartPageCache.get(safeSurah);
  }

  const resolvedPage = clampPageNumber(await fetchAyahPageNumber(safeSurah, 1));
  surahStartPageCache.set(safeSurah, resolvedPage);
  return resolvedPage;
}

async function commitWheelSelection(surahNumber) {
  const safeSurah = clampSurahNumber(surahNumber);
  if (wheelState.isCommitting) return;
  wheelState.isCommitting = true;

  const previousSurahNumber = modalState.surahNumber;
  const previousAyahNumber = modalState.ayahNumber;

  try {
    modalState.surahNumber = safeSurah;
    modalState.ayahNumber = 1;
    syncModalControls();

    const targetPage = await resolveSurahStartPage(safeSurah);
    await openPageView(targetPage, {
      highlightKey: `${safeSurah}:1`,
      historyMode: "replace",
    });
  } catch (error) {
    modalState.surahNumber = previousSurahNumber;
    modalState.ayahNumber = previousAyahNumber;
    syncModalControls();
    setStatus("Unable to jump to that chapter right now. Please retry.", "error");
  } finally {
    wheelState.isCommitting = false;
  }
}

function setNavOverlay(open) {
  if (!elements.navOverlay || !elements.navToggle) return;
  cancelMushafWheelInteraction();

  if (useInlineNav()) {
    elements.navToggle.hidden = true;
    elements.navOverlay.classList.add("is-open");
    elements.navOverlay.setAttribute("aria-hidden", "false");
    elements.navToggle.setAttribute("aria-expanded", "true");
    elements.navToggle.setAttribute("aria-label", "Navigation controls");
    return;
  }

  elements.navToggle.hidden = false;
  elements.navOverlay.classList.toggle("is-open", open);
  elements.navOverlay.setAttribute("aria-hidden", String(!open));
  elements.navToggle.setAttribute("aria-expanded", String(open));
  elements.navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

function syncNavigationLayout() {
  if (useInlineNav()) {
    setNavOverlay(true);
    return;
  }
  setNavOverlay(false);
}

function toggleNavOverlay() {
  if (useInlineNav()) return;
  if (!elements.navOverlay) return;
  setNavOverlay(!elements.navOverlay.classList.contains("is-open"));
}

function handleNavOverlayClick(event) {
  if (useInlineNav()) return;
  if (event.target === elements.navOverlay) {
    setNavOverlay(false);
  }
}

function handlePageSwipeStart(event) {
  if (!isPageViewActive()) return;

  if (wheelState.active || wheelState.isCommitting) {
    return;
  }

  const touch = event.touches ? event.touches[0] : event;
  if (canUseMushafWheel() && isTouchInWheelEdgeZone(touch)) {
    if (event.cancelable) {
      event.preventDefault();
    }
    pageSwipeStartX = null;
    pageSwipeStartY = null;
    startMushafWheelLongPress(touch);
    return;
  }

  pageSwipeStartX = touch.clientX;
  pageSwipeStartY = touch.clientY;
}

function handlePageSwipeMove(event) {
  const trackedTouch = getTrackedTouchFromEvent(event);

  if (wheelState.active) {
    if (!trackedTouch) return;
    event.preventDefault();
    updateMushafWheelSelectionFromTouch(trackedTouch);
    return;
  }

  if (isWheelLongPressPending() && trackedTouch) {
    const dx = trackedTouch.clientX - wheelState.startX;
    const dy = trackedTouch.clientY - wheelState.startY;
    if (Math.hypot(dx, dy) > WHEEL_CANCEL_MOVE_PX) {
      const fallbackStartX = wheelState.startX;
      const fallbackStartY = wheelState.startY;
      cancelMushafWheelInteraction();
      pageSwipeStartX = fallbackStartX;
      pageSwipeStartY = fallbackStartY;
    } else {
      return;
    }
  }

  if (pageSwipeStartX === null || pageSwipeStartY === null) return;
  const touch = event.touches ? event.touches[0] : event;
  const dx = touch.clientX - pageSwipeStartX;
  const dy = touch.clientY - pageSwipeStartY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
    event.preventDefault();
  }
}

function handlePageSwipeEnd(event) {
  if (wheelState.active) {
    const selectedSurah = clampSurahNumber(wheelState.selectedSurah || modalState.surahNumber || 1);
    cancelMushafWheelInteraction();
    pageSwipeStartX = null;
    pageSwipeStartY = null;
    if (event.cancelable) {
      event.preventDefault();
    }
    void commitWheelSelection(selectedSurah);
    return;
  }

  if (isWheelLongPressPending()) {
    cancelMushafWheelInteraction();
    pageSwipeStartX = null;
    pageSwipeStartY = null;
    return;
  }

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

function handlePageSwipeCancel() {
  cancelMushafWheelInteraction();
  pageSwipeStartX = null;
  pageSwipeStartY = null;
}

function handleMushafContextMenu(event) {
  if (!isPageViewActive()) return;
  if (event.cancelable) {
    event.preventDefault();
  }
}

function setPageControlsEnabled(enabled) {
  if (!elements.pageInput || !elements.pagePrevBtn || !elements.pageNextBtn) return;
  elements.pageInput.disabled = !enabled;
  elements.pagePrevBtn.disabled = !enabled || modalState.pageNumber <= 1;
  elements.pageNextBtn.disabled = !enabled || modalState.pageNumber >= TOTAL_PAGES;
  if (elements.mushafZoom) {
    elements.mushafZoom.disabled = !enabled;
  }
  if (elements.pagePrevBtnBottom && elements.pageNextBtnBottom) {
    elements.pagePrevBtnBottom.disabled = !enabled || modalState.pageNumber <= 1;
    elements.pageNextBtnBottom.disabled = !enabled || modalState.pageNumber >= TOTAL_PAGES;
  }
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
  if (elements.pagePrevBtnBottom && elements.pageNextBtnBottom) {
    elements.pagePrevBtnBottom.disabled = page <= 1;
    elements.pageNextBtnBottom.disabled = page >= TOTAL_PAGES;
  }
}

function getSurahNameFromMeta(surahNumber) {
  const meta = surahMeta.get(clampSurahNumber(surahNumber));
  return meta?.englishName || "";
}

function updateAyahBounds(surahNumber, totalAyahs) {
  if (!elements.ayahInput) return;
  const meta = surahMeta.get(clampSurahNumber(surahNumber));
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

  if (elements.mushafZoom) {
    elements.mushafZoom.value = String(clampMushafZoom(modalState.mushafZoom));
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
        const safeSurah = clampSurahNumber(surah.number);
        surahMeta.set(Number(surah.number), {
          englishName: surah.englishName,
          arabicName: surah.name || getSurahArabicNameFromFallback(safeSurah),
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
    arabicName: getSurahArabicNameFromFallback(index + 1),
    numberOfAyahs: null,
  }));

  surahMeta = new Map();
  fallback.forEach((surah) => {
    surahMeta.set(Number(surah.number), {
      englishName: surah.englishName,
      arabicName: surah.arabicName,
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

function normalizeMainLanguageKeys(keysInput) {
  const keys = Array.isArray(keysInput)
    ? keysInput
    : String(keysInput || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  const normalized = keys
    .map((key) => String(key || "").trim())
    .filter((key) => TRANSLATIONS[key]);

  if (!normalized.length) {
    return [DEFAULT_MAIN_LANGUAGE_KEY];
  }

  return [normalized[0]];
}

function setMainLanguageKeys(keysInput) {
  const normalized = normalizeMainLanguageKeys(keysInput);
  if (elements.languageOptions) {
    elements.languageOptions.value = normalized[0] || DEFAULT_MAIN_LANGUAGE_KEY;
  }
  return normalized;
}

function hasAnyRouteParams(searchParams) {
  const params = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams();
  return ROUTE_PARAM_KEYS.some((key) => params.has(key));
}

function normalizeRouteState(routeState = {}) {
  const normalized = {
    q: "",
    lang: [DEFAULT_MAIN_LANGUAGE_KEY],
    page: 1,
    view: "",
    surah: 1,
    ayah: 1,
    mushafPage: 1,
    zoom: MUSHAF_ZOOM_LEVELS[0],
    modalLang: "",
    modalMode: DEFAULT_MODAL_MODE,
  };

  normalized.q = String(routeState.q || "").trim();
  normalized.lang = normalizeMainLanguageKeys(routeState.lang);

  const parsedPage = Number.parseInt(routeState.page, 10);
  if (Number.isFinite(parsedPage) && parsedPage > 0) {
    normalized.page = parsedPage;
  }

  const viewValue = String(routeState.view || "").toLowerCase();
  if (viewValue === "mushaf" || viewValue === "surah") {
    normalized.view = viewValue;
  }

  normalized.surah = Math.min(
    Math.max(1, Number.parseInt(routeState.surah, 10) || 1),
    TOTAL_SURAHS
  );
  normalized.ayah = Math.max(1, Number.parseInt(routeState.ayah, 10) || 1);
  normalized.mushafPage = clampPageNumber(routeState.mushafPage);
  normalized.zoom = clampMushafZoom(routeState.zoom);

  const modalModeValue = String(routeState.modalMode || "").toLowerCase();
  normalized.modalMode = modalModeValue === "search" ? "search" : DEFAULT_MODAL_MODE;

  const modalLangValue = String(routeState.modalLang || "").toLowerCase();
  if (modalLangValue === "arabic" || TRANSLATIONS[modalLangValue]) {
    normalized.modalLang = modalLangValue;
  }

  if (!normalized.q) {
    normalized.page = 1;
  }

  if (normalized.view === "mushaf") {
    normalized.modalLang = "arabic";
  } else if (normalized.view === "surah") {
    if (!normalized.modalLang || normalized.modalLang === "arabic") {
      normalized.modalLang = normalized.lang[0] || DEFAULT_MAIN_LANGUAGE_KEY;
    }
  } else {
    normalized.modalLang = "";
    normalized.modalMode = DEFAULT_MODAL_MODE;
  }

  return normalized;
}

function captureAppRouteState() {
  const modalOpen = Boolean(elements.modal?.classList.contains("is-open"));
  const view = modalOpen
    ? (isPageViewActive() ? "mushaf" : "surah")
    : "";
  const mainLangKeys = normalizeMainLanguageKeys(getSelectedLanguageKeys());
  const modalLang = view === "mushaf"
    ? "arabic"
    : (modalState.arabicOnly ? "arabic" : (modalState.translationKeys[0] || mainLangKeys[0] || DEFAULT_MAIN_LANGUAGE_KEY));

  return normalizeRouteState({
    q: state.currentQuery,
    lang: mainLangKeys,
    page: state.currentPage + 1,
    view,
    surah: modalState.surahNumber,
    ayah: modalState.ayahNumber,
    mushafPage: modalState.pageNumber,
    zoom: modalState.mushafZoom,
    modalLang: view ? modalLang : "",
    modalMode: modalState.mode,
  });
}

function parseRouteStateFromUrl(searchParams) {
  const params = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams();
  const languageKeys = params
    .get("lang")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalizeRouteState({
    q: params.get("q") || "",
    lang: languageKeys,
    page: Number.parseInt(params.get("page"), 10),
    view: params.get("view") || "",
    surah: Number.parseInt(params.get("surah"), 10),
    ayah: Number.parseInt(params.get("ayah"), 10),
    mushafPage: Number.parseInt(params.get("mushafPage"), 10),
    zoom: Number.parseInt(params.get("zoom"), 10),
    modalLang: params.get("modalLang") || "",
    modalMode: params.get("modalMode") || DEFAULT_MODAL_MODE,
  });
}

function buildSearchParamsFromRouteState(routeStateInput) {
  const routeState = normalizeRouteState(routeStateInput);
  const params = new URLSearchParams();

  if (routeState.q) {
    params.set("q", routeState.q);
  }

  if (!(routeState.lang.length === 1 && routeState.lang[0] === DEFAULT_MAIN_LANGUAGE_KEY)) {
    params.set("lang", routeState.lang[0]);
  }

  if (routeState.q && routeState.page > 1) {
    params.set("page", String(routeState.page));
  }

  if (routeState.view) {
    params.set("view", routeState.view);
    params.set("surah", String(routeState.surah));
    params.set("ayah", String(routeState.ayah));

    if (routeState.view === "mushaf") {
      params.set("mushafPage", String(routeState.mushafPage));
    }

    if (routeState.zoom !== MUSHAF_ZOOM_LEVELS[0]) {
      params.set("zoom", String(routeState.zoom));
    }

    if (routeState.view === "surah") {
      const defaultModalLang = routeState.lang[0] || DEFAULT_MAIN_LANGUAGE_KEY;
      if (routeState.modalLang && routeState.modalLang !== defaultModalLang) {
        params.set("modalLang", routeState.modalLang);
      }
    }

    if (routeState.modalMode !== DEFAULT_MODAL_MODE) {
      params.set("modalMode", routeState.modalMode);
    }
  }

  return params;
}

function saveRouteBackup(routeStateInput) {
  if (!window?.localStorage) return;

  try {
    const routeState = normalizeRouteState(routeStateInput);
    const payload = {
      version: ROUTE_BACKUP_VERSION,
      savedAt: Date.now(),
      state: routeState,
    };
    window.localStorage.setItem(ROUTE_BACKUP_KEY, JSON.stringify(payload));
  } catch (error) {
    // storage may be unavailable or full
  }
}

function loadRouteBackup() {
  if (!window?.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(ROUTE_BACKUP_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const isValidObject = parsed && typeof parsed === "object";
    if (!isValidObject || parsed.version !== ROUTE_BACKUP_VERSION) {
      window.localStorage.removeItem(ROUTE_BACKUP_KEY);
      return null;
    }

    const savedAt = Number(parsed.savedAt);
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > ROUTE_BACKUP_MAX_AGE_MS) {
      window.localStorage.removeItem(ROUTE_BACKUP_KEY);
      return null;
    }

    return normalizeRouteState(parsed.state || {});
  } catch (error) {
    try {
      window.localStorage.removeItem(ROUTE_BACKUP_KEY);
    } catch (cleanupError) {
      // ignore cleanup errors
    }
    return null;
  }
}

function syncRouteState(options = {}) {
  const { history = "replace", saveBackup = true } = options;
  if (isApplyingRouteState) return;

  const routeState = captureAppRouteState();
  const params = buildSearchParamsFromRouteState(routeState);
  const queryString = params.toString();
  const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (nextUrl !== currentUrl && window?.history) {
    const method = history === "push" ? "pushState" : "replaceState";
    if (typeof window.history[method] === "function") {
      window.history[method]({}, "", nextUrl);
    }
  }

  if (saveBackup) {
    saveRouteBackup(routeState);
  }
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
  const {
    pageIndex = 0,
    syncRoute = true,
    historyMode = "replace",
  } = options;
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
    if (syncRoute) {
      syncRouteState({ history: historyMode });
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

  const safePageNumber = Number(pageNumber) || 1;
  const safeLabel = surahLabel ? escapeHtml(surahLabel) : "المصحف الشريف";
  const pageNumberArabic = toArabicIndic(safePageNumber);
  const parityClass = safePageNumber % 2 === 0 ? "is-even" : "is-odd";

  return `
    <div class="page-frame ${parityClass}">
      <div class="page-spine-shadow" aria-hidden="true"></div>
      <div class="page-header">
        <span class="page-meta">${safeLabel}</span>
      </div>
      <div class="page-text-wrap">
        <div class="page-text">${pageText}</div>
      </div>
      <div class="page-footer">
        <span class="page-number-medallion" aria-label="Page ${safePageNumber}">
          ${pageNumberArabic}
        </span>
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
  const editions = [ARABIC_MEDINA_EDITION, ARABIC_EDITION];

  for (const edition of editions) {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${reference}/${edition}`
      );
      if (!response.ok) continue;
      const data = await response.json();
      const ayahData = data.data || {};
      const page =
        ayahData.page ||
        ayahData.pageNumber ||
        ayahData.page_number ||
        null;
      if (page) {
        return clampPageNumber(page);
      }
    } catch (error) {
      // try next edition
    }
  }

  // Final fallback: fetch full surah and derive page from ayah metadata.
  for (const edition of editions) {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`
      );
      if (!response.ok) continue;
      const data = await response.json();
      const ayahs = Array.isArray(data?.data?.ayahs) ? data.data.ayahs : [];
      const targetAyah = ayahs.find(
        (ayah) => Number(ayah?.numberInSurah) === Number(ayahNumber)
      );
      const page =
        targetAyah?.page ||
        targetAyah?.pageNumber ||
        targetAyah?.page_number ||
        null;
      if (page) {
        return clampPageNumber(page);
      }
    } catch (error) {
      // try next edition
    }
  }

  throw new Error("Ayah lookup failed");
}

async function openPageView(pageNumber, options = {}) {
  const {
    highlightKey = "",
    historyMode = "replace",
    suppressRouteSync = false,
  } = options;
  const requestId = ++modalRenderRequestId;
  const targetPage = clampPageNumber(pageNumber);
  cancelMushafWheelInteraction();

  if (!modalState.arabicOnly || modalState.translationKeys.length) {
    modalState.arabicOnly = true;
    modalState.translationKeys = [];
    if (elements.modalTranslation) {
      elements.modalTranslation.value = "arabic";
    }
  }
  modalState.pageNumber = targetPage;

  updateMedinaStyles();

  if (!elements.modal.classList.contains("is-open")) {
    openModal();
  }

  if (!suppressRouteSync) {
    syncRouteState({ history: historyMode });
  }

  elements.modalTitle.textContent = "Quran Mushaf";
  elements.modalSubtitle.textContent = `Page ${targetPage}`;
  const loadingSpread = getDesktopSpreadPages(targetPage);
  const loadingPages = [loadingSpread.leftPage]
    .concat(loadingSpread.rightPage ? [loadingSpread.rightPage] : [])
    .filter(Boolean)
    .map((page) => ({
      pageNumber: page,
      state: "loading",
      isCurrent: page === targetPage,
    }));
  elements.surahContainer.innerHTML = buildMushafImageMarkup({
    pages: loadingPages,
    zoomPercent: modalState.mushafZoom,
  });

  syncPageControls(targetPage);
  syncModalControls();

  try {
    const translationEdition =
      !modalState.arabicOnly && modalState.translationKeys.length
        ? TRANSLATIONS[modalState.translationKeys[0]]?.edition
        : null;
    const arabicPagePromise = (async () => {
      try {
        const response = await fetch(
          `https://api.alquran.cloud/v1/page/${targetPage}/${ARABIC_MEDINA_EDITION}`
        );
        if (!response.ok) {
          throw new Error("Page request failed");
        }
        return response.json();
      } catch (error) {
        const fallbackResponse = await fetch(
          `https://api.alquran.cloud/v1/page/${targetPage}/${ARABIC_EDITION}`
        );
        if (!fallbackResponse.ok) {
          throw error;
        }
        return fallbackResponse.json();
      }
    })();

    const translationPromise = (async () => {
      if (!translationEdition) return null;
      try {
        const translationResponse = await fetch(
          `https://api.alquran.cloud/v1/page/${targetPage}/${translationEdition}`
        );
        if (!translationResponse.ok) return null;
        return translationResponse.json();
      } catch (error) {
        return null;
      }
    })();

    const [data, translationData] = await Promise.all([
      arabicPagePromise,
      translationPromise,
    ]);
    if (requestId !== modalRenderRequestId) return;

    const parsed = parsePageData(data, highlightKey);
    let translationMarkup = "";
    if (translationData?.data?.ayahs?.length) {
      const label = TRANSLATIONS[modalState.translationKeys[0]]?.label || "Translation";
      translationMarkup = buildPageTranslationPanel(
        translationData.data.ayahs,
        label,
        highlightKey
      );
    }

    const spreadPages = getDesktopSpreadPages(parsed.pageNumber);
    const orderedPages = [spreadPages.leftPage]
      .concat(spreadPages.rightPage ? [spreadPages.rightPage] : [])
      .filter(Boolean);
    const resolvedImageUrls = await Promise.all(
      orderedPages.map((page) => resolveMushafImageUrl(page))
    );
    if (requestId !== modalRenderRequestId) return;
    const pageImageMap = new Map();
    orderedPages.forEach((page, index) => {
      pageImageMap.set(page, resolvedImageUrls[index] || "");
    });

    const currentImageUrl = pageImageMap.get(parsed.pageNumber) || "";
    const spreadTiles = orderedPages.map((page) => {
      const imageUrl = pageImageMap.get(page) || "";
      return imageUrl
        ? {
            pageNumber: page,
            imageUrl,
            state: "ready",
            isCurrent: page === parsed.pageNumber,
          }
        : {
            pageNumber: page,
            state: "error",
            errorMessage: `Missing: ${getExpectedMushafPathLabel(page)}`,
            isCurrent: page === parsed.pageNumber,
          };
    });

    if (currentImageUrl) {
      elements.surahContainer.innerHTML =
        buildMushafImageMarkup({
          pages: spreadTiles,
          zoomPercent: modalState.mushafZoom,
        }) + translationMarkup;
      spreadTiles
        .filter((tile) => tile.state === "ready")
        .forEach((tile) => preloadAdjacentMushafPages(tile.pageNumber));
    } else if (ENABLE_TEXT_PAGE_FALLBACK) {
      const expectedPathLabel = getExpectedMushafPathLabel(parsed.pageNumber);
      const fallbackNotice = `
        <div class="mushaf-image-warning">
          Page image missing for page ${parsed.pageNumber}. Showing text fallback.
          <div class="mushaf-image-path">Expected: ${escapeHtml(expectedPathLabel)}</div>
        </div>
      `;
      elements.surahContainer.innerHTML =
        fallbackNotice +
        (parsed.html || "<div class=\"empty-state\">Unable to load this page.</div>") +
        translationMarkup;
    } else {
      elements.surahContainer.innerHTML =
        buildMushafImageMarkup({
          pages: spreadTiles,
          zoomPercent: modalState.mushafZoom,
        }) + translationMarkup;
    }

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
    applyMushafZoomToCurrentView();

    if (!suppressRouteSync) {
      syncRouteState({ history: "replace" });
    }

    requestAnimationFrame(() => {
      centerHighlightedVerse();
    });
  } catch (error) {
    if (requestId !== modalRenderRequestId) return;
    const spreadPages = getDesktopSpreadPages(targetPage);
    const orderedPages = [spreadPages.leftPage]
      .concat(spreadPages.rightPage ? [spreadPages.rightPage] : [])
      .filter(Boolean);
    const resolvedImageUrls = await Promise.all(
      orderedPages.map((page) => resolveMushafImageUrl(page).catch(() => ""))
    );
    if (requestId !== modalRenderRequestId) return;
    const spreadTiles = orderedPages.map((page, index) => {
      const imageUrl = resolvedImageUrls[index] || "";
      return imageUrl
        ? {
            pageNumber: page,
            imageUrl,
            state: "ready",
            isCurrent: page === targetPage,
          }
        : {
            pageNumber: page,
            state: "error",
            errorMessage: `Missing: ${getExpectedMushafPathLabel(page)}`,
            isCurrent: page === targetPage,
          };
    });

    if (spreadTiles.some((tile) => tile.state === "ready")) {
      elements.surahContainer.innerHTML = `
        <div class="mushaf-image-warning">
          Verse metadata is unavailable right now. Showing page image only.
        </div>
        ${buildMushafImageMarkup({
          pages: spreadTiles,
          zoomPercent: modalState.mushafZoom,
        })}
      `;
      applyMushafZoomToCurrentView();
      return;
    }

    elements.surahContainer.innerHTML = buildMushafImageMarkup({
      pages: [{
        pageNumber: targetPage,
        state: "error",
        errorMessage: "Unable to load this page right now.",
        isCurrent: true,
      }],
      zoomPercent: modalState.mushafZoom,
    });

    if (!suppressRouteSync) {
      syncRouteState({ history: "replace" });
    }
  }
}

async function openSurahModal(surahNumber, ayahNumber, surahName, options = {}) {
  const {
    mode,
    translationSelection,
    updateControls = true,
    historyMode = "replace",
    suppressRouteSync = false,
  } = options;
  const requestId = ++modalRenderRequestId;

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

    if (requestId !== modalRenderRequestId) return;
    await openPageView(pageNumber, {
      highlightKey: `${normalizedSurah}:${normalizedAyah}`,
      historyMode,
      suppressRouteSync,
    });
    return;
  }

  openModal();
  updateMedinaStyles();

  if (!suppressRouteSync) {
    syncRouteState({ history: historyMode });
  }

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
    if (requestId !== modalRenderRequestId) return;
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

    if (!suppressRouteSync) {
      syncRouteState({ history: "replace" });
    }

    requestAnimationFrame(() => {
      centerHighlightedVerse();
    });
  } catch (error) {
    if (requestId !== modalRenderRequestId) return;
    elements.surahContainer.innerHTML =
      "<div class=\"empty-state\">Unable to load this surah.</div>";
    if (!suppressRouteSync) {
      syncRouteState({ history: "replace" });
    }
  }
}

function openModal() {
  elements.modal.classList.add("is-open");
  elements.modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  syncNavigationLayout();
}

function closeModal(options = {}) {
  const { historyMode = "push", suppressRouteSync = false } = options;
  modalRenderRequestId += 1;
  cancelMushafWheelInteraction();
  elements.modal.classList.remove("is-open");
  elements.modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  setNavOverlay(false);
  if (!suppressRouteSync) {
    syncRouteState({ history: historyMode });
  }
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
  syncRouteState({ history: "replace" });
}

function handleLanguageChange() {
  updateEditionKey();
  if (state.results.length) {
    renderResults();
  }
  if (!modalState.translationTouched) {
    syncModalSelectionFromMain();
  }
  syncRouteState({ history: "replace" });
}

function handleBrowseClick() {
  if (!modalState.translationTouched) {
    syncModalSelectionFromMain();
  }
  openSurahModal(1, 1, getSurahNameFromMeta(1), {
    mode: "browse",
    historyMode: "push",
  });
}

function handleArabicQuickAccess() {
  openSurahModal(1, 1, getSurahNameFromMeta(1), {
    mode: "browse",
    historyMode: "push",
    translationSelection: {
      arabicOnly: true,
      keys: [],
    },
  });
}

async function handleModalNavSubmit(event) {
  event.preventDefault();
  const surahNumber = Number(elements.surahSelect.value) || 1;
  const ayahNumber = Number(elements.ayahInput.value) || 1;
  modalState.surahNumber = Math.min(Math.max(1, surahNumber), TOTAL_SURAHS);
  modalState.ayahNumber = Math.max(1, ayahNumber);
  syncModalControls();
  setNavOverlay(false);
  if (isMushafInteractionActive()) {
    if (!modalState.arabicOnly) {
      setModalTranslationSelection({ arabicOnly: true, keys: [] });
    }
    const highlightKey = `${surahNumber}:${ayahNumber}`;
    let targetPage = modalState.pageNumber || 1;
    try {
      const resolvedPage = await fetchAyahPageNumber(surahNumber, ayahNumber);
      if (resolvedPage) {
        targetPage = resolvedPage;
      }
    } catch (error) {
      // Keep current page fallback while still attempting highlight sync.
    }

    await openPageView(targetPage, { highlightKey, historyMode: "replace" });
    return;
  }

  await openSurahModal(surahNumber, ayahNumber, getSurahNameFromMeta(surahNumber), {
    mode: "browse",
    historyMode: "replace",
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
    openPageView(modalState.pageNumber || 1, {
      highlightKey,
      historyMode: "replace",
    });
    return;
  }

  openSurahModal(
    modalState.surahNumber,
    modalState.ayahNumber,
    getSurahNameFromMeta(modalState.surahNumber),
    {
      mode: modalState.mode,
      historyMode: "replace",
    }
  );
}

function handleMushafZoomChange() {
  if (!elements.mushafZoom) return;
  modalState.mushafZoom = clampMushafZoom(elements.mushafZoom.value);
  applyMushafZoomToCurrentView();
  syncRouteState({ history: "replace" });
}

function changeMushafPage(delta) {
  if (!isMushafInteractionActive()) return;
  const step = shouldUseTwoPageSpread() ? 2 : 1;
  const nextPage = clampPageNumber(modalState.pageNumber + (delta * step));
  if (nextPage === modalState.pageNumber) return;
  openPageView(nextPage);
}

function handlePageInputChange() {
  if (!isMushafInteractionActive()) return;
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

  openSurahModal(surahNumber, ayahNumber, surahName, {
    mode: "search",
    historyMode: "push",
  });
}

function handleModalClick(event) {
  const target = event.target;
  if (target.dataset.action === "close") {
    closeModal();
  }
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchVerseByTopic({ historyMode: "push" });
});
elements.browseBtn.addEventListener("click", handleBrowseClick);
elements.arabicQuickBtn.addEventListener("click", handleArabicQuickAccess);
elements.topic.addEventListener("input", () => autoResize(elements.topic));
elements.prevBtn.addEventListener("click", () => changePage(-1));
elements.nextBtn.addEventListener("click", () => changePage(1));
elements.languageOptions.addEventListener("change", handleLanguageChange);
elements.resultsList.addEventListener("click", handleResultsClick);
elements.modal.addEventListener("click", handleModalClick);
elements.modalNav.addEventListener("submit", handleModalNavSubmit);
if (elements.goBtn) {
  elements.goBtn.addEventListener("click", handleModalNavSubmit);
}
elements.surahSelect.addEventListener("change", handleSurahSelectChange);
elements.modalTranslation.addEventListener("change", handleModalTranslationChange);
elements.mushafZoom.addEventListener("change", handleMushafZoomChange);
elements.pagePrevBtn.addEventListener("click", () => changeMushafPage(-1));
elements.pageNextBtn.addEventListener("click", () => changeMushafPage(1));
elements.pageMenuBtnBottom.addEventListener("click", toggleNavOverlay);
elements.pagePrevBtnBottom.addEventListener("click", () => changeMushafPage(-1));
elements.pageNextBtnBottom.addEventListener("click", () => changeMushafPage(1));
elements.pageCloseBtnBottom.addEventListener("click", () => closeModal({ historyMode: "push" }));
elements.pageInput.addEventListener("change", handlePageInputChange);
elements.pageInput.addEventListener("keydown", handlePageInputKeydown);
elements.navToggle.addEventListener("click", toggleNavOverlay);
elements.navOverlay.addEventListener("click", handleNavOverlayClick);
elements.surahContainer.addEventListener("touchstart", handlePageSwipeStart, { passive: false });
elements.surahContainer.addEventListener("touchmove", handlePageSwipeMove, { passive: false });
elements.surahContainer.addEventListener("touchend", handlePageSwipeEnd, { passive: false });
elements.surahContainer.addEventListener("touchcancel", handlePageSwipeCancel, { passive: true });
elements.surahContainer.addEventListener("contextmenu", handleMushafContextMenu);
window.addEventListener("resize", () => {
  if (!elements.modal.classList.contains("is-open")) return;
  const inlineNow = useInlineNav();
  const spreadNow = shouldUseTwoPageSpread();
  const wheelStillAllowed = MOBILE_WHEEL_QUERY.matches;
  const layoutChanged =
    inlineNow !== lastInlineNavMode ||
    spreadNow !== lastTwoPageSpreadMode;

  lastInlineNavMode = inlineNow;
  lastTwoPageSpreadMode = spreadNow;

  if (!wheelStillAllowed) {
    cancelMushafWheelInteraction();
  }

  if (layoutChanged && isPageViewActive()) {
    cancelMushafWheelInteraction();
    syncNavigationLayout();
    openPageView(modalState.pageNumber, {
      highlightKey: `${modalState.surahNumber}:${modalState.ayahNumber}`,
      suppressRouteSync: true,
    });
    return;
  }

  syncNavigationLayout();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.modal.classList.contains("is-open")) return;
  if (
    elements.navOverlay &&
    elements.navOverlay.classList.contains("is-open") &&
    !useInlineNav()
  ) {
    setNavOverlay(false);
    return;
  }
  closeModal();
});

autoResize(elements.topic);
updateEditionKey();
syncNavigationLayout();
renderEmptyState("Search for a topic to see results.");

function applyLanguageFromParams(langParam) {
  if (!langParam) return;
  const key = langParam
    .split(",")
    .map((item) => item.trim())
    .find((item) => TRANSLATIONS[item]);

  if (!key) return;

  setMainLanguageKeys([key]);
}

async function applyRouteState(routeStateInput, options = {}) {
  const { suppressRouteSync = true } = options;
  const routeState = normalizeRouteState(routeStateInput);
  const applyId = ++routeApplyRequestId;
  isApplyingRouteState = true;

  try {
    setMainLanguageKeys(routeState.lang);
    updateEditionKey();

    if (!modalState.translationTouched) {
      syncModalSelectionFromMain();
    }

    if (routeState.q) {
      elements.topic.value = routeState.q;
      autoResize(elements.topic);
      await fetchVerseByTopic({
        pageIndex: Math.max(routeState.page - 1, 0),
        syncRoute: false,
      });
      if (applyId !== routeApplyRequestId) return;
    } else {
      state.results = [];
      state.currentPage = 0;
      state.pendingPage = 0;
      state.currentQuery = "";
      verseCache.clear();
      elements.topic.value = "";
      autoResize(elements.topic);
      renderEmptyState("Search for a topic to see results.");
      setStatus("", "info");
    }

    if (applyId !== routeApplyRequestId) return;

    modalState.mode = routeState.modalMode;
    modalState.mushafZoom = routeState.zoom;
    modalState.surahNumber = routeState.surah;
    modalState.ayahNumber = routeState.ayah;
    modalState.pageNumber = routeState.mushafPage;

    if (routeState.view === "mushaf") {
      setModalTranslationSelection({ arabicOnly: true, keys: [] }, { touch: true });
      await openPageView(routeState.mushafPage, {
        highlightKey: `${routeState.surah}:${routeState.ayah}`,
        suppressRouteSync: true,
      });
    } else if (routeState.view === "surah") {
      const modalLangKey =
        routeState.modalLang && routeState.modalLang !== "arabic"
          ? routeState.modalLang
          : (routeState.lang[0] || DEFAULT_MAIN_LANGUAGE_KEY);

      await openSurahModal(routeState.surah, routeState.ayah, getSurahNameFromMeta(routeState.surah), {
        mode: routeState.modalMode,
        translationSelection: {
          arabicOnly: false,
          keys: [modalLangKey],
        },
        suppressRouteSync: true,
      });
    } else {
      closeModal({ suppressRouteSync: true });
    }
  } finally {
    if (applyId === routeApplyRequestId) {
      isApplyingRouteState = false;
    }
  }

  if (!suppressRouteSync && applyId === routeApplyRequestId) {
    syncRouteState({ history: "replace" });
  }
}

async function bootstrapFromRoute() {
  const params = new URLSearchParams(window.location.search);
  const routeState = hasAnyRouteParams(params)
    ? parseRouteStateFromUrl(params)
    : (loadRouteBackup() || parseRouteStateFromUrl(params));

  await applyRouteState(routeState, { suppressRouteSync: true });
  syncRouteState({ history: "replace", saveBackup: true });
}

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const routeState = parseRouteStateFromUrl(params);
  applyRouteState(routeState, { suppressRouteSync: false });
});

bootstrapFromRoute();
loadSurahList();
