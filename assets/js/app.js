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

// ===== Constants =====
const STORAGE_KEY = 'BetTrackerPro_v1.0';
const DEFAULT_INITIAL_CAPITAL = 100;
const TIPSTER_NAMES = Array.from({ length: 12 }, (_, i) => `Tippadó ${i + 1}`);
const SPORTS = [
  "⚽ Labdarúgás",
  "🏀 Kosárlabda",
  "🎾 Tenisz",
  "⚾ Baseball",
  "🏈 Amerikai Foci",
  "🏏 Krikett",
  "🏒 Jégkorong",
  "🏐 Röplabda",
  "🥊 Ökölvívás",
  "🥋 MMA/UFC",
  "🎯 Darts",
  "🎱 Snooker",
  "🏎️ Forma 1",
  "🐎 Lóverseny",
  "🕹️ eSport",
  "❓ Egyéb"
];

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
  initCharts();
  refreshUI();
  showNotification('Alkalmazás sikeresen betöltve!', 'success');
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
  DOM.llmImportInput = document.getElementById('llmImportInput');
  DOM.importTextJsonBtn = document.getElementById('importTextJsonBtn');
  DOM.clearImportTextBtn = document.getElementById('clearImportTextBtn');
  DOM.fillSampleImportBtn = document.getElementById('fillSampleImportBtn');
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
  if (DOM.clearImportTextBtn) DOM.clearImportTextBtn.addEventListener('click', () => { DOM.llmImportInput.value = ''; });
  if (DOM.fillSampleImportBtn) DOM.fillSampleImportBtn.addEventListener('click', fillSampleImport);

  // Tipsters
  if (DOM.addTipsterBtn) {
    DOM.addTipsterBtn.addEventListener('click', addNewTipster);
  }

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
    // tárold az előző formátumot, hogy pontos konverzió legyen
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
  showPrompt('Új tippadó neve:', '', (name) => {
    if (name && !APP_STATE.tipstersData[name]) {
      APP_STATE.tipstersData[name] = {
        initial_capital: DEFAULT_INITIAL_CAPITAL,
        current_capital: DEFAULT_INITIAL_CAPITAL,
        initial_set: true
      };
      normalizeDefaultTipsterNames();
      saveToStorage();
      refreshUI(); // populateSelects újrarendez
      showNotification(`${name} sikeresen hozzáadva!`, 'success');
    }
  });
}

function setTipsterCapital(name) {
  const data = APP_STATE.tipstersData[name];
  showPrompt(`Kezdő tőke ${name} számára:`, data.initial_capital.toString(), (value) => {
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
      showNotification('Tőke sikeresen beállítva!', 'success');
    }
    // ha érvénytelen input, akkor is frissítünk hogy bezárás után friss UI legyen
    else {
      refreshUI();
    }
  });
}

// ===== Bet Management =====
function handleAddBet(e) {
  e.preventDefault();

  if (!validateBetForm()) return;

  const tipster = DOM.tipsterSelect.value;
  const tipsterData = APP_STATE.tipstersData[tipster];

  if (!tipsterData.initial_set) {
    showAlert(`Először állítsa be ${tipster} kezdő tőkéjét!`, 'warning');
    return;
  }

  const betAmount = parseFloat(DOM.betAmountInput.value);

  if (tipsterData.current_capital < betAmount) {
    showAlert(`Nincs elegendő tőke! (${tipsterData.current_capital.toFixed(2)} egység)`, 'error');
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
    showAlert('Duplikált fogadásnak tűnik (azonos tippadó/csapat/dátum/tét/szorzó).', 'warning');
    return;
  }

  APP_STATE.bets.push(bet);
  updateCapital(bet, 'place');
  saveToStorage();
  refreshUI();
  clearForm();
  showNotification('Fogadás sikeresen hozzáadva!', 'success');
}

function validateBetForm() {
  let isValid = true;
  const fields = [
    { element: DOM.tipsterSelect, error: 'Kérjük válasszon tippadót' },
    { element: DOM.sportSelect, error: 'Kérjük válasszon sportágat' },
    { element: DOM.teamInput, error: 'Kérjük adja meg a mérkőzést vagy piacot' },
    { element: DOM.betAmountInput, error: 'Érvénytelen tét összeg', validator: (v) => parseFloat(v) > 0 }
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

  // Odds validáció formátum szerint
  const oddsErrorEl = DOM.oddsInput.parentElement.querySelector('.form-error');
  const decOdds = window.getDecimalOddsFromInput();
  if (!(isFinite(decOdds) && decOdds >= 1.01)) {
    oddsErrorEl.classList.remove('hidden');
    oddsErrorEl.textContent = 'Érvénytelen szorzó';
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
  DOM.teamInput.value = 'Gyors Fogadás';
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

function updateBetOutcome(betId, newOutcome) {
  const bet = APP_STATE.bets.find(b => b.id === betId);
  if (!bet || bet.outcome === newOutcome) return;
  const tipsterData = APP_STATE.tipstersData[bet.tipster];
  if (!tipsterData) return;

  // Stake was already deducted when the bet was placed (pending baseline).
  // Only adjust the payout part when outcome toggles to/from 'win'.
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
  showNotification('Fogadás eredménye frissítve!', 'success');
}

function deleteBet(betId) {
  showConfirm('Biztosan törölni szeretné ezt a fogadást?', () => {
    const betIndex = APP_STATE.bets.findIndex(b => b.id === betId);
    if (betIndex === -1) return;

    // Remove bet and recompute capitals
    APP_STATE.bets.splice(betIndex, 1);

    saveToStorage();
    refreshUI();
    showNotification('Fogadás törölve!', 'success');
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
        <span class="table-mobile-label">Dátum:</span>
        ${formattedDate}
      </td>
      <td>
        <span class="table-mobile-label">Tippadó:</span>
        ${escapeHTML(bet.tipster)}
      </td>
      <td>
        <span class="table-mobile-label">Sportág:</span>
        ${escapeHTML(bet.sport)}
      </td>
      <td>
        <span class="table-mobile-label">Mérkőzés / piac:</span>
        <strong>${escapeHTML(bet.team)}</strong>
        ${bet.notes ? `<br><small class="text-muted">${escapeHTML(bet.notes)}</small>` : ''}
      </td>
      <td>
        <span class="table-mobile-label">Tét:</span>
        ${bet.betAmount.toFixed(2)}
      </td>
      <td>
        <span class="table-mobile-label">Szorzó:</span>
        ${bet.odds.toFixed(2)}
      </td>
      <td>
        <span class="table-mobile-label">Lehetséges:</span>
        ${potentialWin}
      </td>
      <td>
        <span class="table-mobile-label">Eredmény:</span>
        <select class="form-select" data-bet-id="${bet.id}">
          <option value="pending" ${bet.outcome === 'pending' ? 'selected' : ''}>⏳ Függőben</option>
          <option value="win" ${bet.outcome === 'win' ? 'selected' : ''}>✅ Nyert</option>
          <option value="lose" ${bet.outcome === 'lose' ? 'selected' : ''}>❌ Vesztett</option>
        </select>
      </td>
      <td>
        <span class="table-mobile-label">Műveletek:</span>
        <div class="btn-group">
          <button class="btn btn-sm btn-icon btn-secondary" data-action="edit-bet" data-id="${bet.id}" title="Szerkesztés">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-icon btn-danger" data-action="delete-bet" data-id="${bet.id}" title="Törlés">
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
    const profitLoss = data.current_capital - data.initial_capital;
    const roi = data.initial_capital > 0 ? (profitLoss / data.initial_capital * 100) : 0;

    totalInitial += data.initial_capital;
    totalCurrent += data.current_capital;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${name}</strong></td>
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
      <td>${stats.total}</td>
      <td>${stats.winRate.toFixed(1)}%</td>
      <td>
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-secondary" data-action="capital" data-name="${name}">
            Tőke
          </button>
          <button type="button" class="btn btn-sm btn-primary" data-action="details" data-name="${name}">
            Részletek
          </button>
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
  showNotification('Szűrők alkalmazva!', 'success');
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
  showNotification('Szűrők törölve!', 'success');
}

function handleSearch() {
  APP_STATE.filters.search = DOM.betsSearch.value.toLowerCase();
  APP_STATE.currentPage = 1;
  refreshUI();
}

function getFilteredBets() {
  return APP_STATE.bets.filter(bet => {
    if (APP_STATE.filters.tipster && bet.tipster !== APP_STATE.filters.tipster) return false;
    if (APP_STATE.filters.sport && bet.sport !== APP_STATE.filters.sport) return false;
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
      const searchableText = `${bet.tipster} ${bet.team} ${bet.sport} ${bet.notes || ''}`.toLowerCase();
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
  showNotification(`Rendezés: ${APP_STATE.sortBy} (${APP_STATE.sortOrder})`, 'info');
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
  let totalBets = APP_STATE.bets.length;
  let wins = 0;
  let losses = 0;
  let pending = 0;
  let totalStaked = 0;
  let openStake = 0;
  let totalReturns = 0;

  APP_STATE.bets.forEach(bet => {
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

  tipsterBets.forEach(bet => {
    if (bet.outcome === 'win') wins++;
    else if (bet.outcome === 'lose') losses++;
    else pending++;
  });

  const total = tipsterBets.length;
  const completed = wins + losses;
  const winRate = completed > 0 ? (wins / completed * 100) : 0;

  return { total, wins, losses, pending, winRate };
}

function calculateSportStats() {
  const sportStats = {};

  SPORTS.forEach(sport => {
    sportStats[sport] = { total: 0, wins: 0, losses: 0, pending: 0, profit: 0 };
  });

  APP_STATE.bets.forEach(bet => {
    if (!sportStats[bet.sport]) {
      sportStats[bet.sport] = { total: 0, wins: 0, losses: 0, pending: 0, profit: 0 };
    }

    const stats = sportStats[bet.sport];
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
        <div class="stat-label">Összes Fogadás</div>
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
        <div class="stat-label">Függőben</div>
        <div class="stat-value text-warning">${stats.pending}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Összes Tét</div>
        <div class="stat-value">${stats.totalStaked.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Nyitott Tét</div>
        <div class="stat-value">${stats.openStake.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Összes Visszatérítés</div>
        <div class="stat-value">${stats.totalReturns.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Átlagos Szorzó</div>
        <div class="stat-value">${calculateAverageOdds()}</div>
      </div>
    </div>
  `;
}

function generateSportsStatsHTML() {
  const sportStats = calculateSportStats();
  let html = '<div class="grid grid-2 gap-2">';

  Object.entries(sportStats).forEach(([sport, stats]) => {
    if (stats.total === 0) return;

    const winRate = (stats.wins / (stats.wins + stats.losses) * 100) || 0;
    const profitClass = stats.profit >= 0 ? 'text-success' : 'text-error';

    html += `
      <div class="stat-card">
        <h4>${sport}</h4>
        <div class="text-secondary">
          Fogadások: ${stats.total} | 
          Nyerési %: ${winRate.toFixed(1)}%
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
    const profitLoss = data.current_capital - data.initial_capital;
    const roi = data.initial_capital > 0 ? (profitLoss / data.initial_capital * 100) : 0;
    const profitClass = profitLoss >= 0 ? 'text-success' : 'text-error';

    html += `
      <div class="stat-card">
        <h4>${name}</h4>
        <div class="text-secondary">
          Fogadások: ${stats.total} | 
          Nyerési %: ${stats.winRate.toFixed(1)}%
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
  if (APP_STATE.bets.length === 0) return '0.00';
  const sum = APP_STATE.bets.reduce((acc, bet) => acc + bet.odds, 0);
  return (sum / APP_STATE.bets.length).toFixed(2);
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

  Object.entries(sportStats).forEach(([sport, stats]) => {
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
  const sortedBets = [...APP_STATE.bets].sort((a, b) => new Date(a.date) - new Date(b.date));
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

  APP_STATE.bets.forEach(bet => {
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
  content += `Export Dátuma: ${new Date().toLocaleString('hu-HU')}\n\n`;

  content += '--- STATISZTIKA ---\n';
  const stats = calculateOverallStats();
  content += `Összes Fogadás: ${stats.totalBets}\n`;
  content += `Nyerési Arány: ${stats.winRate}%\n`;
  content += `Nettó Profit: ${stats.netProfit.toFixed(2)}\n`;
  content += `ROI: ${stats.roi}%\n\n`;

  content += '--- TIPPADÓK ---\n';
  Object.entries(APP_STATE.tipstersData).forEach(([name, data]) => {
    if (data.initial_set) {
      content += `${name}: ${data.initial_capital.toFixed(2)} -> ${data.current_capital.toFixed(2)}\n`;
    }
  });

  content += '\n--- FOGADÁSOK ---\n';
  APP_STATE.bets.forEach((bet, i) => {
    content += `${i + 1}. ${bet.tipster} - ${bet.team}\n`;
    content += `   Sport: ${bet.sport}, Tét: ${bet.betAmount.toFixed(2)}, Szorzó: ${bet.odds.toFixed(2)}\n`;
    content += `   Eredmény: ${bet.outcome}, Dátum: ${new Date(bet.date).toLocaleString('hu-HU')}\n`;
    if (bet.notes) content += `   Megjegyzés: ${bet.notes}\n`;
    content += '\n';
  });

  downloadFile(content, `bettracker_export_${getDateString()}.txt`, 'text/plain');
}

function exportCSV() {
  let csv = 'Dátum,Tippadó,Sportág,Mérkőzés/Piac,Tét,Szorzó,Eredmény,Megjegyzések\n';

  APP_STATE.bets.forEach(bet => {
    csv += [
      csvCell(new Date(bet.date).toLocaleDateString('hu-HU')),
      csvCell(bet.tipster),
      csvCell(bet.sport),
      csvCell(bet.team),
      bet.betAmount.toFixed(2),
      bet.odds.toFixed(2),
      csvCell(bet.outcome),
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

      showConfirm('Importálás módja?', () => {
        // Merge
        Object.assign(APP_STATE.tipstersData, data.tipstersData);
        APP_STATE.bets.push(...(data.bets || []).map(normalizeStoredBet));
        saveToStorage();
        refreshUI();
        showNotification('Adatok egyesítve!', 'success');
      }, () => {
        // Replace
        APP_STATE.tipstersData = data.tipstersData;
        APP_STATE.bets = (data.bets || []).map(normalizeStoredBet);
        saveToStorage();
        refreshUI();
        showNotification('Adatok lecserélve!', 'success');
      });
    } catch (err) {
      showAlert('Hiba az importálás során!', 'error');
    }
  };
  reader.readAsText(file);
}

function importTextJSON() {
  const raw = DOM.llmImportInput?.value.trim();
  if (!raw) {
    showAlert('Nincs importálható JSON adat.', 'warning');
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
      showAlert('Nem találtam érvényes fogadást a JSON-ban.', 'warning');
      return;
    }

    APP_STATE.bets.push(...imported);
    normalizeDefaultTipsterNames();
    saveToStorage();
    populateSelects();
    refreshUI();
    showNotification(`${imported.length} fogadás importálva.`, 'success');
  } catch (err) {
    showAlert('Érvénytelen JSON formátum.', 'error');
  }
}

function normalizeImportedBet(item) {
  if (!item || typeof item !== 'object') return null;
  const betAmount = Number(item.betAmount ?? item.amount ?? item.stake);
  const odds = Number(item.odds ?? item.decimalOdds);
  const tipster = String(item.tipster || 'Tippadó 1').trim();
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
    notes: item.notes || item.note || ''
  });
}

function fillSampleImport() {
  if (!DOM.llmImportInput) return;
  DOM.llmImportInput.value = JSON.stringify([
    {
      tipster: 'Tippadó 1',
      sport: 'Labdarúgás',
      team: 'Real Madrid - Barcelona, Over 2.5',
      betAmount: 10,
      odds: 1.85,
      outcome: 'pending',
      notes: 'demo'
    }
  ], null, 2);
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
  return normalized;
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

function resetAllData() {
  showConfirm('Biztosan törölni szeretné az összes adatot?', () => {
    localStorage.removeItem(STORAGE_KEY);
    APP_STATE.tipstersData = {};
    APP_STATE.bets = [];
    initTipstersData();
    saveToStorage();
    refreshUI();
    showNotification('Minden adat törölve!', 'success');
  });
}

// ===== UI Helpers =====
function populateSelects() {
  // Tipsters
  DOM.tipsterSelect.innerHTML = '<option value="">Válasszon tippadót...</option>';
  DOM.filterTipster.innerHTML = '<option value="">Mind</option>';

  getSortedTipsterNames().forEach(name => {
    DOM.tipsterSelect.innerHTML += `<option value="${name}">${name}</option>`;
    DOM.filterTipster.innerHTML += `<option value="${name}">${name}</option>`;
  });

  // Sports
  DOM.sportSelect.innerHTML = '<option value="">Válasszon sportágat...</option>';
  DOM.filterSport.innerHTML = '<option value="">Mind</option>';

  SPORTS.forEach(sport => {
    DOM.sportSelect.innerHTML += `<option value="${sport}">${sport}</option>`;
    DOM.filterSport.innerHTML += `<option value="${sport}">${sport}</option>`;
  });
}

function getSortedTipsterNames() {
  const names = Object.keys(APP_STATE.tipstersData);
  const custom = names.filter(n => !isDefaultName(n)); // megtartjuk a meglévő sorrendet
  const defaults = names
    .filter(isDefaultName)
    .sort((a, b) => parseInt(a.split(' ')[1], 10) - parseInt(b.split(' ')[1], 10));
  return [...custom, ...defaults];
}

function isDefaultName(name) {
  return /^Tippadó\s+\d+$/.test(name);
}

// Rename default "Tippadó N" entries so numbering starts after custom names
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
    const newName = `Tippadó ${offset + idx}`;
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
  showModal(type === 'error' ? 'Hiba' : type === 'warning' ? 'Figyelmeztetés' : 'Információ', message);
}

function showConfirm(message, onConfirm, onCancel = null) {
  showModal('Megerősítés', message, 'confirm', onConfirm);
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
    <div class="notification-title">${type === 'success' ? 'Siker' : type === 'error' ? 'Hiba' : 'Információ'}</div>
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
  DOM.sportSelect.value = bet.sport;
  DOM.teamInput.value = bet.team;
  DOM.betAmountInput.value = bet.betAmount;
  DOM.oddsInput.value = bet.odds;
  DOM.outcomeSelect.value = bet.outcome;
  DOM.betDateInput.value = bet.date.slice(0, 16);
  DOM.notesInput.value = bet.notes || '';

  // Remove the old bet
  const betIndex = APP_STATE.bets.findIndex(b => b.id === betId);
  APP_STATE.bets.splice(betIndex, 1);

  // Scroll to form
  document.getElementById('newBetSection').scrollIntoView({ behavior: 'smooth' });

  showNotification('Fogadás szerkesztése - módosítsa és mentse újra', 'info');
}

function viewTipsterDetails(name) {
  const data = APP_STATE.tipstersData[name];
  const stats = calculateTipsterStats(name);
  const tipsterBets = APP_STATE.bets.filter(bet => bet.tipster === name);

  let detailsHTML = `
    <h3>${name} Részletek</h3>
    <div class="grid grid-2 gap-2 mb-3">
      <div>Kezdő Tőke: ${data.initial_capital.toFixed(2)}</div>
      <div>Aktuális Tőke: ${data.current_capital.toFixed(2)}</div>
      <div>Összes Fogadás: ${stats.total}</div>
      <div>Nyerési Arány: ${stats.winRate.toFixed(1)}%</div>
    </div>
    <h4>Utolsó 5 fogadás:</h4>
    <ul>
  `;

  tipsterBets.slice(-5).reverse().forEach(bet => {
    detailsHTML += `<li>${bet.team} - ${bet.betAmount.toFixed(2)} @ ${bet.odds.toFixed(2)} (${bet.outcome})</li>`;
  });

  detailsHTML += '</ul>';

  // Használd a showModal-t, hogy az OK gomb működjön
  showModal('Tippadó Részletek', '', 'alert', null);
  DOM.modalMessage.innerHTML = detailsHTML;
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


