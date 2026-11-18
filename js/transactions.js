/* transactions.js – transaction CRUD, filtering, table + modal UI. Emits "et:change" on every data change. */
ET.Tx = (() => {
  const U = ET.Utils, S = ET.Storage, $ = U.$;
  let list = [], editingId = null;
  const filters = { search: '', type: 'all', category: 'all', from: '', to: '', sort: 'desc' };

  const notify = () => document.dispatchEvent(new CustomEvent('et:change'));
  const persist = () => { S.saveTransactions(list); notify(); };
  const all = () => list.slice();
  const reload = () => { list = S.getTransactions(); notify(); };

  const validate = d => {
    const e = {}, a = Number(d.amount);
    if (!String(d.title).trim()) e.title = 'Title is required.';
    if (d.amount === '' || !isFinite(a)) e.amount = 'Enter a valid amount.';
    else if (a <= 0) e.amount = 'Amount must be greater than zero.';
    else if (a > 1e9) e.amount = 'Amount is too large.';
    if (!d.category) e.category = 'Select a category.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) e.date = 'Pick a valid date.';
    return e;
  };
  const clean = d => ({ title: d.title.trim(), amount: Number(d.amount), type: d.type, category: d.category, date: d.date, description: (d.description || '').trim() });
  const add = d => { list.push({ id: U.uid(), ...clean(d) }); persist(); };
  const update = (id, d) => { list = list.map(t => (t.id === id ? { ...t, ...clean(d) } : t)); persist(); };
  const remove = id => {
    const t = list.find(x => x.id === id); if (!t) return;
    if (!confirm(`Delete "${t.title}" (${U.fmt(t.amount)})? This cannot be undone.`)) return;
    list = list.filter(x => x.id !== id); persist();
  };
  const sorted = (arr, dir = 'desc') => arr.slice().sort((a, b) => (dir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  const filtered = () => {
    const q = filters.search.trim().toLowerCase();
    return sorted(list.filter(t => (!q || t.title.toLowerCase().includes(q)) && (filters.type === 'all' || t.type === filters.type) &&
      (filters.category === 'all' || t.category === filters.category) && (!filters.from || t.date >= filters.from) && (!filters.to || t.date <= filters.to)), filters.sort);
  };

  const rowHTML = (t, edit) => `<tr>
    <td><strong>${U.esc(t.title)}</strong>${t.description ? `<div class="muted small">${U.esc(t.description)}</div>` : ''}</td>
    <td><span class="chip">${U.esc(t.category)}</span></td><td>${U.fmtDate(t.date)}</td>
    <td><span class="badge ${t.type}">${t.type === 'income' ? 'Income' : 'Expense'}</span></td>
    <td class="r amt ${t.type}">${t.type === 'income' ? '+' : '−'}${U.fmt(t.amount)}</td>
    <td class="r actions">${edit ? `<button class="icon-btn" data-edit="${t.id}" title="Edit"><i data-lucide="pencil">Edit</i></button>` : ''}<button class="icon-btn danger" data-del="${t.id}" title="Delete"><i data-lucide="trash-2">Del</i></button></td></tr>`;
  const tableHTML = (rows, edit, empty) => !rows.length
    ? `<div class="empty-state"><i data-lucide="inbox"></i><h4>${empty.title}</h4><p>${empty.text}</p></div>`
    : `<table class="tx-table"><thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Type</th><th class="r">Amount</th><th class="r">${edit ? 'Actions' : 'Action'}</th></tr></thead><tbody>${rows.map(t => rowHTML(t, edit)).join('')}</tbody></table>`;

  const render = () => {
    const rows = filtered();
    $('txCount').textContent = `(${rows.length} of ${list.length})`;
    $('txTable').innerHTML = tableHTML(rows, true, list.length
      ? { title: 'No matching transactions', text: 'Try changing or clearing your filters.' }
      : { title: 'No transactions yet', text: 'Click “Add transaction” to record your first one.' });
  };

  /* ---- modal ---- */
  const fillCats = (type, sel) => { $('fCategory').innerHTML = (type === 'income' ? U.INCOME_CATS : U.EXPENSE_CATS).map(c => `<option>${c}</option>`).join(''); if (sel) $('fCategory').value = sel; };
  const showErrors = e => ['title', 'amount', 'category', 'date'].forEach(k => { $('e-' + k).textContent = e[k] || ''; });
  const closeModal = () => $('modal').classList.remove('open');
  const openModal = id => {
    editingId = id || null; const t = id && list.find(x => x.id === id);
    $('txForm').reset(); showErrors({});
    $('modalTitle').textContent = t ? 'Edit Transaction' : 'Add Transaction';
    const type = t ? t.type : 'expense'; $('fType').value = type; fillCats(type, t && t.category);
    $('fTitle').value = t ? t.title : ''; $('fAmount').value = t ? t.amount : ''; $('fDate').value = t ? t.date : U.today(); $('fDesc').value = t ? t.description : '';
    $('modal').classList.add('open'); $('fTitle').focus();
  };

  const setSearch = v => { filters.search = v; $('fSearch').value = v; $('globalSearch').value = v; };
  const init = () => {
    list = S.getTransactions();
    $('filterCategory').innerHTML = '<option value="all">All categories</option>' + U.ALL_CATS.map(c => `<option>${c}</option>`).join('');
    const bind = (id, key) => $(id).addEventListener('input', e => { filters[key] = e.target.value; render(); });
    bind('filterType', 'type'); bind('filterCategory', 'category'); bind('filterFrom', 'from'); bind('filterTo', 'to'); bind('filterSort', 'sort');
    $('fSearch').addEventListener('input', e => { setSearch(e.target.value); render(); });
    $('globalSearch').addEventListener('input', e => { setSearch(e.target.value); if (location.hash !== '#transactions') location.hash = '#transactions'; else render(); });
    $('clearFilters').addEventListener('click', () => {
      Object.assign(filters, { search: '', type: 'all', category: 'all', from: '', to: '', sort: 'desc' }); setSearch('');
      ['filterType', 'filterCategory'].forEach(i => { $(i).value = 'all'; }); $('filterFrom').value = ''; $('filterTo').value = ''; $('filterSort').value = 'desc'; render();
    });
    $('fType').addEventListener('change', e => fillCats(e.target.value));
    $('addBtn').addEventListener('click', () => openModal()); $('addBtn2').addEventListener('click', () => openModal());
    $('modalClose').addEventListener('click', closeModal); $('modalCancel').addEventListener('click', closeModal);
    $('modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    $('txForm').addEventListener('submit', e => {
      e.preventDefault();
      const d = { type: $('fType').value, title: $('fTitle').value, amount: $('fAmount').value, category: $('fCategory').value, date: $('fDate').value, description: $('fDesc').value };
      const errs = validate(d); showErrors(errs); if (Object.keys(errs).length) return;
      editingId ? update(editingId, d) : add(d); closeModal();
    });
    document.addEventListener('click', e => { // shared by dashboard + transactions tables
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (ed) openModal(ed.dataset.edit); else if (del) remove(del.dataset.del);
    });
  };

  return { init, all, reload, add, update, remove, validate, sorted, filtered, tableHTML, render };
})();
