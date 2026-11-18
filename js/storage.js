/* storage.js – all LocalStorage access lives here. */
ET.Storage = (() => {
  const U = ET.Utils;
  const K = { tx: 'et_transactions', budgets: 'et_budgets', prefs: 'et_prefs', init: 'et_initialized' };
  const DEFAULT_BUDGETS = { overall: 20000, categories: { Food: 2300, Transportation: 1200, Shopping: 2500, Education: 2000, Entertainment: 1000, Healthcare: 1000, Bills: 5500, Other: 500 } };

  const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  const valid = t => t && typeof t.id === 'string' && typeof t.title === 'string' && t.title && Number(t.amount) > 0 &&
    ['income', 'expense'].includes(t.type) && /^\d{4}-\d{2}-\d{2}$/.test(t.date);

  const getTransactions = () => {
    const a = read(K.tx, []);
    return Array.isArray(a) ? a.filter(valid).map(t => ({ id: t.id, title: t.title, amount: Number(t.amount), type: t.type, category: t.category || 'Other', date: t.date, description: t.description || '' })) : [];
  };
  const saveTransactions = list => write(K.tx, list);

  const getBudgets = () => {
    const b = read(K.budgets, null);
    if (!b || typeof b !== 'object') return structuredClone(DEFAULT_BUDGETS);
    const cats = {}; U.EXPENSE_CATS.forEach(c => { const v = Number(b.categories?.[c]); cats[c] = v > 0 ? v : 0; });
    return { overall: Number(b.overall) > 0 ? Number(b.overall) : 0, categories: cats };
  };
  const saveBudgets = b => write(K.budgets, b);
  const getPrefs = () => { const p = read(K.prefs, {}); return { name: typeof p.name === 'string' ? p.name : '' }; };
  const savePrefs = p => write(K.prefs, p);

  const sample = () => {
    const now = new Date(), out = [];
    for (let m = 0; m < 6; m++) {
      const add = (day, title, amount, type, category, description = '') => {
        const d = new Date(now.getFullYear(), now.getMonth() - m, m === 0 ? Math.min(day, now.getDate()) : day);
        out.push({ id: U.uid(), title, amount, type, category, date: U.ymd(d), description });
      };
      add(1, 'Monthly Allowance', 15000 + (m % 2) * 1000, 'income', 'Allowance', 'From parents');
      if (m % 2 === 0) add(12, 'Freelance Web Project', 6000 + m * 500, 'income', 'Freelance');
      if (m === 3) add(5, 'Merit Scholarship', 10000, 'income', 'Scholarship');
      add(2, 'Hostel & Mess Fees', 5000, 'expense', 'Bills');
      add(4, 'Groceries', 2000 + m * 120, 'expense', 'Food', 'Monthly groceries');
      add(8, 'Metro Card Recharge', 800, 'expense', 'Transportation');
      add(10, 'Online Course', 1200 + (m % 3) * 300, 'expense', 'Education');
      add(15, 'Movie & Dinner', 700 + (m % 2) * 400, 'expense', 'Entertainment');
      add(18, 'Clothes', 1500 + m * 100, 'expense', 'Shopping');
      add(20, 'Pharmacy', 450, 'expense', 'Healthcare');
      add(24, 'Stationery', 300, 'expense', 'Other');
    }
    return out;
  };

  const init = () => { if (!read(K.init, false)) { saveTransactions(sample()); saveBudgets(DEFAULT_BUDGETS); write(K.init, true); } };
  const resetDemo = () => { saveTransactions(sample()); saveBudgets(DEFAULT_BUDGETS); write(K.init, true); };
  const clearTransactions = () => { saveTransactions([]); write(K.init, true); };

  const exportCSV = list => {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['id', 'title', 'amount', 'type', 'category', 'date', 'description'], ...list.map(t => [t.id, t.title, t.amount, t.type, t.category, t.date, t.description])];
    const blob = new Blob(['\ufeff' + rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `transactions-${U.today()}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
  };
  const usageKB = () => { let n = 0; Object.values(K).forEach(k => { n += (localStorage.getItem(k) || '').length; }); return (n / 1024).toFixed(1); };

  return { init, getTransactions, saveTransactions, getBudgets, saveBudgets, getPrefs, savePrefs, resetDemo, clearTransactions, exportCSV, usageKB };
})();
