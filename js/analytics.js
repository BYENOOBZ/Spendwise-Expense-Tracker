/* analytics.js – period-based analytics, category breakdown and trend chart. */
ET.Analytics = (() => {
  const U = ET.Utils, $ = U.$;
  let period = 'this-month';
  const stat = (label, val, sub = '') => `<div class="card stat"><div class="muted">${label}</div><div class="stat-val">${val}</div><div class="muted small">${sub}</div></div>`;

  const render = () => {
    const { from, to } = U.range(period), list = ET.Tx.all().filter(t => t.date >= from && t.date <= to);
    const s = ET.Dash.summarize(list), end = to > U.today() ? U.today() : to;
    const entries = Object.entries(U.groupExpenses(list)).sort((a, b) => b[1] - a[1]), top = entries[0];
    const avg = s.expense / U.daysBetween(from, end);
    $('analyticsCards').innerHTML =
      stat('Total income', U.fmt(s.income)) + stat('Total expenses', U.fmt(s.expense)) +
      stat('Net savings', `<span class="${s.net >= 0 ? 'pos' : 'neg'}">${U.fmt(s.net)}</span>`) +
      stat('Savings rate', `${s.rate.toFixed(1)}%`, s.income ? '' : 'No income in period') +
      stat('Highest spending category', top ? U.esc(top[0]) : '—', top ? U.fmt(top[1]) : 'No expenses') +
      stat('Average daily expenses', U.fmt(avg), `over ${U.daysBetween(from, end)} day(s)`);

    $('categoryBreakdown').innerHTML = entries.length ? entries.map(([c, v], i) => {
      const p = (v / s.expense) * 100;
      return `<div class="bd-row"><div class="bd-top"><span><i class="dot" style="background:${U.PALETTE[i % 8]}"></i>${U.esc(c)}</span><span><strong>${U.fmt(v)}</strong> <span class="muted">${p.toFixed(1)}%</span></span></div><div class="bar"><span style="width:${p}%;background:${U.PALETTE[i % 8]}"></span></div></div>`;
    }).join('') : '<div class="empty-state"><i data-lucide="pie-chart"></i><p>No expenses in this period.</p></div>';

    // Single month → daily bars; multiple months → monthly bars/line.
    let labels = [], exp = [], inc = [], daily = period === 'this-month' || period === 'last-month';
    if (daily) {
      for (let d = U.parse(from); U.ymd(d) <= end; d.setDate(d.getDate() + 1)) {
        const k = U.ymd(d), day = list.filter(t => t.date === k); labels.push(d.getDate()); exp.push(U.sumBy(day, 'expense')); inc.push(U.sumBy(day, 'income'));
      }
    } else {
      const keys = []; for (let d = U.parse(from); U.ymd(d) <= to; d.setMonth(d.getMonth() + 1)) keys.push(U.ymd(d).slice(0, 7));
      keys.forEach(k => { const m = list.filter(t => t.date.startsWith(k)); labels.push(U.monthLabel(k)); exp.push(U.sumBy(m, 'expense')); inc.push(U.sumBy(m, 'income')); });
    }
    $('trendNote').textContent = daily ? '(daily)' : '(monthly)';
    U.drawChart('trendChart', { type: daily ? 'bar' : 'line', data: { labels, datasets: [
      { label: 'Expenses', data: exp, backgroundColor: '#6366f1', borderColor: '#6366f1', tension: .35, borderRadius: 4 },
      ...(daily ? [] : [{ label: 'Income', data: inc, borderColor: '#10b981', backgroundColor: '#10b981', tension: .35, borderDash: [5, 4] }])] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: v => U.fmt(v) } } }, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${U.fmt(c.parsed.y)}` } } } } });
  };
  const init = () => $('periodSelect').addEventListener('change', e => { period = e.target.value; render(); U.icons(); });
  return { init, render };
})();
