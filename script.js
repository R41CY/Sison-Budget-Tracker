// ===== STORAGE =====
const STORAGE = {
  transactions: 'sisonFinancial.transactions',
  recipes: 'sisonFinancial.recipes',
  settings: 'sisonFinancial.settings',
  welcome: 'sisonFinancial.welcomeShown'
};

// ===== STATE =====
const state = {
  transactions: [],
  recipes: [],
  settings: { openingBalance: 0 },
  editingTransaction: null,
  editingRecipe: null,
  ingredients: []
};

// ===== UTILITIES =====
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const formatMoney = n => new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(n);

const formatDate = str => {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

const today = () => new Date().toISOString().split('T')[0];

const ICONS = {
  plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  pencil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  utensils: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  inbox: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  eye: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
};

// ===== TOAST =====
const toast = (msg, type = 'success') => {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
};

// ===== STORAGE =====
const load = () => {
  try {
    state.transactions = JSON.parse(localStorage.getItem(STORAGE.transactions)) || [];
    state.recipes = JSON.parse(localStorage.getItem(STORAGE.recipes)) || [];
    state.settings = JSON.parse(localStorage.getItem(STORAGE.settings)) || { openingBalance: 0 };
  } catch (e) {
    console.error('Load error:', e);
  }
};

const saveTrans = () => localStorage.setItem(STORAGE.transactions, JSON.stringify(state.transactions));
const saveRecipes = () => localStorage.setItem(STORAGE.recipes, JSON.stringify(state.recipes));
const saveSettings = () => localStorage.setItem(STORAGE.settings, JSON.stringify(state.settings));

// ===== NAVIGATION =====
const navigateTo = page => {
  $$('.page').forEach(p => p.classList.remove('active'));
  $(`page-${page}`).classList.add('active');
  
  $$('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  
  closeSidebar();
  window.scrollTo(0, 0);
  
  if (page === 'dashboard') renderDashboard();
  if (page === 'transactions') renderTransactions();
  if (page === 'recipes') renderRecipes();
  if (page === 'daily') initDaily();
};

$$('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(link.dataset.page);
  });
});

// ===== SIDEBAR =====
const openSidebar = () => {
  $('sidebar').classList.add('active');
  $('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeSidebar = () => {
  $('sidebar').classList.remove('active');
  $('overlay').classList.remove('active');
  document.body.style.overflow = '';
};

$('menuToggle').addEventListener('click', openSidebar);
$('sidebarClose').addEventListener('click', closeSidebar);
$('overlay').addEventListener('click', closeSidebar);

// ===== WELCOME MODAL =====
const showWelcome = () => $('welcomeModal').classList.add('active');
const hideWelcome = () => $('welcomeModal').classList.remove('active');

$('closeWelcome').addEventListener('click', hideWelcome);
$('getStarted').addEventListener('click', () => {
  if ($('dontShowAgain').checked) {
    localStorage.setItem(STORAGE.welcome, 'true');
  }
  hideWelcome();
});
$('welcomeModal').addEventListener('click', e => {
  if (e.target.classList.contains('modal-backdrop')) hideWelcome();
});

$('mobileHelp').addEventListener('click', () => navigateTo('guide'));

// ===== RECIPE MODAL =====
const showRecipeModal = () => $('recipeModal').classList.add('active');
const hideRecipeModal = () => $('recipeModal').classList.remove('active');

$('closeRecipeModal').addEventListener('click', hideRecipeModal);
$('recipeModal').addEventListener('click', e => {
  if (e.target.classList.contains('modal-backdrop')) hideRecipeModal();
});

// ===== EMPTY STATE HELPER =====
const emptyState = (msg) => `
  <div class="empty-state">
    <div class="empty-state-icon">${ICONS.inbox}</div>
    ${msg}
  </div>
`;

// ===== DASHBOARD =====
const renderDashboard = () => {
  const hasData = state.transactions.length > 0;
  $('welcomeBanner').style.display = hasData ? 'none' : 'block';
  
  const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const balance = state.settings.openingBalance + net;
  
  $('netProfit').textContent = formatMoney(net);
  $('totalIncome').textContent = formatMoney(income);
  $('totalExpense').textContent = formatMoney(expense);
  $('currentBalance').textContent = formatMoney(balance);
  
  const todayStr = today();
  $('todayDate').textContent = formatDate(todayStr);
  
  const todayTrans = state.transactions.filter(t => t.date === todayStr);
  const todayInc = todayTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const todayExp = todayTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const todayNet = todayInc - todayExp;
  
  $('todayIncome').textContent = formatMoney(todayInc);
  $('todayExpense').textContent = formatMoney(todayExp);
  $('todayNet').textContent = '\u20B1' + formatMoney(todayNet);
  $('todayNet').className = `today-value ${todayNet >= 0 ? 'text-success' : 'text-danger'}`;
  
  $('statsTransactions').textContent = state.transactions.length;
  $('statsRecipes').textContent = state.recipes.length;
  const days = new Set(state.transactions.map(t => t.date)).size;
  $('statsAvgExpense').textContent = formatMoney(days > 0 ? expense / days : 0);
  
  const recent = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  $('recentTransactions').innerHTML = recent.length === 0 
    ? emptyState('No transactions yet. Add your first one!')
    : recent.map(t => `
      <div class="transaction-item">
        <div class="transaction-main">
          <div class="transaction-info">
            <div class="transaction-desc">${t.description}</div>
            <div class="transaction-meta">
              <span class="badge badge-${t.type === 'income' ? 'success' : 'danger'}">${t.type}</span>
              <span>${t.category}</span>
              <span>${formatDate(t.date)}</span>
            </div>
          </div>
          <div class="transaction-amount ${t.type === 'income' ? 'text-success' : 'text-danger'}">
            ${t.type === 'expense' ? '-' : '+'}\u20B1${formatMoney(t.amount)}
          </div>
        </div>
      </div>
    `).join('');
};

// ===== TRANSACTIONS =====
const renderTransSummary = () => {
  const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = state.settings.openingBalance + income - expense;
  
  $('transIncome').textContent = formatMoney(income);
  $('transExpense').textContent = formatMoney(expense);
  $('transBalance').textContent = formatMoney(balance);
};

const buildFilters = () => {
  const cats = new Set(state.transactions.map(t => t.category));
  $('filterCategory').innerHTML = '<option value="all">All Categories</option>' +
    [...cats].sort().map(c => `<option value="${c}">${c}</option>`).join('');
  
  $('categoryList').innerHTML = [...cats].sort().map(c => `<option value="${c}">`).join('');
  
  const months = new Set();
  state.transactions.forEach(t => {
    const d = new Date(t.date + 'T00:00:00');
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });
  $('filterMonth').innerHTML = '<option value="all">All Months</option>' +
    [...months].sort().reverse().map(m => `<option value="${m}">${m}</option>`).join('');
};

const matchFilters = t => {
  const type = $('filterType').value;
  const cat = $('filterCategory').value;
  const month = $('filterMonth').value;
  const search = $('filterSearch').value.toLowerCase();
  
  if (type !== 'all' && t.type !== type) return false;
  if (cat !== 'all' && t.category !== cat) return false;
  
  const d = new Date(t.date + 'T00:00:00');
  const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (month !== 'all' && m !== month) return false;
  
  if (search && !`${t.description} ${t.category} ${t.notes || ''}`.toLowerCase().includes(search)) return false;
  
  return true;
};

const renderTransList = () => {
  const filtered = state.transactions.filter(matchFilters).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  $('transactionsList').innerHTML = filtered.length === 0
    ? emptyState('No transactions found')
    : filtered.map(t => `
      <div class="transaction-item">
        <div class="transaction-main">
          <div class="transaction-info">
            <div class="transaction-desc">${t.description}</div>
            <div class="transaction-meta">
              <span class="badge badge-${t.type === 'income' ? 'success' : 'danger'}">${t.type}</span>
              <span>${t.category}</span>
              <span>${formatDate(t.date)}</span>
              ${t.notes ? `<span>${t.notes}</span>` : ''}
            </div>
          </div>
          <div class="transaction-amount ${t.type === 'income' ? 'text-success' : 'text-danger'}">
            ${t.type === 'expense' ? '-' : '+'}\u20B1${formatMoney(t.amount)}
          </div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-sm btn-ghost" onclick="editTrans('${t.id}')">${ICONS.edit} Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTrans('${t.id}')">${ICONS.trash} Delete</button>
        </div>
      </div>
    `).join('');
};

const renderTransactions = () => {
  $('openingBalance').value = state.settings.openingBalance || '';
  buildFilters();
  renderTransSummary();
  renderTransList();
};

const setFormTitle = (icon, text) => {
  $('formTitleIcon').innerHTML = icon;
  $('formTitleText').textContent = text;
};

const resetTransForm = () => {
  $('transactionForm').reset();
  $('transDate').value = today();
  state.editingTransaction = null;
  setFormTitle(ICONS.plus, 'Add Transaction');
  $('transSubmit').innerHTML = `${ICONS.plus} Add Transaction`;
  $('transCancel').style.display = 'none';
};

window.editTrans = id => {
  const t = state.transactions.find(x => x.id === id);
  if (!t) return;
  
  state.editingTransaction = id;
  $('transType').value = t.type;
  $('transDate').value = t.date;
  $('transCategory').value = t.category;
  $('transAmount').value = t.amount.toFixed(2);
  $('transDescription').value = t.description;
  $('transNotes').value = t.notes || '';
  
  setFormTitle(ICONS.pencil, 'Edit Transaction');
  $('transSubmit').innerHTML = `${ICONS.check} Update Transaction`;
  $('transCancel').style.display = 'block';
  
  navigateTo('transactions');
  $('transactionForm').scrollIntoView({ behavior: 'smooth' });
};

window.deleteTrans = id => {
  if (!confirm('Delete this transaction?')) return;
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveTrans();
  renderTransactions();
  toast('Transaction deleted');
};

$('transactionForm').addEventListener('submit', e => {
  e.preventDefault();
  
  const trans = {
    id: state.editingTransaction || crypto.randomUUID(),
    type: $('transType').value,
    date: $('transDate').value,
    category: $('transCategory').value.trim(),
    amount: parseFloat($('transAmount').value),
    description: $('transDescription').value.trim(),
    notes: $('transNotes').value.trim()
  };
  
  if (state.editingTransaction) {
    state.transactions = state.transactions.map(t => t.id === state.editingTransaction ? trans : t);
    toast('Transaction updated');
  } else {
    state.transactions.push(trans);
    toast('Transaction added');
  }
  
  saveTrans();
  resetTransForm();
  renderTransactions();
});

$('transCancel').addEventListener('click', resetTransForm);

['filterType', 'filterCategory', 'filterMonth', 'filterSearch'].forEach(id => {
  $(id).addEventListener('input', renderTransList);
  $(id).addEventListener('change', renderTransList);
});

$('resetFilters').addEventListener('click', () => {
  $('filterType').value = 'all';
  $('filterCategory').value = 'all';
  $('filterMonth').value = 'all';
  $('filterSearch').value = '';
  renderTransList();
});

$('openingBalance').addEventListener('change', () => {
  const val = parseFloat($('openingBalance').value) || 0;
  state.settings.openingBalance = Math.max(0, val);
  saveSettings();
  renderTransSummary();
  toast('Opening balance updated');
});

$('exportTransactions').addEventListener('click', () => {
  if (!state.transactions.length) return toast('No transactions', 'error');
  
  const header = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Notes'];
  const rows = state.transactions.map(t => [t.date, t.type, t.category, t.description, t.amount, t.notes || '']);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `transactions-${today()}.csv`;
  a.click();
  toast('Exported successfully');
});

// ===== RECIPES =====
const calcRecipe = () => {
  if (state.ingredients.length === 0) {
    $('costSummary').style.display = 'none';
    return;
  }
  
  $('costSummary').style.display = 'block';
  
  const total = state.ingredients.reduce((s, i) => s + i.cost, 0);
  const qty = parseFloat($('recipeYield').value) || 1;
  const price = parseFloat($('recipePrice').value) || 0;
  const costPer = total / qty;
  const profitPer = price - costPer;
  const margin = price > 0 ? (profitPer / price) * 100 : 0;
  
  $('recipeTotalCost').textContent = formatMoney(total);
  $('recipeCostPerUnit').textContent = formatMoney(costPer);
  $('recipeProfitPerUnit').textContent = '\u20B1' + formatMoney(profitPer);
  $('recipeProfitPerUnit').className = profitPer >= 0 ? 'text-success' : 'text-danger';
  $('recipeProfitMargin').textContent = margin.toFixed(1) + '%';
  $('recipeProfitMargin').className = margin >= 40 ? 'text-success' : margin >= 20 ? '' : 'text-danger';
};

const renderIngredients = () => {
  $('ingredientsList').innerHTML = state.ingredients.length === 0
    ? emptyState('No ingredients added')
    : state.ingredients.map((ing, i) => `
      <div class="ingredient-item">
        <div class="ingredient-info">
          <div class="ingredient-name">${ing.name}</div>
          <div class="ingredient-detail">${ing.qty} ${ing.unit}</div>
        </div>
        <span class="ingredient-cost">\u20B1${formatMoney(ing.cost)}</span>
        <button class="btn btn-sm btn-danger" onclick="removeIng(${i})">${ICONS.trash} Remove</button>
      </div>
    `).join('');
  
  calcRecipe();
};

window.removeIng = i => {
  state.ingredients.splice(i, 1);
  renderIngredients();
};

$('addIngredient').addEventListener('click', () => {
  const name = $('ingredientName').value.trim();
  const qty = parseFloat($('ingredientQty').value);
  const unit = $('ingredientUnit').value.trim();
  const cost = parseFloat($('ingredientCost').value);
  
  if (!name || !unit || isNaN(qty) || isNaN(cost) || qty <= 0 || cost <= 0) {
    return toast('Fill all ingredient fields', 'error');
  }
  
  state.ingredients.push({ name, qty, unit, cost });
  
  $('ingredientName').value = '';
  $('ingredientQty').value = '';
  $('ingredientUnit').value = '';
  $('ingredientCost').value = '';
  
  renderIngredients();
  toast('Ingredient added');
  $('ingredientName').focus();
});

$('recipeYield').addEventListener('input', calcRecipe);
$('recipePrice').addEventListener('input', calcRecipe);

const setRecipeFormTitle = (icon, text) => {
  $('recipeFormTitleIcon').innerHTML = icon;
  $('recipeFormTitleText').textContent = text;
};

const resetRecipeForm = () => {
  $('recipeForm').reset();
  state.ingredients = [];
  state.editingRecipe = null;
  setRecipeFormTitle(ICONS.utensils, 'Create Recipe');
  $('recipeSubmit').textContent = 'Save Recipe';
  $('recipeCancel').style.display = 'none';
  renderIngredients();
};

$('recipeForm').addEventListener('submit', e => {
  e.preventDefault();
  
  if (state.ingredients.length === 0) {
    return toast('Add at least one ingredient', 'error');
  }
  
  const total = state.ingredients.reduce((s, i) => s + i.cost, 0);
  const qty = parseFloat($('recipeYield').value);
  const price = parseFloat($('recipePrice').value);
  
  const recipe = {
    id: state.editingRecipe || crypto.randomUUID(),
    name: $('recipeName').value.trim(),
    yield: qty,
    price,
    ingredients: [...state.ingredients],
    totalCost: total,
    costPer: total / qty,
    profitPer: price - (total / qty),
    margin: price > 0 ? ((price - (total / qty)) / price) * 100 : 0,
    created: new Date().toISOString()
  };
  
  if (state.editingRecipe) {
    state.recipes = state.recipes.map(r => r.id === state.editingRecipe ? recipe : r);
    toast('Recipe updated');
  } else {
    state.recipes.push(recipe);
    toast('Recipe saved');
  }
  
  saveRecipes();
  resetRecipeForm();
  renderRecipes();
});

$('recipeCancel').addEventListener('click', resetRecipeForm);

const renderRecipes = () => {
  $('recipesList').innerHTML = state.recipes.length === 0
    ? emptyState('No recipes saved yet')
    : state.recipes.map(r => `
      <div class="recipe-card">
        <h4>${r.name}</h4>
        <div class="recipe-stats">
          <div><span>Yield:</span> <strong>${r.yield} units</strong></div>
          <div><span>Price:</span> <strong>\u20B1${formatMoney(r.price)}</strong></div>
          <div><span>Cost/unit:</span> <strong>\u20B1${formatMoney(r.costPer)}</strong></div>
          <div class="${r.profitPer >= 0 ? 'text-success' : 'text-danger'}">
            <span>Profit:</span> <strong>\u20B1${formatMoney(r.profitPer)} (${r.margin.toFixed(1)}%)</strong>
          </div>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-sm btn-ghost" onclick="viewRecipe('${r.id}')">${ICONS.eye} View</button>
          <button class="btn btn-sm btn-ghost" onclick="editRecipe('${r.id}')">${ICONS.edit} Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecipe('${r.id}')">${ICONS.trash} Delete</button>
        </div>
      </div>
    `).join('');
};

window.viewRecipe = id => {
  const r = state.recipes.find(x => x.id === id);
  if (!r) return;
  
  const marginClass = r.margin >= 40 ? 'text-success' : r.margin >= 20 ? '' : 'text-danger';
  
  $('recipeModalBody').innerHTML = `
    <div class="recipe-detail-header">
      <div class="recipe-detail-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
          <path d="M7 2v20"/>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
        </svg>
      </div>
      <div>
        <h3>${r.name}</h3>
        <p>Yield: ${r.yield} units | Selling: \u20B1${formatMoney(r.price)} each</p>
      </div>
    </div>
    
    <div class="recipe-detail-stats">
      <div class="recipe-detail-stat">
        <span>Total Cost</span>
        <strong class="text-danger">\u20B1${formatMoney(r.totalCost)}</strong>
      </div>
      <div class="recipe-detail-stat">
        <span>Cost/Unit</span>
        <strong>\u20B1${formatMoney(r.costPer)}</strong>
      </div>
      <div class="recipe-detail-stat">
        <span>Profit/Unit</span>
        <strong class="${r.profitPer >= 0 ? 'text-success' : 'text-danger'}">\u20B1${formatMoney(r.profitPer)}</strong>
      </div>
      <div class="recipe-detail-stat">
        <span>Margin</span>
        <strong class="${marginClass}">${r.margin.toFixed(1)}%</strong>
      </div>
    </div>
    
    <div class="recipe-detail-ingredients">
      <h4>Ingredients</h4>
      <div class="recipe-detail-ing-list">
        ${r.ingredients.map(i => `
          <div class="recipe-detail-ing-item">
            <span>${i.name} (${i.qty} ${i.unit})</span>
            <span>\u20B1${formatMoney(i.cost)}</span>
          </div>
        `).join('')}
      </div>
      <div class="recipe-detail-total">
        <span>Total Ingredient Cost</span>
        <span>\u20B1${formatMoney(r.totalCost)}</span>
      </div>
    </div>
  `;
  
  showRecipeModal();
};

window.editRecipe = id => {
  const r = state.recipes.find(x => x.id === id);
  if (!r) return;
  
  state.editingRecipe = id;
  state.ingredients = [...r.ingredients];
  
  $('recipeName').value = r.name;
  $('recipeYield').value = r.yield;
  $('recipePrice').value = r.price;
  
  setRecipeFormTitle(ICONS.pencil, 'Edit Recipe');
  $('recipeSubmit').innerHTML = `${ICONS.check} Update Recipe`;
  $('recipeCancel').style.display = 'block';
  
  renderIngredients();
  navigateTo('recipes');
  $('recipeForm').scrollIntoView({ behavior: 'smooth' });
};

window.deleteRecipe = id => {
  if (!confirm('Delete this recipe?')) return;
  state.recipes = state.recipes.filter(r => r.id !== id);
  saveRecipes();
  renderRecipes();
  toast('Recipe deleted');
};

$('exportRecipes').addEventListener('click', () => {
  if (!state.recipes.length) return toast('No recipes', 'error');
  
  const blob = new Blob([JSON.stringify(state.recipes, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `recipes-${today()}.json`;
  a.click();
  toast('Recipes exported');
});

// ===== DAILY REPORTS =====
const initDaily = () => {
  const t = today();
  const week = new Date();
  week.setDate(week.getDate() - 7);
  
  $('dailyFrom').value = week.toISOString().split('T')[0];
  $('dailyTo').value = t;
};

$('dailyForm').addEventListener('submit', e => {
  e.preventDefault();
  
  const from = new Date($('dailyFrom').value + 'T00:00:00');
  const to = new Date($('dailyTo').value + 'T00:00:00');
  
  if (from > to) return toast('Invalid date range', 'error');
  
  const daily = {};
  state.transactions.forEach(t => {
    const d = new Date(t.date + 'T00:00:00');
    if (d >= from && d <= to) {
      if (!daily[t.date]) daily[t.date] = { income: 0, expense: 0 };
      if (t.type === 'income') daily[t.date].income += t.amount;
      else daily[t.date].expense += t.amount;
    }
  });
  
  const dates = Object.keys(daily).sort().reverse();
  
  if (dates.length === 0) {
    $('periodSummary').style.display = 'none';
    $('dailyCard').style.display = 'block';
    $('dailyList').innerHTML = emptyState('No transactions in this period');
    return;
  }
  
  let totalInc = 0, totalExp = 0;
  
  $('dailyList').innerHTML = dates.map(date => {
    const d = daily[date];
    const net = d.income - d.expense;
    totalInc += d.income;
    totalExp += d.expense;
    
    return `
      <div class="daily-item">
        <div class="daily-date">${formatDate(date)}</div>
        <div class="daily-stats-grid">
          <div class="daily-stat-item">
            <span class="daily-stat-label">Income</span>
            <span class="daily-stat-value text-success">\u20B1${formatMoney(d.income)}</span>
          </div>
          <div class="daily-stat-item">
            <span class="daily-stat-label">Expense</span>
            <span class="daily-stat-value text-danger">\u20B1${formatMoney(d.expense)}</span>
          </div>
          <div class="daily-stat-item">
            <span class="daily-stat-label">Net</span>
            <span class="daily-stat-value ${net >= 0 ? 'text-success' : 'text-danger'}">\u20B1${formatMoney(net)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const totalNet = totalInc - totalExp;
  
  $('periodIncome').textContent = formatMoney(totalInc);
  $('periodExpense').textContent = formatMoney(totalExp);
  $('periodNet').textContent = formatMoney(totalNet);
  $('periodNetWrap').className = `balance-value ${totalNet >= 0 ? 'text-success' : 'text-danger'}`;
  $('periodAvg').textContent = formatMoney(totalExp / dates.length);
  
  $('periodSummary').style.display = 'grid';
  $('dailyCard').style.display = 'block';
  
  toast('Report generated');
});

// ===== EXPORT ALL =====
$('exportAll').addEventListener('click', () => {
  const data = {
    transactions: state.transactions,
    recipes: state.recipes,
    settings: state.settings,
    exported: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sison-financial-backup-${today()}.json`;
  a.click();
  toast('Backup exported');
});

// ===== IMPORT BACKUP =====
$('importAll').addEventListener('click', () => {
  $('importFile').click();
});

$('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const data = JSON.parse(evt.target.result);
      
      if (!data.transactions && !data.recipes) {
        return toast('Invalid backup file', 'error');
      }
      
      if (!confirm('This will replace all your current data. Continue?')) {
        $('importFile').value = '';
        return;
      }
      
      if (data.transactions) {
        state.transactions = data.transactions;
        saveTrans();
      }
      if (data.recipes) {
        state.recipes = data.recipes;
        saveRecipes();
      }
      if (data.settings) {
        state.settings = data.settings;
        saveSettings();
      }
      
      toast('Backup imported successfully');
      navigateTo('dashboard');
    } catch (err) {
      toast('Failed to read backup file', 'error');
    }
    
    $('importFile').value = '';
  };
  reader.readAsText(file);
});

// ===== INIT =====
const init = () => {
  load();
  $('transDate').value = today();
  resetTransForm();
  resetRecipeForm();
  navigateTo('dashboard');
  
  if (!localStorage.getItem(STORAGE.welcome)) {
    setTimeout(showWelcome, 500);
  }
};

init();
