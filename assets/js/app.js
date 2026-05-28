"use strict";
import * as MathPro from './modules/math/index.js';

// ===== Application State =====
const APP_STATE = {
  tipstersData: {},
  bets: [],
  filters: {
    tipster: '',
    sport: '',
    outcome: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  },
  sortBy: 'date',
  sortOrder: 'desc',
  currentPage: 1,
  itemsPerPage: 10,
  theme: 'light',
  charts: {},
  oddsFormat: 'dec'
};

const ADMIN_STATE = {
  token: sessionStorage.getItem('BetTrackerAdminToken') || '',
  email: sessionStorage.getItem('BetTrackerAdminEmail') || '',
  editingBetId: ''
};

// ===== Constants =====
const STORAGE_KEY = 'BetTrackerPro_v1.0';
const DEFAULT_INITIAL_CAPITAL = 100;
const TIPSTER_NAMES = Array.from({ length: 12 }, (_, i) => `Tippad\u00f3 ${i + 1}`);
const SPORTS = [
  "\u26bd Labdar\u00fag\u00e1s",
  "\ud83c\udfc0 Kos\u00e1rlabda",
  "\ud83c\udfbe Tenisz",
  "\u26be Baseball",
  "\ud83c\udfc8 Amerikai Foci",
  "\ud83c\udfcf Krikett",
  "\ud83c\udfd2 J\u00e9gkorong",
  "\ud83c\udfd0 R\u00f6plabda",
  "\ud83e\udd4a \u00d6k\u00f6lv\u00edv\u00e1s",
  "\ud83e\udd4b MMA/UFC",
  "\ud83c\udfaf Darts",
  "\ud83c\udfb1 Snooker",
  "\ud83c\udfce\ufe0f Forma 1",
  "\ud83d\udc0e L\u00f3verseny",
  "\ud83d\udd79\ufe0f eSport",
  "\u2753 Egy\u00e9b"
];

const SPORT_GROUPS = [
  { key: 'football', label: '\u26bd Labdar\u00fag\u00e1s' },
  { key: 'basketball', label: '\ud83c\udfc0 Kos\u00e1rlabda' },
  { key: 'tennis', label: '\ud83c\udfbe Tenisz' },
  { key: 'baseball', label: '\u26be Baseball' },
  { key: 'hockey', label: '\ud83c\udfd2 J\u00e9gkorong' },
  { key: 'american-football', label: '\ud83c\udfc8 Amerikai foci' },
  { key: 'australian-football', label: '\ud83c\udfc9 Ausztr\u00e1l futball' },
  { key: 'cricket', label: '\ud83c\udfcf Krikett' },
  { key: 'volleyball', label: '\ud83c\udfd0 R\u00f6plabda' },
  { key: 'combat', label: '\ud83e\udd4a K\u00fczd\u0151sportok' },
  { key: 'darts', label: '\ud83c\udfaf Darts' },
  { key: 'snooker', label: '\ud83c\udfb1 Snooker' },
  { key: 'motorsport', label: '\ud83c\udfce\ufe0f Aut\u00f3sport' },
  { key: 'horse-racing', label: '\ud83d\udc0e L\u00f3verseny' },
  { key: 'esport', label: '\ud83d\udd79\ufe0f eSport' },
  { key: 'other', label: '\u2753 Egy\u00e9b' }
];

const SPORT_GROUP_ORDER = new Map(SPORT_GROUPS.map((sport, index) => [sport.key, index]));
const SPORT_GROUP_LABELS = new Map(SPORT_GROUPS.map(sport => [sport.key, sport.label]));

const SPORT_SUFFIX_LABELS = new Map([
  ['mlb', 'MLB'],
  ['mlb total', 'MLB - \u00f6sszes fut\u00e1s'],
  ['mlb player prop', 'MLB - j\u00e1t\u00e9kospiac'],
  ['nba', 'NBA'],
  ['nba spread', 'NBA - hendikep'],
  ['wnba', 'WNBA'],
  ['wnba total', 'WNBA - \u00f6sszpontsz\u00e1m'],
  ['wnba player prop', 'WNBA - j\u00e1t\u00e9kospiac'],
  ['roland garros', 'Roland Garros'],
  ['french open', 'Roland Garros'],
  ['international friendly', 'nemzetk\u00f6zi bar\u00e1ts\u00e1gos'],
  ['friendly', 'bar\u00e1ts\u00e1gos m\u00e9rk\u0151z\u00e9s'],
  ['egypt premier league', 'Egyiptomi Premier League'],
  ['copa libertadores', 'Copa Libertadores'],
  ['copa sudamericana', 'Copa Sudamericana'],
  ['portugal playoff', 'portug\u00e1l oszt\u00e1lyoz\u00f3'],
  ['norway cup', 'norv\u00e9g kupa'],
  ['poland 1. liga ht', 'lengyel 1. Liga - f\u00e9lid\u0151'],
  ['rwanda premier league', 'ruandai Premier League'],
  ['bulgaria', 'Bulg\u00e1ria'],
  ['danish 1st division', 'd\u00e1n 1. oszt\u00e1ly'],
  ['la liga', 'La Liga'],
  ['mls', 'MLS'],
  ['iihf vb', 'IIHF-vil\u00e1gbajnoks\u00e1g'],
  ['stanley cup playoffs', 'Stanley-kupa r\u00e1j\u00e1tsz\u00e1s']
]);

// ===== DOM Elements Cache =====
const DOM = {};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', init);

function init() {
  cacheDOMElements();
  initTipstersData();
  loadFromStorage();
  normalizeDefaultTipsterNames();
  setupEventListeners();
  populateSelects();
  clearForm();
  applyTheme();
  updateAdminUI();
  initCharts();
  refreshUI();
  syncPublicStateFromServer();
  showNotification('Alkalmaz\u00e1s sikeresen bet\u00f6ltve!', 'success');
  window.MathPro = MathPro;
}

function cacheDOMElements() {
  // Theme
  DOM.themeToggle = document.getElementById('themeToggle');

  // Navigation
  DOM.navLinks = document.querySelectorAll('.nav-link');

  // Form elements
  DOM.betForm = document.getElementById('betForm');
  DOM.tipsterSelect = document.getElementById('tipsterSelect');
  DOM.sportSelect = document.getElementById('sportSelect');
  DOM.teamInput = document.getElementById('teamInput');
  DOM.betAmountInput = document.getElementById('betAmountInput');
  DOM.oddsInput = document.getElementById('oddsInput');
  DOM.outcomeSelect = document.getElementById('outcomeSelect');
  DOM.betDateInput = document.getElementById('betDateInput');
  DOM.notesInput = document.getElementById('notesInput');
  DOM.adminEmailInput = document.getElementById('adminEmailInput');
  DOM.adminPasswordInput = document.getElementById('adminPasswordInput');
  DOM.adminLoginBtn = document.getElementById('adminLoginBtn');
  DOM.adminLogoutBtn = document.getElementById('adminLogoutBtn');
  DOM.adminStatus = document.getElementById('adminStatus');
  DOM.llmImportInput = document.getElementById('llmImportInput');
  DOM.llmApiKeyInput = document.getElementById('llmApiKeyInput');
  DOM.importTextJsonBtn = document.getElementById('importTextJsonBtn');
  DOM.uploadLlmApiBtn = document.getElementById('uploadLlmApiBtn');
  DOM.analyzeLlmApiBtn = document.getElementById('analyzeLlmApiBtn');
  DOM.clearImportTextBtn = document.getElementById('clearImportTextBtn');
  DOM.fillSampleImportBtn = document.getElementById('fillSampleImportBtn');
  DOM.llmApiResult = document.getElementById('llmApiResult');
  // Odds helpers
  DOM.oddsFormatSelect = document.getElementById('oddsFormatSelect');
  DOM.impliedProb = document.getElementById('impliedProb');

  // Filters
  DOM.filterBtn = document.getElementById('filterBtn');
  DOM.filtersSection = document.getElementById('filtersSection');
  DOM.filterTipster = document.getElementById('filterTipster');
  DOM.filterSport = document.getElementById('filterSport');
  DOM.filterOutcome = document.getElementById('filterOutcome');
  DOM.filterDateFrom = document.getElementById('filterDateFrom');
  DOM.filterDateTo = document.getElementById('filterDateTo');
  DOM.applyFiltersBtn = document.getElementById('applyFiltersBtn');
  DOM.clearFiltersBtn = document.getElementById('clearFiltersBtn');
  DOM.betsSearch = document.getElementById('betsSearch');

  // Tables
  DOM.betsTableBody = document.getElementById('betsTableBody');
  DOM.tipstersTableBody = document.getElementById('tipstersTableBody');

  // Stats
  DOM.totalBetsCount = document.getElementById('totalBetsCount');
  DOM.winRateStat = document.getElementById('winRateStat');
  DOM.totalProfitStat = document.getElementById('totalProfitStat');
  DOM.roiStat = document.getElementById('roiStat');
  DOM.winRateChange = document.getElementById('winRateChange');
  DOM.profitChange = document.getElementById('profitChange');
  DOM.roiChange = document.getElementById('roiChange');
  DOM.overviewStats = document.getElementById('overviewStats');
  DOM.sportsStats = document.getElementById('sportsStats');
  DOM.tipstersStats = document.getElementById('tipstersStats');
  DOM.totalCapital = document.getElementById('totalCapital');
  DOM.totalInitialCapital = document.getElementById('totalInitialCapital');
  DOM.betsCount = document.getElementById('betsCount');
  DOM.currentPage = document.getElementById('currentPage');
  DOM.pageNumbers = document.getElementById('pageNumbers');
  DOM.itemsPerPageSelect = document.getElementById('itemsPerPageSelect');

  // Buttons
  DOM.quickAddBtn = document.getElementById('quickAddBtn');
  DOM.sortBtn = document.getElementById('sortBtn');
  DOM.prevPageBtn = document.getElementById('prevPageBtn');
  DOM.nextPageBtn = document.getElementById('nextPageBtn');
  DOM.refreshStatsBtn = document.getElementById('refreshStatsBtn');
  DOM.exportTxtBtn = document.getElementById('exportTxtBtn');
  DOM.exportCsvBtn = document.getElementById('exportCsvBtn');
  DOM.exportJsonBtn = document.getElementById('exportJsonBtn');
  DOM.importJsonBtn = document.getElementById('importJsonBtn');
  DOM.jsonFileInput = document.getElementById('jsonFileInput');
  DOM.resetAllBtn = document.getElementById('resetAllBtn');
  DOM.addTipsterBtn = document.getElementById('addTipsterBtn');
  DOM.scrollToTopBtn = document.getElementById('scrollToTopBtn');

  // Modal
  DOM.modalOverlay = document.getElementById('modalOverlay');
  DOM.modalTitle = document.getElementById('modalTitle');
  DOM.modalMessage = document.getElementById('modalMessage');
  DOM.modalInput = document.getElementById('modalInput');
  DOM.modalConfirmBtn = document.getElementById('modalConfirmBtn');
  DOM.modalCancelBtn = document.getElementById('modalCancelBtn');

  // Tabs
  DOM.tabs = document.querySelectorAll('.tab');
  DOM.tabContents = document.querySelectorAll('.tab-content');
}

function setupEventListeners() {
  // Theme
  DOM.themeToggle.addEventListener('change', toggleTheme);

  // Navigation
  DOM.navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });

  // Form
  DOM.betForm.addEventListener('submit', handleAddBet);
  DOM.betForm.addEventListener('reset', () => setTimeout(clearFormState, 0));
  DOM.quickAddBtn.addEventListener('click', quickAddBet);

  // Filters
  DOM.filterBtn.addEventListener('click', toggleFilters);
  DOM.applyFiltersBtn.addEventListener('click', applyFilters);
  DOM.clearFiltersBtn.addEventListener('click', clearFilters);
  DOM.betsSearch.addEventListener('input', handleSearch);
  DOM.sortBtn.addEventListener('click', toggleSort);

  // Pagination
  DOM.prevPageBtn.addEventListener('click', () => changePage(-1));
  DOM.nextPageBtn.addEventListener('click', () => changePage(1));
  if (DOM.itemsPerPageSelect) {
    DOM.itemsPerPageSelect.addEventListener('change', (e) => {
      APP_STATE.itemsPerPage = parseInt(e.target.value, 10) || 10;
      APP_STATE.currentPage = 1;
      refreshUI();
    });
  }

  // Stats
  DOM.refreshStatsBtn.addEventListener('click', refreshStatistics);

  // Export/Import
  DOM.exportTxtBtn.addEventListener('click', exportTXT);
  DOM.exportCsvBtn.addEventListener('click', exportCSV);
  DOM.exportJsonBtn.addEventListener('click', exportJSON);
  DOM.importJsonBtn.addEventListener('click', () => DOM.jsonFileInput.click());
  DOM.jsonFileInput.addEventListener('change', importJSON);
  DOM.resetAllBtn.addEventListener('click', resetAllData);
  if (DOM.importTextJsonBtn) DOM.importTextJsonBtn.addEventListener('click', importTextJSON);
  if (DOM.uploadLlmApiBtn) DOM.uploadLlmApiBtn.addEventListener('click', () => sendLlmApiImport(true));
  if (DOM.analyzeLlmApiBtn) DOM.analyzeLlmApiBtn.addEventListener('click', () => sendLlmApiImport(false));
  if (DOM.clearImportTextBtn) DOM.clearImportTextBtn.addEventListener('click', () => { DOM.llmImportInput.value = ''; });
  if (DOM.fillSampleImportBtn) DOM.fillSampleImportBtn.addEventListener('click', fillSampleImport);

  // Tipsters
  if (DOM.addTipsterBtn) {
    DOM.addTipsterBtn.addEventListener('click', addNewTipster);
  }
  if (DOM.adminLoginBtn) DOM.adminLoginBtn.addEventListener('click', adminLogin);
  if (DOM.adminLogoutBtn) DOM.adminLogoutBtn.addEventListener('click', adminLogout);

  // Tabs
  DOM.tabs.forEach(tab => {
    tab.addEventListener('click', handleTabSwitch);
  });

  // Scroll
  window.addEventListener('scroll', handleScroll);
  DOM.scrollToTopBtn.addEventListener('click', scrollToTop);

  // Modal
  DOM.modalCancelBtn.addEventListener('click', closeModal);
  DOM.modalOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.modalOverlay) closeModal();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Odds helpers
  if (DOM.oddsInput && DOM.oddsFormatSelect && DOM.impliedProb) {
    const updateOddsDerived = () => {
      let val = DOM.oddsInput.value.trim();
      const fmt = APP_STATE.oddsFormat = DOM.oddsFormatSelect.value;
      let dec = 0;
      if (!val) { DOM.impliedProb.textContent = '--%'; return; }
      if (fmt === 'dec') {
        dec = parseFloat(val);
      } else if (fmt === 'amer') {
        const a = parseFloat(val);
        if (a > 0) dec = 1 + a/100;
        else dec = 1 + 100/Math.abs(a);
      }
      if (!isFinite(dec) || dec <= 1) { DOM.impliedProb.textContent = '--%'; return; }
      const p = 1/dec * 100;
      DOM.impliedProb.textContent = p.toFixed(2) + '%';
    };
    // General converters
    function getDecimalFrom(value, format) {
      if (format === 'dec') return parseFloat(value);
      const a = parseFloat(value);
      if (!isFinite(a) || a === 0) return NaN;
      return a > 0 ? (1 + a/100) : (1 + 100/Math.abs(a));
    }
    function getAmericanFromDecimal(dec) {
      if (!isFinite(dec) || dec <= 1) return NaN;
      return dec >= 2 ? Math.round((dec - 1) * 100) : -Math.round(100 / (dec - 1));
    }

    window.getDecimalOddsFromInput = function getDecimalOddsFromInput() {
      const fmt = APP_STATE.oddsFormat;
      return getDecimalFrom(DOM.oddsInput.value, fmt);
    };
    window.setOddsByDecimal = function setOddsByDecimal(dec) {
      if (!isFinite(dec)) return;
      const fmt = APP_STATE.oddsFormat;
      if (fmt === 'dec') {
        DOM.oddsInput.type = 'number';
        DOM.oddsInput.step = '0.01';
        DOM.oddsInput.min = '1.01';
        DOM.oddsInput.value = Number(dec).toFixed(2);
      } else {
        const amer = getAmericanFromDecimal(dec);
        DOM.oddsInput.type = 'text';
        DOM.oddsInput.value = String(amer);
      }
      updateOddsDerived();
    };
    const syncOddsToFormat = () => {
      let dec;
      if (DOM.oddsFormatSelect.value === 'dec') {
        // keep as is, just update implied
      } else {
        // when switching to amer, convert current dec -> amer for display
      }
      updateOddsDerived();
    };
    DOM.oddsInput.addEventListener('input', updateOddsDerived);
    // t\u00e1rold az el\u0151z\u0151 form\u00e1tumot, hogy pontos konverzi\u00f3 legyen
    DOM.oddsFormatSelect.addEventListener('focus', () => { DOM.oddsFormatSelect.dataset.prev = APP_STATE.oddsFormat; });
    DOM.oddsFormatSelect.addEventListener('mousedown', () => { DOM.oddsFormatSelect.dataset.prev = APP_STATE.oddsFormat; });
    DOM.oddsFormatSelect.addEventListener('change', () => {
      const prevFmt = DOM.oddsFormatSelect.dataset.prev || APP_STATE.oddsFormat;
      const currentValue = DOM.oddsInput.value;
      const dec = getDecimalFrom(currentValue, prevFmt);
      APP_STATE.oddsFormat = DOM.oddsFormatSelect.value;
      window.setOddsByDecimal(dec);
      DOM.oddsFormatSelect.dataset.prev = APP_STATE.oddsFormat;
      updateOddsDerived();
    });
    updateOddsDerived();
  }
}

// ===== Admin =====
function isAdminLoggedIn() {
  return Boolean(ADMIN_STATE.token);
}

function updateAdminUI() {
  if (!DOM.adminStatus) return;
  if (ADMIN_STATE.token) {
    DOM.adminStatus.textContent = 'Admin bel\u00fcl';
    DOM.adminStatus.className = 'badge badge-success';
  } else {
    DOM.adminStatus.textContent = 'Admin k\u00edv\u00fcl';
    DOM.adminStatus.className = 'badge badge-warning';
  }
  if (DOM.adminPasswordInput) DOM.adminPasswordInput.value = '';
}

async function adminLogin() {
  const email = DOM.adminEmailInput?.value.trim();
  const password = DOM.adminPasswordInput?.value || '';
  if (!email || !password) {
    showAlert('Email \u00e9s jelsz\u00f3 sz\u00fcks\u00e9ges az admin bel\u00e9p\u00e9shez.', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Sikertelen admin bel\u00e9p\u00e9s.');

    ADMIN_STATE.token = result.token;
    ADMIN_STATE.email = result.email;
    sessionStorage.setItem('BetTrackerAdminToken', ADMIN_STATE.token);
    sessionStorage.setItem('BetTrackerAdminEmail', ADMIN_STATE.email);
    updateAdminUI();
    await syncPublicStateFromServer();
    showNotification('Admin bel\u00e9p\u00e9s sikeres.', 'success');
  } catch (err) {
    showAlert(err instanceof Error ? err.message : 'Sikertelen admin bel\u00e9p\u00e9s.', 'error');
  }
}

function adminLogout() {
  ADMIN_STATE.token = '';
  ADMIN_STATE.email = '';
  sessionStorage.removeItem('BetTrackerAdminToken');
  sessionStorage.removeItem('BetTrackerAdminEmail');
  updateAdminUI();
  showNotification('Admin kijelentkez\u00e9s k\u00e9sz.', 'info');
}

async function adminRequest(path, options = {}) {
  if (!ADMIN_STATE.token) throw new Error('Admin bel\u00e9p\u00e9s sz\u00fcks\u00e9ges.');
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${ADMIN_STATE.token}`,
      ...(options.headers || {})
    }
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || `Admin API hiba: ${response.status}`);
  return result;
}

// ===== Tipsters Management =====
function initTipstersData() {
  TIPSTER_NAMES.forEach(name => {
    if (!APP_STATE.tipstersData[name]) {
      APP_STATE.tipstersData[name] = {
        initial_capital: 0,
        current_capital: 0,
        initial_set: false
      };
    }
  });
}

function addNewTipster() {
  showPrompt('\u00daj tippad\u00f3 neve:', '', async (name) => {
    if (name && !APP_STATE.tipstersData[name]) {
      try {
        if (isAdminLoggedIn()) {
          await adminRequest('/api/admin/tipsters', {
            method: 'POST',
            body: JSON.stringify({ name, initialCapital: DEFAULT_INITIAL_CAPITAL })
          });
          await syncPublicStateFromServer();
        } else {
          APP_STATE.tipstersData[name] = {
            initial_capital: DEFAULT_INITIAL_CAPITAL,
            current_capital: DEFAULT_INITIAL_CAPITAL,
            initial_set: true
          };
          normalizeDefaultTipsterNames();
          saveToStorage();
          refreshUI();
        }
        showNotification(name + ' sikeresen hozz\u00e1adva!', 'success');
      } catch (err) {
        showAlert(err instanceof Error ? err.message : 'Tippad\u00f3 hozz\u00e1ad\u00e1sa sikertelen.', 'error');
      }
    }
  });
}

function setTipsterCapital(name) {
  const data = APP_STATE.tipstersData[name];
  showPrompt(`Kezd\u0151 t\u0151ke ${name} sz\u00e1m\u00e1ra:`, data.initial_capital.toString(), (value) => {
    const capital = parseFloat(value);
    if (!isNaN(capital) && capital >= 0) {
      const diff = capital - data.initial_capital;
      data.initial_capital = capital;
      if (!data.initial_set) {
        data.current_capital = capital;
        data.initial_set = true;
      } else {
        data.current_capital += diff;
      }
      saveToStorage();
      refreshUI();
      showNotification('T\u0151ke sikeresen be\u00e1ll\u00edtva!', 'success');
    }
    // ha \u00e9rv\u00e9nytelen input, akkor is friss\u00edt\u00fcnk hogy bez\u00e1r\u00e1s ut\u00e1n friss UI legyen
    else {
      refreshUI();
    }
  });
}

// ===== Bet Management =====
async function handleAddBet(e) {
  e.preventDefault();

  if (!validateBetForm()) return;

  const tipster = DOM.tipsterSelect.value;
  const tipsterData = APP_STATE.tipstersData[tipster];

  if (!tipsterData.initial_set) {
    showAlert(`El\u0151sz\u00f6r \u00e1ll\u00edtsa be ${tipster} kezd\u0151 t\u0151k\u00e9j\u00e9t!`, 'warning');
    return;
  }

  const betAmount = parseFloat(DOM.betAmountInput.value);

  if (tipsterData.current_capital < betAmount) {
    showAlert(`Nincs elegend\u0151 t\u0151ke! (${tipsterData.current_capital.toFixed(2)} egys\u00e9g)`, 'error');
    return;
  }

  const decOddsForSave = window.getDecimalOddsFromInput();
  const bet = {
    id: generateId(),
    tipster: tipster,
    sport: DOM.sportSelect.value,
    team: DOM.teamInput.value.trim(),
    betAmount: betAmount,
    odds: decOddsForSave,
    outcome: DOM.outcomeSelect.value,
    date: DOM.betDateInput.value || new Date().toISOString(),
    notes: DOM.notesInput.value.trim()
  };

  // Duplicate protection: same tipster, team, date (day), stake, odds
  const normalizedDate = new Date(bet.date).toISOString().slice(0,10);
  const dup = APP_STATE.bets.find(b => 
    b.tipster === bet.tipster &&
    b.team.toLowerCase() === bet.team.toLowerCase() &&
    new Date(b.date).toISOString().slice(0,10) === normalizedDate &&
    Math.abs(b.betAmount - bet.betAmount) < 1e-9 &&
    Math.abs(b.odds - bet.odds) < 1e-9
  );
  if (dup) {
    showAlert('Duplik\u00e1lt fogad\u00e1snak t\u0171nik (azonos tippad\u00f3/csapat/d\u00e1tum/t\u00e9t/szorz\u00f3).', 'warning');
    return;
  }

  try {
    if (isAdminLoggedIn()) {
      if (ADMIN_STATE.editingBetId) {
        bet.id = ADMIN_STATE.editingBetId;
        await adminRequest('/api/admin/tips', {
          method: 'PATCH',
          body: JSON.stringify(bet)
        });
        ADMIN_STATE.editingBetId = '';
      } else {
        await adminRequest('/api/admin/tips', {
          method: 'POST',
          body: JSON.stringify({ bets: [bet] })
        });
      }
      await syncPublicStateFromServer();
    } else {
      APP_STATE.bets.push(bet);
      updateCapital(bet, 'place');
      saveToStorage();
      refreshUI();
    }
    clearForm();
    showNotification('Fogad\u00e1s sikeresen hozz\u00e1adva!', 'success');
  } catch (err) {
    showAlert(err instanceof Error ? err.message : 'Fogad\u00e1s ment\u00e9se sikertelen.', 'error');
  }
}

function validateBetForm() {
  let isValid = true;
  const fields = [
    { element: DOM.tipsterSelect, error: 'K\u00e9rj\u00fck v\u00e1lasszon tippad\u00f3t' },
    { element: DOM.sportSelect, error: 'K\u00e9rj\u00fck v\u00e1lasszon sport\u00e1gat' },
    { element: DOM.teamInput, error: 'K\u00e9rj\u00fck adja meg a m\u00e9rk\u0151z\u00e9st vagy piacot' },
    { element: DOM.betAmountInput, error: '\u00c9rv\u00e9nytelen t\u00e9t \u00f6sszeg', validator: (v) => parseFloat(v) > 0 }
  ];

  fields.forEach(field => {
    const value = field.element.value.trim();
    const errorElement = field.element.parentElement.querySelector('.form-error');

    if (!value || (field.validator && !field.validator(value))) {
      errorElement.classList.remove('hidden');
      errorElement.textContent = field.error;
      field.element.classList.add('error');
      isValid = false;
    } else {
      errorElement.classList.add('hidden');
      field.element.classList.remove('error');
    }
  });

  // Odds valid\u00e1ci\u00f3 form\u00e1tum szerint
  const oddsErrorEl = DOM.oddsInput.parentElement.querySelector('.form-error');
  const decOdds = window.getDecimalOddsFromInput();
  if (!(isFinite(decOdds) && decOdds >= 1.01)) {
    oddsErrorEl.classList.remove('hidden');
    oddsErrorEl.textContent = '\u00c9rv\u00e9nytelen szorz\u00f3';
    DOM.oddsInput.classList.add('error');
    isValid = false;
  } else {
    oddsErrorEl.classList.add('hidden');
    DOM.oddsInput.classList.remove('error');
  }

  return isValid;
}

function quickAddBet() {
  const sorted = getSortedTipsterNames();
  DOM.tipsterSelect.value = sorted[0] || '';
  DOM.sportSelect.value = SPORTS[0];
  DOM.teamInput.value = 'Gyors Fogad\u00e1s';
  DOM.betAmountInput.value = '10';
  window.setOddsByDecimal(1.85);
  DOM.outcomeSelect.value = 'pending';
  DOM.teamInput.focus();
}

function clearForm() {
  if (!DOM.betForm) return;
  DOM.betForm.reset();
  clearFormState();
}

function clearFormState() {
  document.querySelectorAll('.form-error').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  const now = new Date();
  if (DOM.betDateInput) DOM.betDateInput.value = now.toISOString().slice(0, 16);
}

async function updateBetOutcome(betId, newOutcome) {
  const bet = APP_STATE.bets.find(b => b.id === betId);
  if (!bet || bet.outcome === newOutcome) return;

  if (isAdminLoggedIn()) {
    try {
      await adminRequest('/api/admin/tips', {
        method: 'PATCH',
        body: JSON.stringify({ id: betId, outcome: newOutcome })
      });
      await syncPublicStateFromServer();
      showNotification('Fogad\u00e1s eredm\u00e9nye szerveren friss\u00edtve!', 'success');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Eredm\u00e9ny friss\u00edt\u00e9se sikertelen.', 'error');
    }
    return;
  }

  const tipsterData = APP_STATE.tipstersData[bet.tipster];
  if (!tipsterData) return;

  const payout = bet.betAmount * bet.odds;
  if (bet.outcome === 'win') {
    tipsterData.current_capital -= payout;
  }
  if (newOutcome === 'win') {
    tipsterData.current_capital += payout;
  }
  bet.outcome = newOutcome;

  saveToStorage();
  refreshUI();
  showNotification('Fogad\u00e1s eredm\u00e9nye friss\u00edtve!', 'success');
}

function deleteBet(betId) {
  showConfirm('Biztosan t\u00f6r\u00f6lni szeretn\u00e9 ezt a fogad\u00e1st?', async () => {
    try {
      if (isAdminLoggedIn()) {
        await adminRequest('/api/admin/tips', {
          method: 'DELETE',
          body: JSON.stringify({ id: betId })
        });
        await syncPublicStateFromServer();
      } else {
        const betIndex = APP_STATE.bets.findIndex(b => b.id === betId);
        if (betIndex === -1) return;
        APP_STATE.bets.splice(betIndex, 1);
        saveToStorage();
        refreshUI();
      }
      showNotification('Fogad\u00e1s t\u00f6r\u00f6lve!', 'success');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Fogad\u00e1s t\u00f6rl\u00e9se sikertelen.', 'error');
    }
  });
}

function updateCapital(bet, action) {
  const tipsterData = APP_STATE.tipstersData[bet.tipster];
  if (!tipsterData) return;

  switch (action) {
    case 'place':
      // On placement, deduct stake immediately; payout handled when marking 'win'
      tipsterData.current_capital -= bet.betAmount;
      break;

    case 'revert':
      // Revert to before placement
      tipsterData.current_capital += bet.betAmount;
      break;

    case 'apply':
      // Apply again baseline (stake deduction)
      tipsterData.current_capital -= bet.betAmount;
      break;
  }

  tipsterData.current_capital = Math.max(0, tipsterData.current_capital);
}

function deleteTipster(name) {
  if (!isAdminLoggedIn()) {
    showAlert('Tippad\u00f3 t\u00f6rl\u00e9s\u00e9hez admin bel\u00e9p\u00e9s sz\u00fcks\u00e9ges.', 'warning');
    return;
  }
  const hasBets = APP_STATE.bets.some(bet => bet.tipster === name);
  const message = hasBets
    ? `${name} tippad\u00f3hoz fogad\u00e1sok tartoznak. T\u00f6r\u00f6lj\u00fck a tippad\u00f3t \u00e9s az \u00f6sszes hozz\u00e1 tartoz\u00f3 fogad\u00e1st is?`
    : `Biztosan t\u00f6rl\u00f6d ezt a tippad\u00f3t: ${name}?`;

  showConfirm(message, async () => {
    try {
      await adminRequest('/api/admin/tipsters', {
        method: 'DELETE',
        body: JSON.stringify({ name, deleteBets: hasBets })
      });
      await syncPublicStateFromServer();
      showNotification('Tippad\u00f3 t\u00f6r\u00f6lve.', 'success');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Tippad\u00f3 t\u00f6rl\u00e9se sikertelen.', 'error');
    }
  });
}

// ===== UI Updates =====
function refreshUI() {
  // Ensure capitals are consistent with bets before rendering
  recalcAllCapitals();
  renderBetsTable();
  renderTipstersTable();
  refreshStatistics();
  updatePagination();
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPercent(value, digits = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return `${(numeric * 100).toFixed(digits)}%`;
}

function renderBetAnalysis(bet) {
  const analysis = bet.analysis || {};
  const chips = [];

  const ev = formatPercent(analysis.expectedValue, 1);
  if (ev) chips.push(`EV ${ev}`);

  const edge = formatPercent(analysis.edge, 1);
  if (edge) chips.push(`Edge ${edge}`);

  const modelProbability = formatPercent(analysis.modelProbability, 1);
  if (modelProbability) chips.push(`p ${modelProbability}`);

  const breakEven = formatPercent(analysis.breakEvenProbability, 1);
  if (breakEven) chips.push(`BE ${breakEven}`);

  const kelly = formatPercent(analysis.kellyFraction, 1);
  if (kelly) chips.push(`Kelly ${kelly}`);

  if (Number.isFinite(Number(analysis.minimumOdds))) {
    chips.push(`Min odds ${Number(analysis.minimumOdds).toFixed(2)}`);
  }

  if (!chips.length && !analysis.sourceSummary) return '';

  return `
    <br>
    <small class="text-muted">
      <strong>EV model:</strong> ${chips.map(escapeHTML).join(' | ')}
      ${analysis.sourceSummary ? `<br>${escapeHTML(analysis.sourceSummary)}` : ''}
    </small>
  `;
}

function renderBetsTable() {
  const filteredBets = getFilteredBets();
  const sortedBets = sortBets(filteredBets);
  const paginatedBets = paginateBets(sortedBets);

  DOM.betsTableBody.innerHTML = '';
  DOM.betsCount.textContent = filteredBets.length;

  paginatedBets.forEach(bet => {
    const row = document.createElement('tr');
    row.className = `bet-row bet-row-${bet.outcome}`;

    const date = new Date(bet.date);
    const formattedDate = date.toLocaleDateString('hu-HU');
    const potentialWin = (bet.betAmount * bet.odds).toFixed(2);

    row.innerHTML = `
      <td>
        <span class="table-mobile-label">D\u00e1tum:</span>
        ${formattedDate}
      </td>
      <td>
        <span class="table-mobile-label">Tippad\u00f3:</span>
        ${escapeHTML(bet.tipster)}
      </td>
      <td>
        <span class="table-mobile-label">Sport\u00e1g:</span>
        ${escapeHTML(formatSportLabel(bet.sport))}
      </td>
      <td>
        <span class="table-mobile-label">M\u00e9rk\u0151z\u00e9s / piac:</span>
        <strong>${escapeHTML(bet.team)}</strong>
        ${bet.notes ? `<br><small class="text-muted">${escapeHTML(bet.notes)}</small>` : ''}
        ${renderBetAnalysis(bet)}
      </td>
      <td>
        <span class="table-mobile-label">T\u00e9t:</span>
        ${bet.betAmount.toFixed(2)}
      </td>
      <td>
        <span class="table-mobile-label">Szorz\u00f3:</span>
        ${bet.odds.toFixed(2)}
      </td>
      <td>
        <span class="table-mobile-label">Lehets\u00e9ges:</span>
        ${potentialWin}
      </td>
      <td>
        <span class="table-mobile-label">Eredm\u00e9ny:</span>
        <select class="form-select" data-bet-id="${bet.id}">
          <option value="pending" ${bet.outcome === 'pending' ? 'selected' : ''}>\u23f3 F\u00fcgg\u0151ben</option>
          <option value="win" ${bet.outcome === 'win' ? 'selected' : ''}>\u2705 Nyert</option>
          <option value="lose" ${bet.outcome === 'lose' ? 'selected' : ''}>\u274c Vesztett</option>
        </select>
      </td>
      <td>
        <span class="table-mobile-label">M\u0171veletek:</span>
        <div class="btn-group">
          <button class="btn btn-sm btn-icon btn-secondary" data-action="edit-bet" data-id="${bet.id}" title="Szerkeszt\u00e9s">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-icon btn-danger" data-action="delete-bet" data-id="${bet.id}" title="T\u00f6rl\u00e9s">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    DOM.betsTableBody.appendChild(row);
  });

  // Delegate events once for edit/delete and result change
  if (!DOM.betsTableBody._delegated) {
    DOM.betsTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (!id) return;
      if (btn.dataset.action === 'edit-bet') {
        editBet(id);
      } else if (btn.dataset.action === 'delete-bet') {
        deleteBet(id);
      }
    });
    DOM.betsTableBody.addEventListener('change', (e) => {
      const sel = e.target.closest('select.form-select[data-bet-id]');
      if (sel) {
        const id = sel.getAttribute('data-bet-id');
        updateBetOutcome(id, sel.value);
      }
    });
    DOM.betsTableBody._delegated = true;
  }
}

function renderTipstersTable() {
  DOM.tipstersTableBody.innerHTML = '';

  let totalInitial = 0;
  let totalCurrent = 0;

  Object.entries(APP_STATE.tipstersData).forEach(([name, data]) => {
    if (!data.initial_set) return;

    const stats = calculateTipsterStats(name);
    const profitLoss = stats.netProfit;
    const roi = stats.roi;

    totalInitial += data.initial_capital;
    totalCurrent += data.current_capital;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <strong class="clickable-tipster text-primary" style="cursor: pointer; text-decoration: underline;" title="Sz\u0171r\u00e9s erre a tippad\u00f3ra">${name}</strong>
      </td>
      <td>${data.initial_capital.toFixed(2)}</td>
      <td class="${data.current_capital > data.initial_capital ? 'text-success' : data.current_capital < data.initial_capital ? 'text-error' : ''}">
        ${data.current_capital.toFixed(2)}
      </td>
      <td class="${profitLoss >= 0 ? 'text-success' : 'text-error'}">
        ${profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
      </td>
      <td class="${roi >= 0 ? 'text-success' : 'text-error'}">
        ${roi.toFixed(1)}%
      </td>
      <td>
        <strong style="font-size: 0.95rem;">${stats.total}</strong>
        <div style="font-size: 0.8rem; margin-top: 2px; display: flex; gap: 8px; font-family: var(--font-main);">
          <span class="text-success" style="font-weight: 600;" title="Nyert">${stats.wins} Ny</span>
          <span class="text-error" style="font-weight: 600;" title="Vesztett">${stats.losses} V</span>
          <span class="text-warning" style="font-weight: 600;" title="F\u00fcgg\u0151ben">${stats.pending} F</span>
        </div>
      </td>
      <td>${stats.winRate.toFixed(1)}%</td>
      <td>
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-secondary" data-action="capital" data-name="${name}">
            T\u0151ke
          </button>
          <button type="button" class="btn btn-sm btn-primary" data-action="details" data-name="${name}">
            R\u00e9szletek
          </button>
          ${isAdminLoggedIn() ? `<button type="button" class="btn btn-sm btn-danger" data-action="delete-tipster" data-name="${escapeHTML(name)}">T\u00f6rl\u00e9s</button>` : ''}
        </div>
      </td>
    `;

    DOM.tipstersTableBody.appendChild(row);
  });

  DOM.totalCapital.textContent = totalCurrent.toFixed(2);
  DOM.totalInitialCapital.textContent = totalInitial.toFixed(2);

  // Event delegation for dynamically rendered buttons
  if (!DOM.tipstersTableBody._delegated) {
    DOM.tipstersTableBody.addEventListener('click', (e) => {
      const tipsterNameEl = e.target.closest('.clickable-tipster');
      if (tipsterNameEl) {
        const name = tipsterNameEl.textContent.trim();
        if (name) {
          APP_STATE.filters.tipster = name;
          if (DOM.filterTipster) {
            DOM.filterTipster.value = name;
          }
          if (DOM.filtersSection) {
            DOM.filtersSection.classList.remove('hidden');
          }
          APP_STATE.currentPage = 1;

          // Switch statistics tab to tipsters
          const statsTabButton = Array.from(DOM.tabs).find(tab => tab.dataset.tab === 'tipsters');
          if (statsTabButton) {
            statsTabButton.click();
          }

          refreshUI();

          const betsSection = document.getElementById('betsSection');
          if (betsSection) {
            betsSection.scrollIntoView({ behavior: 'smooth' });
          }

          showNotification(`Sz\u0171r\u0151 alkalmazva: ${name}`, 'success');
        }
        return;
      }
      const capBtn = e.target.closest('[data-action="capital"]');
      if (capBtn) {
        const name = capBtn.getAttribute('data-name');
        if (name) setTipsterCapital(name);
        return;
      }
      const detBtn = e.target.closest('[data-action="details"]');
      if (detBtn) {
        const name = detBtn.getAttribute('data-name');
        if (name) viewTipsterDetails(name);
        return;
      }
      const delBtn = e.target.closest('[data-action="delete-tipster"]');
      if (delBtn) {
        const name = delBtn.getAttribute('data-name');
        if (name) deleteTipster(name);
      }
    });
    DOM.tipstersTableBody._delegated = true;
  }
}

function refreshStatistics() {
  const stats = calculateOverallStats();

  // Update quick stats
  DOM.totalBetsCount.textContent = stats.totalBets;
  DOM.winRateStat.textContent = `${stats.winRate}%`;
  DOM.totalProfitStat.textContent = stats.netProfit.toFixed(2);
  DOM.roiStat.textContent = `${stats.roi}%`;

  // Update change indicators
  updateChangeIndicator(DOM.winRateChange, stats.winRate, 50);
  updateChangeIndicator(DOM.profitChange, stats.netProfit, 0);
  updateChangeIndicator(DOM.roiChange, parseFloat(stats.roi), 0);

  // Update detailed stats
  updateDetailedStats();

  // Update charts
  updateCharts();
}

function updateChangeIndicator(element, value, threshold) {
  const numericValue = Number(value) || 0;
  const isPositive = numericValue > threshold;
  element.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${isPositive ? 
        '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>' : 
        '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>'}
    </svg>
    <span>${isPositive ? '+' : ''}${numericValue.toFixed(1)}%</span>
  `;
  element.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
}

function updateDetailedStats() {
  // Overview tab
  const overviewHTML = generateOverviewHTML();
  DOM.overviewStats.innerHTML = overviewHTML;

  // Sports tab
  const sportsHTML = generateSportsStatsHTML();
  DOM.sportsStats.innerHTML = sportsHTML;

  // Tipsters tab
  const tipstersHTML = generateTipstersStatsHTML();
  DOM.tipstersStats.innerHTML = tipstersHTML;
}

// ===== Filters & Search =====
function toggleFilters() {
  DOM.filtersSection.classList.toggle('hidden');
}

function applyFilters() {
  APP_STATE.filters.tipster = DOM.filterTipster.value;
  APP_STATE.filters.sport = DOM.filterSport.value;
  APP_STATE.filters.outcome = DOM.filterOutcome.value;
  APP_STATE.filters.dateFrom = DOM.filterDateFrom.value;
  APP_STATE.filters.dateTo = DOM.filterDateTo.value;

  APP_STATE.currentPage = 1;
  refreshUI();
  showNotification('Sz\u0171r\u0151k alkalmazva!', 'success');
}

function clearFilters() {
  DOM.filterTipster.value = '';
  DOM.filterSport.value = '';
  DOM.filterOutcome.value = '';
  DOM.filterDateFrom.value = '';
  DOM.filterDateTo.value = '';

  APP_STATE.filters = {
    tipster: '',
    sport: '',
    outcome: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  };

  APP_STATE.currentPage = 1;
  refreshUI();
  showNotification('Sz\u0171r\u0151k t\u00f6r\u00f6lve!', 'success');
}



function handleSearch() {
  APP_STATE.filters.search = DOM.betsSearch.value.toLowerCase();
  APP_STATE.currentPage = 1;
  refreshUI();
}

function getFilteredBets() {
  return APP_STATE.bets.filter(bet => {
    if (APP_STATE.filters.tipster && bet.tipster !== APP_STATE.filters.tipster) return false;
    if (APP_STATE.filters.sport) {
      if (getSportGroupKey(bet.sport) !== APP_STATE.filters.sport) return false;
    }
    if (APP_STATE.filters.outcome && bet.outcome !== APP_STATE.filters.outcome) return false;

    if (APP_STATE.filters.dateFrom) {
      const betDate = new Date(bet.date);
      const fromDate = new Date(APP_STATE.filters.dateFrom);
      if (betDate < fromDate) return false;
    }

    if (APP_STATE.filters.dateTo) {
      const betDate = new Date(bet.date);
      const toDate = new Date(APP_STATE.filters.dateTo);
      if (betDate > toDate) return false;
    }

    if (APP_STATE.filters.search) {
      const searchTerm = APP_STATE.filters.search;
      const searchableText = `${bet.tipster} ${bet.team} ${bet.sport} ${formatSportLabel(bet.sport)} ${bet.notes || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }

    return true;
  });
}

// ===== Sorting =====
function toggleSort() {
  const options = ['date', 'tipster', 'amount', 'odds', 'outcome'];
  const currentIndex = options.indexOf(APP_STATE.sortBy);
  const nextIndex = (currentIndex + 1) % options.length;

  if (APP_STATE.sortBy === options[nextIndex]) {
    APP_STATE.sortOrder = APP_STATE.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    APP_STATE.sortBy = options[nextIndex];
    APP_STATE.sortOrder = 'desc';
  }

  refreshUI();
  showNotification(`Rendez\u00e9s: ${APP_STATE.sortBy} (${APP_STATE.sortOrder})`, 'info');
}

function sortBets(bets) {
  return [...bets].sort((a, b) => {
    let comparison = 0;

    switch (APP_STATE.sortBy) {
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'tipster':
        comparison = a.tipster.localeCompare(b.tipster);
        break;
      case 'amount':
        comparison = a.betAmount - b.betAmount;
        break;
      case 'odds':
        comparison = a.odds - b.odds;
        break;
      case 'outcome':
        comparison = a.outcome.localeCompare(b.outcome);
        break;
    }

    return APP_STATE.sortOrder === 'asc' ? comparison : -comparison;
  });
}

// ===== Pagination =====
function paginateBets(bets) {
  const start = (APP_STATE.currentPage - 1) * APP_STATE.itemsPerPage;
  const end = start + APP_STATE.itemsPerPage;
  return bets.slice(start, end);
}

function changePage(direction) {
  const filteredBets = getFilteredBets();
  const totalPages = Math.ceil(filteredBets.length / APP_STATE.itemsPerPage);

  APP_STATE.currentPage += direction;
  APP_STATE.currentPage = Math.max(1, Math.min(APP_STATE.currentPage, totalPages));

  refreshUI();
}

function updatePagination() {
  const filteredBets = getFilteredBets();
  const totalPages = Math.ceil(filteredBets.length / APP_STATE.itemsPerPage);

  if (DOM.pageNumbers) {
    DOM.pageNumbers.innerHTML = '';
    const makeBtn = (page) => {
      const b = document.createElement('button');
      b.className = 'btn btn-sm ' + (page === APP_STATE.currentPage ? 'btn-primary' : 'btn-secondary');
      b.textContent = page;
      b.addEventListener('click', () => { APP_STATE.currentPage = page; refreshUI(); });
      return b;
    };
    const maxButtons = 7;
    let start = Math.max(1, APP_STATE.currentPage - 3);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let p = start; p <= end; p++) DOM.pageNumbers.appendChild(makeBtn(p));
  }

  DOM.prevPageBtn.disabled = APP_STATE.currentPage === 1 || totalPages === 0;
  DOM.nextPageBtn.disabled = APP_STATE.currentPage === totalPages || totalPages === 0;
}

// ===== Statistics Calculations =====
function calculateOverallStats() {
  const filtered = getFilteredBets();
  let totalBets = filtered.length;
  let wins = 0;
  let losses = 0;
  let pending = 0;
  let totalStaked = 0;
  let openStake = 0;
  let totalReturns = 0;

  filtered.forEach(bet => {
    if (bet.outcome === 'win') {
      wins++;
      totalStaked += bet.betAmount;
      totalReturns += bet.betAmount * bet.odds;
    } else if (bet.outcome === 'lose') {
      losses++;
      totalStaked += bet.betAmount;
    } else {
      pending++;
      openStake += bet.betAmount;
    }
  });

  const completedBets = wins + losses;
  const winRate = completedBets > 0 ? (wins / completedBets * 100) : 0;
  const netProfit = totalReturns - totalStaked;
  const roi = totalStaked > 0 ? (netProfit / totalStaked * 100) : 0;

  return {
    totalBets,
    wins,
    losses,
    pending,
    winRate: winRate.toFixed(1),
    netProfit,
    roi: roi.toFixed(1),
    totalStaked,
    openStake,
    totalReturns
  };
}

function calculateTipsterStats(tipsterName) {
  const tipsterBets = APP_STATE.bets.filter(bet => bet.tipster === tipsterName);
  let wins = 0;
  let losses = 0;
  let pending = 0;
  let totalStaked = 0;
  let totalReturns = 0;

  tipsterBets.forEach(bet => {
    if (bet.outcome === 'win') {
      wins++;
      totalStaked += bet.betAmount;
      totalReturns += bet.betAmount * bet.odds;
    } else if (bet.outcome === 'lose') {
      losses++;
      totalStaked += bet.betAmount;
    } else {
      pending++;
    }
  });

  const total = tipsterBets.length;
  const completed = wins + losses;
  const winRate = completed > 0 ? (wins / completed * 100) : 0;
  const netProfit = totalReturns - totalStaked;
  const roi = totalStaked > 0 ? (netProfit / totalStaked * 100) : 0;

  return { total, wins, losses, pending, winRate, totalStaked, netProfit, roi };
}

function calculateSportStats() {
  const sportStats = {};

  getFilteredBets().forEach(bet => {
    const groupKey = getSportGroupKey(bet.sport);
    const sport = SPORT_GROUP_LABELS.get(groupKey) || 'Egy\u00e9b';

    if (!sportStats[sport]) {
      sportStats[sport] = {
        key: groupKey,
        total: 0,
        wins: 0,
        losses: 0,
        pending: 0,
        profit: 0
      };
    }

    const stats = sportStats[sport];
    stats.total++;

    if (bet.outcome === 'win') {
      stats.wins++;
      stats.profit += (bet.betAmount * bet.odds) - bet.betAmount;
    } else if (bet.outcome === 'lose') {
      stats.losses++;
      stats.profit -= bet.betAmount;
    } else {
      stats.pending++;
    }
  });

  return sportStats;
}

// ===== HTML Generators =====
function generateOverviewHTML() {
  const stats = calculateOverallStats();
  return `
    <div class="grid grid-2 gap-2">
      <div class="stat-card">
        <div class="stat-label">\u00d6sszes Fogad\u00e1s</div>
        <div class="stat-value">${stats.totalBets}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Befejezett</div>
        <div class="stat-value">${stats.wins + stats.losses}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Nyert</div>
        <div class="stat-value text-success">${stats.wins}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Vesztett</div>
        <div class="stat-value text-error">${stats.losses}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">F\u00fcgg\u0151ben</div>
        <div class="stat-value text-warning">${stats.pending}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">\u00d6sszes T\u00e9t</div>
        <div class="stat-value">${stats.totalStaked.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Nyitott T\u00e9t</div>
        <div class="stat-value">${stats.openStake.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">\u00d6sszes Visszat\u00e9r\u00edt\u00e9s</div>
        <div class="stat-value">${stats.totalReturns.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">\u00c1tlagos Szorz\u00f3</div>
        <div class="stat-value">${calculateAverageOdds()}</div>
      </div>
    </div>
  `;
}

function generateSportsStatsHTML() {
  const sportStats = calculateSportStats();
  let html = '<div class="grid grid-2 gap-2">';

  getSortedSportStats(sportStats).forEach(([sport, stats]) => {
    if (stats.total === 0) return;

    const winRate = (stats.wins / (stats.wins + stats.losses) * 100) || 0;
    const profitClass = stats.profit >= 0 ? 'text-success' : 'text-error';

    html += `
      <div class="stat-card">
        <h4>${sport}</h4>
        <div class="text-secondary">
          Fogad\u00e1sok: ${stats.total} | 
          Nyer\u00e9si %: ${winRate.toFixed(1)}%
        </div>
        <div class="${profitClass}">
          Profit: ${stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(2)}
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

function generateTipstersStatsHTML() {
  let html = '<div class="grid grid-2 gap-2">';

  Object.entries(APP_STATE.tipstersData).forEach(([name, data]) => {
    if (!data.initial_set) return;

    const stats = calculateTipsterStats(name);
    const profitLoss = stats.netProfit;
    const roi = stats.roi;
    const profitClass = profitLoss >= 0 ? 'text-success' : 'text-error';

    html += `
      <div class="stat-card">
        <h4>${name}</h4>
        <div class="text-secondary">
          Fogad\u00e1sok: ${stats.total} | 
          Nyer\u00e9si %: ${stats.winRate.toFixed(1)}%
        </div>
        <div class="${profitClass}">
          P/L: ${profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} | 
          ROI: ${roi.toFixed(1)}%
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

function calculateAverageOdds() {
  const filtered = getFilteredBets();
  if (filtered.length === 0) return '0.00';
  const sum = filtered.reduce((acc, bet) => acc + bet.odds, 0);
  return (sum / filtered.length).toFixed(2);
}

// ===== Charts =====
function initCharts() {
  if (typeof Chart === 'undefined') return;

  // Profit Chart
  const profitCanvas = document.getElementById('profitChart');
  if (profitCanvas) {
    const profitCtx = profitCanvas.getContext('2d');
    APP_STATE.charts.profit = new Chart(profitCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Profit',
          data: [],
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary') + '20',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  // Sport Distribution Chart
  const sportCanvas = document.getElementById('sportChart');
  if (sportCanvas) {
    const sportCtx = sportCanvas.getContext('2d');
    APP_STATE.charts.sport = new Chart(sportCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444',
            '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'
          ]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // Trends Chart
  const trendsCanvas = document.getElementById('trendsChart');
  if (trendsCanvas) {
    const trendsCtx = trendsCanvas.getContext('2d');
    APP_STATE.charts.trends = new Chart(trendsCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Nyert',
          data: [],
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--success')
        }, {
          label: 'Vesztett',
          data: [],
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--error')
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }
    });
  }
}

function updateCharts() {
  if (APP_STATE.charts.profit) updateProfitChart();
  if (APP_STATE.charts.sport) updateSportChart();
  if (APP_STATE.charts.trends) updateTrendsChart();
}

function updateProfitChart() {
  const profitData = calculateProfitOverTime();
  APP_STATE.charts.profit.data.labels = profitData.labels;
  APP_STATE.charts.profit.data.datasets[0].data = profitData.values;
  APP_STATE.charts.profit.update();
}

function updateSportChart() {
  const sportStats = calculateSportStats();
  const labels = [];
  const data = [];

  getSortedSportStats(sportStats).forEach(([sport, stats]) => {
    if (stats.total > 0) {
      labels.push(sport);
      data.push(stats.total);
    }
  });

  APP_STATE.charts.sport.data.labels = labels;
  APP_STATE.charts.sport.data.datasets[0].data = data;
  APP_STATE.charts.sport.update();
}

function updateTrendsChart() {
  const trendsData = calculateMonthlyTrends();
  APP_STATE.charts.trends.data.labels = trendsData.labels;
  APP_STATE.charts.trends.data.datasets[0].data = trendsData.wins;
  APP_STATE.charts.trends.data.datasets[1].data = trendsData.losses;
  APP_STATE.charts.trends.update();
}

// Recalculate all tipster current_capital from initial_capital and bets
function recalcAllCapitals() {
  // Reset to initial
  Object.entries(APP_STATE.tipstersData).forEach(([name, data]) => {
    if (typeof data.initial_capital === 'number') {
      data.current_capital = data.initial_capital;
    }
  });
  // Apply each bet: stake deduction; win adds full payout
  APP_STATE.bets.forEach(bet => {
    const d = APP_STATE.tipstersData[bet.tipster];
    if (!d) return;
    const stake = Number(bet.betAmount) || 0;
    const odds = Number(bet.odds) || 0;
    d.current_capital -= stake;
    if (bet.outcome === 'win') {
      d.current_capital += stake * odds;
    }
  });
  // Clamp to 2 decimals for display consistency
  Object.values(APP_STATE.tipstersData).forEach(d => {
    d.current_capital = Math.max(0, Number(d.current_capital.toFixed(2)));
  });
}

function calculateProfitOverTime() {
  const filtered = getFilteredBets();
  const sortedBets = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = [];
  const values = [];
  let runningProfit = 0;

  sortedBets.forEach(bet => {
    if (bet.outcome !== 'pending') {
      const date = new Date(bet.date).toLocaleDateString('hu-HU');
      labels.push(date);

      if (bet.outcome === 'win') {
        runningProfit += (bet.betAmount * bet.odds) - bet.betAmount;
      } else {
        runningProfit -= bet.betAmount;
      }

      values.push(runningProfit);
    }
  });

  return { labels, values };
}

function calculateMonthlyTrends() {
  const monthlyData = {};
  const filtered = getFilteredBets();

  filtered.forEach(bet => {
    const date = new Date(bet.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { wins: 0, losses: 0 };
    }

    if (bet.outcome === 'win') {
      monthlyData[monthKey].wins++;
    } else if (bet.outcome === 'lose') {
      monthlyData[monthKey].losses++;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const labels = sortedMonths.map(month => {
    const [year, m] = month.split('-');
    return `${year}.${m}`;
  });

  const wins = sortedMonths.map(month => monthlyData[month].wins);
  const losses = sortedMonths.map(month => monthlyData[month].losses);

  return { labels, wins, losses };
}

// ===== Export Functions =====
function exportTXT() {
  let content = '=== BetTracker Pro Export ===\n';
  content += `Export D\u00e1tuma: ${new Date().toLocaleString('hu-HU')}\n\n`;

  content += '--- STATISZTIKA ---\n';
  const stats = calculateOverallStats();
  content += `\u00d6sszes Fogad\u00e1s: ${stats.totalBets}\n`;
  content += `Nyer\u00e9si Ar\u00e1ny: ${stats.winRate}%\n`;
  content += `Nett\u00f3 Profit: ${stats.netProfit.toFixed(2)}\n`;
  content += `ROI: ${stats.roi}%\n\n`;

  content += '--- TIPPAD\u00d3K ---\n';
  Object.entries(APP_STATE.tipstersData).forEach(([name, data]) => {
    if (data.initial_set) {
      content += `${name}: ${data.initial_capital.toFixed(2)} -> ${data.current_capital.toFixed(2)}\n`;
    }
  });

  content += '\n--- FOGAD\u00c1SOK ---\n';
  APP_STATE.bets.forEach((bet, i) => {
    content += `${i + 1}. ${bet.tipster} - ${bet.team}\n`;
    content += `   Sport: ${bet.sport}, T\u00e9t: ${bet.betAmount.toFixed(2)}, Szorz\u00f3: ${bet.odds.toFixed(2)}\n`;
    content += `   Eredm\u00e9ny: ${bet.outcome}, D\u00e1tum: ${new Date(bet.date).toLocaleString('hu-HU')}\n`;
    if (bet.notes) content += `   Megjegyz\u00e9s: ${bet.notes}\n`;
    content += '\n';
  });

  downloadFile(content, `bettracker_export_${getDateString()}.txt`, 'text/plain');
}

function exportCSV() {
  const analysisCsvHeader = 'Date,Tipster,Sport,Market,Stake,Odds,Outcome,Model probability,Break-even,EV,Edge,Kelly,Minimum odds,Notes\n';
  let csv = analysisCsvHeader;

  APP_STATE.bets.forEach(bet => {
    const analysis = bet.analysis || {};
    csv += [
      csvCell(new Date(bet.date).toLocaleDateString('hu-HU')),
      csvCell(bet.tipster),
      csvCell(bet.sport),
      csvCell(bet.team),
      bet.betAmount.toFixed(2),
      bet.odds.toFixed(2),
      csvCell(bet.outcome),
      analysis.modelProbability ?? '',
      analysis.breakEvenProbability ?? '',
      analysis.expectedValue ?? '',
      analysis.edge ?? '',
      analysis.kellyFraction ?? '',
      analysis.minimumOdds ?? '',
      csvCell(bet.notes || '')
    ].join(',') + '\n';
  });

  downloadFile(csv, `bettracker_export_${getDateString()}.csv`, 'text/csv');
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function exportJSON() {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tipstersData: APP_STATE.tipstersData,
    bets: APP_STATE.bets
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `bettracker_export_${getDateString()}.json`, 'application/json');
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') throw new Error('\u00c9rv\u00e9nytelen JSON form\u00e1tum');

      const betsCount = Array.isArray(data.bets) ? data.bets.length : 0;
      const tipstersCount = data.tipstersData ? Object.keys(data.tipstersData).length : 0;

      // Show a custom modal with option buttons for Merge and Replace
      showModal('JSON Adatok Import\u00e1l\u00e1sa', '', 'alert', null);

      DOM.modalMessage.innerHTML = `
        <div style="font-family: var(--font-main);">
          <p style="margin-bottom: 12px;">Sikeresen beolvasott f\u00e1jl: <strong>${escapeHTML(file.name)}</strong></p>
          <p style="margin-bottom: 12px; color: var(--text-secondary);">
            Tal\u00e1lt adatok: <strong>${betsCount} db fogad\u00e1s</strong> \u00e9s <strong>${tipstersCount} db tippad\u00f3</strong>.
          </p>
          <p style="margin-bottom: 20px; font-weight: bold; border-top: 1px solid var(--border); padding-top: 10px;">
            K\u00e9rj\u00fck, v\u00e1lassza ki a bet\u00f6lt\u00e9s m\u00f3dj\u00e1t:
          </p>
          
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;">
            <button id="btnImportMerge" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center; margin-bottom: 8px;">
              Adatok Egyes\u00edt\u00e9se (Megl\u00e9v\u0151 megmarad)
            </button>
            <button id="btnImportReplace" class="btn btn-danger" style="width: 100%; text-align: center; justify-content: center;">
              Adatok Lecser\u00e9l\u00e9se (Mindet fel\u00fcl\u00edr)
            </button>
          </div>
        </div>
      `;

      // Re-style OK button to be M\u00e9gse (Cancel) to close modal
      DOM.modalConfirmBtn.style.display = 'none'; // hide the default confirm
      
      const prevCancelText = DOM.modalCancelBtn.textContent;
      DOM.modalCancelBtn.textContent = 'M\u00e9gse';
      
      // Cleanup custom buttons
      const handleClose = () => {
        DOM.modalConfirmBtn.style.display = ''; // restore confirm button
        DOM.modalCancelBtn.textContent = prevCancelText; // restore cancel text
        closeModal();
      };

      DOM.modalCancelBtn.onclick = handleClose;
      DOM.modalOverlay.onclick = (ev) => {
        if (ev.target === DOM.modalOverlay) handleClose();
      };

      document.getElementById('btnImportMerge').onclick = () => {
        // Merge logic
        Object.assign(APP_STATE.tipstersData, data.tipstersData || {});
        APP_STATE.bets.push(...(data.bets || []).map(normalizeStoredBet));
        saveToStorage();
        populateSelects();
        refreshUI();
        handleClose();
        showNotification('Adatok sikeresen egyes\u00edtve!', 'success');
      };

      document.getElementById('btnImportReplace').onclick = () => {
        // Replace logic
        APP_STATE.tipstersData = data.tipstersData || {};
        APP_STATE.bets = (data.bets || []).map(normalizeStoredBet);
        saveToStorage();
        populateSelects();
        refreshUI();
        handleClose();
        showNotification('Minden helyi adat sikeresen lecser\u00e9lve!', 'success');
      };

    } catch (err) {
      showAlert('Hiba az import\u00e1l\u00e1s sor\u00e1n: \u00c9rv\u00e9nytelen JSON form\u00e1tum!', 'error');
    }
  };
  reader.readAsText(file);
}

function importTextJSON() {
  const raw = DOM.llmImportInput?.value.trim();
  if (!raw) {
    showAlert('Nincs import\u00e1lhat\u00f3 JSON adat.', 'warning');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const imported = [];

    rows.forEach(item => {
      const bet = normalizeImportedBet(item);
      if (!bet) return;
      if (!APP_STATE.tipstersData[bet.tipster]) {
        APP_STATE.tipstersData[bet.tipster] = {
          initial_capital: DEFAULT_INITIAL_CAPITAL,
          current_capital: DEFAULT_INITIAL_CAPITAL,
          initial_set: true
        };
      }
      imported.push(bet);
    });

    if (imported.length === 0) {
      showAlert('Nem tal\u00e1ltam \u00e9rv\u00e9nyes fogad\u00e1st a JSON-ban.', 'warning');
      return;
    }

    APP_STATE.bets.push(...imported);
    normalizeDefaultTipsterNames();
    saveToStorage();
    populateSelects();
    refreshUI();
    showNotification(`${imported.length} fogad\u00e1s import\u00e1lva.`, 'success');
  } catch (err) {
    showAlert('\u00c9rv\u00e9nytelen JSON form\u00e1tum.', 'error');
  }
}

async function sendLlmApiImport(shouldSave) {
  const raw = DOM.llmImportInput?.value.trim();
  const apiKey = DOM.llmApiKeyInput?.value.trim();

  if (!raw) {
    showAlert('Nincs elk\u00fcldhet\u0151 JSON adat.', 'warning');
    return;
  }

  if (!apiKey) {
    showAlert('API kulcs sz\u00fcks\u00e9ges az API m\u0171velethez.', 'warning');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const endpoint = shouldSave ? '/api/llm/tips' : '/api/llm/analyze';
    setLlmApiResult(shouldSave ? 'Felt\u00f6lt\u00e9s folyamatban...' : 'Elemz\u00e9s folyamatban...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(parsed)
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || `API hiba: ${response.status}`);
    }

    const analysis = result.analysis || {};
    const message = shouldSave
      ? `Felt\u00f6ltve: ${result.incoming || result.count || 0}, \u00faj: ${result.added || 0}, friss\u00edtve: ${result.updated || 0}, \u00f6sszes: ${result.totalBets || analysis.totalBets || '-'}`
      : `Elemz\u00e9s k\u00e9sz: ${result.count || 0} tipp, v\u00e1rhat\u00f3 nyitott EV profit: ${Number(analysis.pendingExpectedProfit || 0).toFixed(2)}u`;

    setLlmApiResult(message);
    showNotification(message, 'success');

    if (shouldSave) {
      await syncPublicStateFromServer();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ismeretlen API hiba.';
    setLlmApiResult(message);
    showAlert(message, 'error');
  }
}

function setLlmApiResult(message) {
  if (DOM.llmApiResult) DOM.llmApiResult.textContent = message;
}

function normalizeImportedBet(item) {
  if (!item || typeof item !== 'object') return null;
  const betAmount = Number(item.betAmount ?? item.amount ?? item.stake);
  const odds = Number(item.odds ?? item.decimalOdds);
  const tipster = String(item.tipster || 'Tippad\u00f3 1').trim();
  const sport = String(item.sport || '').trim();
  const team = String(item.team || item.match || item.market || '').trim();
  if (!tipster || !sport || !team || !(betAmount > 0) || !(odds > 1)) return null;

  const outcome = ['win', 'lose', 'pending'].includes(item.outcome) ? item.outcome : 'pending';
  const date = item.date ? new Date(item.date) : new Date();
  return normalizeStoredBet({
    id: item.id || generateId(),
    tipster,
    sport,
    team,
    betAmount,
    odds,
    outcome,
    date: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
    notes: item.notes || item.note || '',
    analysis: normalizeBetAnalysis(item)
  });
}

function fillSampleImport() {
  if (!DOM.llmImportInput) return;
  DOM.llmImportInput.value = JSON.stringify({
    options: {
      defaultTipster: 'Claude',
      fractionalKelly: 0.25,
      maxStake: 3
    },
    picks: [
      {
        tipster: 'Claude',
        sport: '\u26bd Labdar\u00fag\u00e1s',
        team: 'Real Madrid - Barcelona, Over 2.5',
        odds: 1.85,
        modelProbability: 0.58,
        minimumOdds: 1.75,
        outcome: 'pending',
        sourceSummary: 'Claude tipp + odds validalas',
        notes: 'demo'
      }
    ]
  }, null, 2);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getDateString() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeStoredBet(bet) {
  const normalized = { ...bet };
  normalized.betAmount = Number(normalized.betAmount) || 0;
  normalized.odds = Number(normalized.odds) || 0;
  normalized.notes = normalized.notes ? String(normalized.notes) : '';
  normalized.analysis = normalizeBetAnalysis(normalized);
  return normalized;
}

function normalizeBetAnalysis(input) {
  const raw = input?.analysis && typeof input.analysis === 'object' ? input.analysis : input;
  if (!raw || typeof raw !== 'object') return undefined;

  const analysis = {
    modelProbability: normalizeProbability(raw.modelProbability ?? raw.probability ?? raw.pModel),
    breakEvenProbability: normalizeProbability(raw.breakEvenProbability ?? raw.breakEven ?? raw.impliedProbability),
    expectedValue: finiteNumber(raw.expectedValue ?? raw.ev),
    edge: finiteNumber(raw.edge),
    kellyFraction: finiteNumber(raw.kellyFraction ?? raw.kelly),
    fairOdds: finiteNumber(raw.fairOdds),
    minimumOdds: finiteNumber(raw.minimumOdds ?? raw.minOdds),
    confidence: normalizeProbability(raw.confidence),
    method: raw.method ? String(raw.method) : undefined,
    market: raw.market ? String(raw.market) : undefined,
    sourceSummary: raw.sourceSummary || raw.sourcesSummary ? String(raw.sourceSummary || raw.sourcesSummary) : undefined,
    sources: Array.isArray(raw.sources) ? raw.sources.map(String).filter(Boolean) : undefined
  };

  Object.keys(analysis).forEach(key => {
    if (analysis[key] === undefined || (Array.isArray(analysis[key]) && analysis[key].length === 0)) {
      delete analysis[key];
    }
  });

  return Object.keys(analysis).length ? analysis : undefined;
}

function finiteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeProbability(value) {
  const numeric = finiteNumber(value);
  if (numeric === undefined) return undefined;
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  if (numeric >= 0 && numeric <= 1) return numeric;
  return undefined;
}

// ===== Storage =====
function saveToStorage() {
  const data = {
    tipstersData: APP_STATE.tipstersData,
    bets: APP_STATE.bets,
    theme: APP_STATE.theme
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      APP_STATE.tipstersData = data.tipstersData || {};
      APP_STATE.bets = (data.bets || []).map(normalizeStoredBet);
      APP_STATE.theme = data.theme || 'light';
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }
}

async function syncPublicStateFromServer() {
  try {
    const res = await fetch('/api/state', { headers: { accept: 'application/json' } });
    if (!res.ok) return;
    const serverState = await res.json();
    if (serverState && serverState.tipstersData && Array.isArray(serverState.bets)) {
      APP_STATE.tipstersData = serverState.tipstersData;
      APP_STATE.bets = serverState.bets.map(normalizeStoredBet);
      saveToStorage();
      populateSelects();
      refreshUI();
    }
  } catch {
    // The static file flow still works without the deployed API.
  }
}

function resetAllData() {
  showConfirm('Biztosan t\u00f6r\u00f6lni szeretn\u00e9 az \u00f6sszes adatot?', () => {
    localStorage.removeItem(STORAGE_KEY);
    APP_STATE.tipstersData = {};
    APP_STATE.bets = [];
    initTipstersData();
    saveToStorage();
    refreshUI();
    showNotification('Minden adat t\u00f6r\u00f6lve!', 'success');
  });
}

// ===== UI Helpers =====
function populateSelects() {
  // Tipsters
  DOM.tipsterSelect.innerHTML = '<option value="">V\u00e1lasszon tippad\u00f3t...</option>';
  DOM.filterTipster.innerHTML = '<option value="">Mind</option>';

  getSortedTipsterNames().forEach(name => {
    DOM.tipsterSelect.innerHTML += `<option value="${name}">${name}</option>`;
    DOM.filterTipster.innerHTML += `<option value="${name}">${name}</option>`;
  });

  // Sports - form select uses predefined SPORTS for new bets
  DOM.sportSelect.innerHTML = '<option value="">V\u00e1lasszon sport\u00e1gat...</option>';
  SPORTS.forEach(sport => {
    DOM.sportSelect.innerHTML += `<option value="${sport}">${sport}</option>`;
  });

  // Sports filter - collect actual unique sport values from bets
  DOM.filterSport.innerHTML = '<option value="">Mind</option>';
  getSportFilterOptions().forEach(sport => {
    DOM.filterSport.innerHTML += `<option value="${sport.key}">${escapeHTML(sport.label)} (${sport.count})</option>`;
  });
  if (APP_STATE.filters.sport) DOM.filterSport.value = APP_STATE.filters.sport;
}

function getSportFilterOptions() {
  const counts = new Map();
  // Pre-populate with all known sport groups set to 0
  SPORT_GROUPS.forEach(sport => {
    counts.set(sport.key, 0);
  });

  APP_STATE.bets.forEach(bet => {
    const key = getSportGroupKey(bet.sport);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      count,
      label: SPORT_GROUP_LABELS.get(key) || '\u2753 Egy\u00e9b',
      order: SPORT_GROUP_ORDER.has(key) ? SPORT_GROUP_ORDER.get(key) : Number.MAX_SAFE_INTEGER
    }))
    .sort((a, b) => a.order - b.order);
}

function ensureSportSelectValue(sport) {
  const value = String(sport || '').trim();
  if (!value || !DOM.sportSelect) return;
  if ([...DOM.sportSelect.options].some(option => option.value === value)) return;

  const option = document.createElement('option');
  option.value = value;
  option.textContent = formatSportLabel(value);
  DOM.sportSelect.appendChild(option);
}

function getSportGroupKey(sport) {
  const text = normalizeSportText(sport);
  if (!text) return 'other';

  if (/\bafl\b/.test(text) || text.includes('ausztral futball') || text.includes('australian football')) return 'australian-football';
  if (text.includes('baseball') || /\bmlb\b/.test(text)) return 'baseball';
  if (text.includes('tenisz') || text.includes('tennis') || text.includes('roland garros') || text.includes('french open')) return 'tennis';
  if (text.includes('kosarlabda') || text.includes('basketball') || /\bnba\b/.test(text) || /\bwnba\b/.test(text)) return 'basketball';
  if (text.includes('jegkorong') || text.includes('hockey') || /\bnhl\b/.test(text) || /\biihf\b/.test(text)) return 'hockey';
  if (text.includes('amerikai foci') || text.includes('american football') || /\bnfl\b/.test(text)) return 'american-football';
  if (
    text.includes('labdarugas') ||
    text.includes('football') ||
    text.includes('footbal') ||
    text.includes('futball') ||
    text.includes('futbal') ||
    text.includes('fotball') ||
    text.includes('fotbal') ||
    text.includes('fotba') ||
    text.includes('foci') ||
    text.includes('soccer')
  ) return 'football';
  if (text.includes('krikett') || text.includes('cricket') || /\bipl\b/.test(text)) return 'cricket';
  if (text.includes('roplabda') || text.includes('volleyball')) return 'volleyball';
  if (text.includes('okolvivas') || text.includes('boxing') || text.includes('mma') || text.includes('ufc')) return 'combat';
  if (text.includes('darts')) return 'darts';
  if (text.includes('snooker')) return 'snooker';
  if (text.includes('forma 1') || text.includes('formula 1') || text.includes('f1') || text.includes('motorsport')) return 'motorsport';
  if (text.includes('loverseny') || text.includes('horse')) return 'horse-racing';
  if (text.includes('esport') || text.includes('e-sport')) return 'esport';
  return 'other';
}

function formatSportLabel(sport) {
  const raw = String(sport || '').trim();
  const groupKey = getSportGroupKey(raw);
  const groupLabel = SPORT_GROUP_LABELS.get(groupKey) || 'Egy\u00e9b';
  const suffix = getSportSuffix(raw);
  if (!suffix) {
    const directLabel = SPORT_SUFFIX_LABELS.get(normalizeSportText(raw));
    return directLabel ? `${groupLabel} - ${directLabel}` : groupLabel;
  }

  const suffixKey = normalizeSportText(suffix);
  const suffixLabel = SPORT_SUFFIX_LABELS.get(suffixKey) || toHungarianSportSuffix(suffix);
  return `${groupLabel} - ${suffixLabel}`;
}

function getSortedSportStats(sportStats) {
  return Object.entries(sportStats).sort(([, a], [, b]) => {
    const aOrder = SPORT_GROUP_ORDER.has(a.key) ? SPORT_GROUP_ORDER.get(a.key) : Number.MAX_SAFE_INTEGER;
    const bOrder = SPORT_GROUP_ORDER.has(b.key) ? SPORT_GROUP_ORDER.get(b.key) : Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
}

function getSportSuffix(sport) {
  const raw = String(sport || '').trim();
  const parts = raw.split(/\s[-–—]\s/).map(part => part.trim()).filter(Boolean);
  if (parts.length < 2) return '';
  return parts.slice(1).join(' - ');
}

function toHungarianSportSuffix(suffix) {
  return String(suffix || '')
    .trim()
    .replace(/\bLabdarugas\b/g, 'Labdar\u00fag\u00e1s')
    .replace(/\bKosarlabda\b/g, 'Kos\u00e1rlabda')
    .replace(/\bJegkorong\b/g, 'J\u00e9gkorong')
    .replace(/\bAmerikai Foci\b/g, 'Amerikai foci')
    .replace(/\bFriendly\b/g, 'bar\u00e1ts\u00e1gos m\u00e9rk\u0151z\u00e9s')
    .replace(/\bPlayoff\b/g, 'r\u00e1j\u00e1tsz\u00e1s')
    .replace(/\bTotal\b/g, '\u00f6sszes pont/fut\u00e1s')
    .replace(/\bPlayer Prop\b/g, 'j\u00e1t\u00e9kospiac')
    .replace(/\bHT\b/g, 'f\u00e9lid\u0151');
}

function normalizeSportText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getSortedTipsterNames() {
  const names = Object.keys(APP_STATE.tipstersData);
  const custom = names.filter(n => !isDefaultName(n)); // megtartjuk a megl\u00e9v\u0151 sorrendet
  const defaults = names
    .filter(isDefaultName)
    .sort((a, b) => parseInt(a.split(' ')[1], 10) - parseInt(b.split(' ')[1], 10));
  return [...custom, ...defaults];
}

function isDefaultName(name) {
  return /^Tippad\u00f3\s+\d+$/.test(name);
}

// Rename default "Tippad\u00f3 N" entries so numbering starts after custom names
function normalizeDefaultTipsterNames() {
  const names = Object.keys(APP_STATE.tipstersData);
  const custom = names.filter(n => !isDefaultName(n));
  const defaults = names
    .filter(isDefaultName)
    .sort((a, b) => parseInt(a.split(' ')[1], 10) - parseInt(b.split(' ')[1], 10));

  if (defaults.length === 0) return;

  const offset = custom.length + 1;
  const newData = {};
  // keep custom entries as-is, preserving insertion order
  custom.forEach(n => { newData[n] = APP_STATE.tipstersData[n]; });
  defaults.forEach((oldName, idx) => {
    const newName = `Tippad\u00f3 ${offset + idx}`;
    newData[newName] = APP_STATE.tipstersData[oldName];
  });
  APP_STATE.tipstersData = newData;
}

// ===== Theme =====
function toggleTheme() {
  APP_STATE.theme = DOM.themeToggle.checked ? 'dark' : 'light';
  applyTheme();
  saveToStorage();
}

function applyTheme() {
  document.body.setAttribute('data-theme', APP_STATE.theme);
  DOM.themeToggle.checked = APP_STATE.theme === 'dark';
}

// ===== Navigation =====
function handleNavigation(e) {
  e.preventDefault();
  DOM.navLinks.forEach(link => link.classList.remove('active'));
  e.target.classList.add('active');

  const targetId = e.target.getAttribute('href').substring(1);
  const targetSection = document.getElementById(targetId + 'Section');

  if (targetSection) {
    const navHeight = document.querySelector('.navbar').offsetHeight;
    const targetPosition = targetSection.offsetTop - navHeight - 20;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  }
}

function handleTabSwitch(e) {
  const tabName = e.target.dataset.tab;

  DOM.tabs.forEach(tab => tab.classList.remove('active'));
  e.target.classList.add('active');

  DOM.tabContents.forEach(content => {
    content.classList.remove('active');
    if (content.id === `${tabName}-tab`) {
      content.classList.add('active');
    }
  });
}

// ===== Scroll =====
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  DOM.scrollToTopBtn.classList.toggle('show', scrollTop > 300);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Modals =====
function showModal(title, message, type = 'alert', callback = null) {
  DOM.modalTitle.textContent = title;
  DOM.modalMessage.textContent = message;
  DOM.modalInput.classList.add('hidden');

  DOM.modalOverlay.classList.add('show');

  if (type === 'prompt') {
    DOM.modalInput.classList.remove('hidden');
    DOM.modalInput.value = '';
    DOM.modalInput.focus();
  }

  DOM.modalConfirmBtn.onclick = (e) => {
    e.stopPropagation();
    try {
      if (type === 'prompt' && callback) {
        callback(DOM.modalInput.value);
      } else if (callback) {
        callback();
      }
    } catch (err) {
      console.error('Modal callback error:', err);
    } finally {
      closeModal();
    }
  };
  // Also close on Enter when not prompt, and on Enter inside prompt confirm
  const keyHandler = (ke) => {
    if (ke.key === 'Enter') {
      DOM.modalConfirmBtn.click();
    }
  };
  document.addEventListener('keydown', keyHandler, { once: true });
}

function closeModal() {
  DOM.modalOverlay.classList.remove('show');
}

function showAlert(message, type = 'info') {
  showModal(type === 'error' ? 'Hiba' : type === 'warning' ? 'Figyelmeztet\u00e9s' : 'Inform\u00e1ci\u00f3', message);
}

function showConfirm(message, onConfirm, onCancel = null) {
  showModal('Meger\u0151s\u00edt\u00e9s', message, 'confirm', onConfirm);
}

function showPrompt(message, defaultValue, callback) {
  showModal('Bevitel', message, 'prompt', callback);
  if (defaultValue) DOM.modalInput.value = defaultValue;
}

// ===== Notifications =====
function showNotification(message, type = 'info') {
  const container = document.getElementById('notificationContainer');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-title">${type === 'success' ? 'Siker' : type === 'error' ? 'Hiba' : 'Inform\u00e1ci\u00f3'}</div>
    <div class="notification-message">${message}</div>
  `;

  container.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ===== Utility Functions =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function editBet(betId) {
  const bet = APP_STATE.bets.find(b => b.id === betId);
  if (!bet) return;

  DOM.tipsterSelect.value = bet.tipster;
  ensureSportSelectValue(bet.sport);
  DOM.sportSelect.value = bet.sport;
  DOM.teamInput.value = bet.team;
  DOM.betAmountInput.value = bet.betAmount;
  DOM.oddsInput.value = bet.odds;
  DOM.outcomeSelect.value = bet.outcome;
  DOM.betDateInput.value = bet.date.slice(0, 16);
  DOM.notesInput.value = bet.notes || '';

  if (isAdminLoggedIn()) {
    ADMIN_STATE.editingBetId = betId;
  } else {
    // Remove the old bet locally; saving the form creates the edited copy.
    const betIndex = APP_STATE.bets.findIndex(b => b.id === betId);
    APP_STATE.bets.splice(betIndex, 1);
  }

  // Scroll to form
  document.getElementById('newBetSection').scrollIntoView({ behavior: 'smooth' });

  showNotification('Fogad\u00e1s szerkeszt\u00e9se - m\u00f3dos\u00edtsa \u00e9s mentse \u00fajra', 'info');
}

function viewTipsterDetails(name) {
  const data = APP_STATE.tipstersData[name];
  const stats = calculateTipsterStats(name);
  const tipsterBets = APP_STATE.bets.filter(bet => bet.tipster === name);

  let detailsHTML = `
    <div style="font-family: var(--font-main);">
      <h3 style="margin-bottom: 15px; border-bottom: 2px solid var(--border); padding-bottom: 10px; color: var(--primary);">${name} R\u00e9szletes Statisztik\u00e1i</h3>
      
      <div class="grid grid-2 gap-2" style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="stat-card" style="padding: 10px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface);">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Kezd\u0151 T\u0151ke</div>
          <div style="font-size: 1.25rem; font-weight: bold;">${data.initial_capital.toFixed(2)}</div>
        </div>
        <div class="stat-card" style="padding: 10px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface);">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Aktu\u00e1lis T\u0151ke</div>
          <div style="font-size: 1.25rem; font-weight: bold;">${data.current_capital.toFixed(2)}</div>
        </div>
        <div class="stat-card" style="padding: 10px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface);">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">\u00d6sszes Fogad\u00e1s</div>
          <div style="font-size: 1.25rem; font-weight: bold;">${stats.total}</div>
        </div>
        <div class="stat-card" style="padding: 10px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface);">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Nyer\u00e9si Ar\u00e1ny</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">${stats.winRate.toFixed(1)}%</div>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface);">
        <h4 style="margin-bottom: 10px; font-size: 0.95rem;">Eredm\u00e9nyek megoszl\u00e1sa:</h4>
        <div style="display: flex; justify-content: space-around; font-weight: bold;">
          <div style="text-align: center;">
            <div style="color: var(--success); font-size: 1.25rem;">${stats.wins}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">NYERT</div>
          </div>
          <div style="text-align: center;">
            <div style="color: var(--error); font-size: 1.25rem;">${stats.losses}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">VESZTETT</div>
          </div>
          <div style="text-align: center;">
            <div style="color: var(--warning); font-size: 1.25rem;">${stats.pending}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">F\u00dcGG\u0150BEN</div>
          </div>
        </div>
      </div>
      
      <h4 style="margin-bottom: 10px; font-size: 0.95rem; border-bottom: 1px solid var(--border); padding-bottom: 5px;">Utols\u00f3 5 fogad\u00e1s:</h4>
      <ul style="list-style: none; padding: 0; margin: 0;">
  `;

  const lastBets = tipsterBets.slice(-5).reverse();
  if (lastBets.length === 0) {
    detailsHTML += `<li style="padding: 10px; text-align: center; color: var(--text-secondary);">Nincs m\u00e9g r\u00f6gz\u00edtett fogad\u00e1s ehhez a tippad\u00f3hoz.</li>`;
  } else {
    lastBets.forEach(bet => {
      let outcomeBadge = '';
      if (bet.outcome === 'win') {
        outcomeBadge = `<span style="background-color: var(--success-bg); color: var(--success); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid var(--success);">Nyert</span>`;
      } else if (bet.outcome === 'lose') {
        outcomeBadge = `<span style="background-color: var(--error-bg); color: var(--error); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid var(--error);">Vesztett</span>`;
      } else {
        outcomeBadge = `<span style="background-color: var(--warning-bg); color: var(--warning); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid var(--warning);">F\u00fcgg\u0151ben</span>`;
      }

      detailsHTML += `
        <li style="padding: 8px 0; border-bottom: 1px dashed var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
          <div style="max-width: 70%; line-height: 1.3;">
            <strong>${escapeHTML(bet.team)}</strong>
            <br>
            <small style="color: var(--text-secondary);">${bet.betAmount.toFixed(2)} @ ${bet.odds.toFixed(2)}</small>
          </div>
          <div>${outcomeBadge}</div>
        </li>
      `;
    });
  }

  detailsHTML += `
      </ul>
      <div style="margin-top: 15px; text-align: right; display: flex; justify-content: space-between; align-items: center;">
        <button id="modalFilterTipsterBtn" class="btn btn-primary" style="font-size: 0.8rem; padding: 6px 12px; border-radius: var(--radius);">Sz\u0171r\u00e9s erre a tippad\u00f3ra</button>
        <small style="color: var(--text-muted);">OK gombbal bez\u00e1rhatja</small>
      </div>
    </div>
  `;

  // Haszn\u00e1ld a showModal-t, hogy az OK gomb m\u0171k\u00f6dj\u00f6n
  showModal('Tippad\u00f3 R\u00e9szletek', '', 'alert', null);
  DOM.modalMessage.innerHTML = detailsHTML;
  
  // Sz\u0171r\u00e9s gomb bek\u00f6t\u00e9se a modal-on bel\u00fcl!
  const filterBtn = document.getElementById('modalFilterTipsterBtn');
  if (filterBtn) {
    filterBtn.onclick = () => {
      closeModal();
      APP_STATE.filters.tipster = name;
      if (DOM.filterTipster) {
        DOM.filterTipster.value = name;
      }
      if (DOM.filtersSection) {
        DOM.filtersSection.classList.remove('hidden');
      }
      APP_STATE.currentPage = 1;
      refreshUI();
      const dashboardEl = document.getElementById('dashboard');
      if (dashboardEl) {
        dashboardEl.scrollIntoView({ behavior: 'smooth' });
      }
      showNotification(`Sz\u0171r\u0151 alkalmazva: ${name}`, 'success');
    };
  }
}

function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + S: Save (export)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    exportJSON();
  }

  // Ctrl/Cmd + N: New bet
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    document.getElementById('newBetSection').scrollIntoView({ behavior: 'smooth' });
    DOM.teamInput.focus();
  }

  // Escape: Close modal
  if (e.key === 'Escape') {
    closeModal();
  }
}

// Expose functions for inline handlers
window.updateBetOutcome = updateBetOutcome;
window.deleteBet = deleteBet;
window.editBet = editBet;
window.setTipsterCapital = setTipsterCapital;
window.viewTipsterDetails = viewTipsterDetails;

