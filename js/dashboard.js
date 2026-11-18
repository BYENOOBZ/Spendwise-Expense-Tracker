/* dashboard.js – summary cards, dashboard charts, recent transactions. */
ET.Dash = (() => {
  const U = ET.Utils, $ = U.$;
  const summarize = list => { const income = U.sumBy(list, 'income'), expense = U.sumBy(list, 'expense'); return { income, expense, net: income - expense, rate: income > 0 ? ((income - expense) / income) * 100 : 0 }; };
  const pctChange = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
  const trend = (pct, upIsGood) => {
    if (pct === null) return '<span class="trend flat">No data last month</span>';
    const up = pct >= 0;
    return `<span class="trend ${up === upIsGood ? 'good' : 'bad'}">${up ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}% vs last month</span>`;
  };
  const card = (icon, cls, label, val, foot) => `<div class="card stat"><div class="stat-top"><span class="ico ${cls}"><i data-lucide="${icon}"></i></span><span class="muted">${label}</span></div><div class="stat-val">${val}</div><div class="stat-foot">${foot}</div></div>`;

  const render = () => {
    const all = ET.Tx.all(), [prevK, curK] = U.lastMonths(2);
    const total = summarize(all), cur = summarize(all.filter(t => t.date.startsWith(curK))), prev = summarize(all.filter(t => t.date.startsWith(prevK)));
    const rate = cur.rate, rateTag = cur.income === 0 ? ['flat', 'No income this month'] : rate >= 20 ? ['good', 'Healthy'] : rate >= 0 ? ['warn', 'Could be better'] : ['bad', 'Overspending'];
    $('summaryCards').innerHTML =
      card('wallet', 'indigo', 'Total Balance', U.fmt(total.net), `<span class="trend ${total.net >= 0 ? 'good' : 'bad'}">${total.net >= 0 ? 'In the green' : 'Negative balance'}</span>`) +
      card('trending-up', 'green', 'Income · this month', U.fmt(cur.income), trend(pctChange(cur.income, prev.income), true)) +
      card('trending-down', 'red', 'Expenses · this month', U.fmt(cur.expense), trend(pctChange(cur.expense, prev.expense), false)) +
      card('piggy-bank', 'amber', 'Savings Rate · this month', `${rate.toFixed(1)}%`, `<span class="trend ${rateTag[0]}">${rateTag[1]}</span>`);

    const months = U.lastMonths(6), byM = months.map(k => summarize(all.filter(t => t.date.startsWith(k))));
    U.drawChart('barChart', { type: 'bar', data: { labels: months.map(U.monthLabel), datasets: [
      { label: 'Income', data: byM.map(s => s.income), backgroundColor: '#10b981', borderRadius: 6 },
      { label: 'Expenses', data: byM.map(s => s.expense), backgroundColor: '#6366f1', borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${U.fmt(c.parsed.y)}` } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => U.fmt(v) } } } } });

    const groups = U.groupExpenses(all.filter(t => t.date.startsWith(curK))), entries = Object.entries(groups).sort((a, b) => b[1] - a[1]), sum = entries.reduce((s, e) => s + e[1], 0);
    $('doughnutBox').classList.toggle('hidden', !sum); $('doughnutEmpty').classList.toggle('hidden', !!sum);
    if (sum) U.drawChart('doughnutChart', { type: 'doughnut', data: { labels: entries.map(([c, v]) => `${c} (${Math.round((v / sum) * 100)}%)`), datasets: [{ data: entries.map(e => e[1]), backgroundColor: U.PALETTE, borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: c => ` ${U.fmt(c.parsed)}` } } } } });
    else { const old = Chart.getChart('doughnutChart'); if (old) old.destroy(); }

    $('recentTable').innerHTML = ET.Tx.tableHTML(ET.Tx.sorted(all).slice(0, 6), false, { title: 'No transactions yet', text: 'Add a transaction to see it here.' });
  };
  return { summarize, render };
})();
