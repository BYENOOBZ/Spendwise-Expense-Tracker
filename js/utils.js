/* utils.js – shared helpers & constants (no dependencies). */
window.ET = window.ET || {};
ET.Utils = (() => {
  const EXPENSE_CATS = ['Food', 'Transportation', 'Shopping', 'Education', 'Entertainment', 'Healthcare', 'Bills', 'Other'];
  const INCOME_CATS = ['Salary', 'Freelance', 'Scholarship', 'Allowance', 'Other'];
  const ALL_CATS = [...new Set([...EXPENSE_CATS, ...INCOME_CATS])];
  const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#94a3b8'];

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ymd(new Date());
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtDate = s => parse(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const monthLabel = k => parse(k + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

  const lastMonths = n => { const now = new Date(); return Array.from({ length: n }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }); };
  const range = p => {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    const mk = (a, b) => ({ from: ymd(a), to: ymd(b) });
    if (p === 'last-month') return mk(new Date(y, m - 1, 1), new Date(y, m, 0));
    if (p === 'last-6') return mk(new Date(y, m - 5, 1), new Date(y, m + 1, 0));
    if (p === 'year') return mk(new Date(y, 0, 1), new Date(y, 11, 31));
    return mk(new Date(y, m, 1), new Date(y, m + 1, 0));
  };
  const daysBetween = (a, b) => Math.max(1, Math.round((parse(b) - parse(a)) / 864e5) + 1);

  const sumBy = (list, type) => list.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
  const groupExpenses = list => { const m = {}; list.filter(t => t.type === 'expense').forEach(t => { m[t.category] = (m[t.category] || 0) + t.amount; }); return m; };

  // Destroys any previous Chart on the canvas first, so no duplicate instances.
  const drawChart = (id, cfg) => {
    const c = document.getElementById(id);
    if (!c || !window.Chart) return null;
    const old = Chart.getChart(c); if (old) old.destroy();
    return new Chart(c, cfg);
  };
  const icons = () => { if (window.lucide) lucide.createIcons(); };
  const $ = id => document.getElementById(id);

  return { EXPENSE_CATS, INCOME_CATS, ALL_CATS, PALETTE, fmt, ymd, today, uid, esc, parse, fmtDate, monthLabel, lastMonths, range, daysBetween, sumBy, groupExpenses, drawChart, icons, $ };
})();
