/* app.js – bootstrap, hash routing, settings page, wiring between modules. */
(() => {
  const U = ET.Utils, S = ET.Storage, $ = U.$;
  const pages = {
    dashboard: { title: 'Dashboard', render: () => ET.Dash.render() },
    transactions: { title: 'Transactions', render: () => ET.Tx.render() },
    analytics: { title: 'Analytics', render: () => ET.Analytics.render() },
    budgets: { title: 'Budgets', render: () => ET.Budgets.render() },
    settings: { title: 'Settings', render: () => renderSettings() }
  };
  let current = 'dashboard';

  const initial = () => { const n = S.getPrefs().name.trim(); $('avatar').textContent = (n[0] || 'U').toUpperCase(); };
  const renderSettings = () => {
    $('prefName').value = S.getPrefs().name;
    $('storageInfo').textContent = `${ET.Tx.all().length} transactions stored · about ${S.usageKB()} KB used in this browser.`;
  };
  const render = () => { pages[current].render(); U.icons(); };
  const closeSidebar = () => document.body.classList.remove('nav-open');
  const route = () => {
    const h = location.hash.slice(1); current = pages[h] ? h : 'dashboard';
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + current));
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.page === current));
    $('pageTitle').textContent = pages[current].title; document.title = `${pages[current].title} · Spendwise`;
    closeSidebar(); window.scrollTo(0, 0); render();
  };

  const init = () => {
    S.init(); ET.Tx.init(); ET.Analytics.init(); ET.Budgets.init();
    $('today').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    initial();
    $('menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('backdrop').addEventListener('click', closeSidebar);
    $('saveName').addEventListener('click', () => { S.savePrefs({ name: $('prefName').value.trim() }); initial(); alert('Name saved.'); });
    $('exportBtn').addEventListener('click', () => { const l = ET.Tx.all(); l.length ? S.exportCSV(l) : alert('There are no transactions to export.'); });
    $('resetBtn').addEventListener('click', () => { if (confirm('Replace ALL data with fresh demo data? Your current transactions and budgets will be lost.')) { S.resetDemo(); ET.Tx.reload(); } });
    $('clearBtn').addEventListener('click', () => { if (confirm('Delete ALL transactions (including sample data)? Budgets are kept.')) { S.clearTransactions(); ET.Tx.reload(); } });
    document.addEventListener('et:change', render);
    window.addEventListener('hashchange', route);
    route();
  };
  document.addEventListener('DOMContentLoaded', init);
})();
