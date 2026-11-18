/* budgets.js – overall + per-category monthly budgets driven by real expense data. */
ET.Budgets = (() => {
  const U = ET.Utils, S = ET.Storage, $ = U.$;
  const level = p => (p > 100 ? 'over' : p >= 80 ? 'warn' : 'ok');

  const block = (title, spent, budget, inputAttr, id) => {
    const p = budget > 0 ? (spent / budget) * 100 : 0, lv = budget > 0 ? level(p) : 'none', left = budget - spent;
    return `<div class="card budget ${lv}"><div class="card-head"><h3>${title}</h3>
      <label class="inline small">Budget ₹<input type="number" min="0" step="100" ${inputAttr} value="${budget || ''}" placeholder="Set"></label></div>
      <div class="bar big"><span style="width:${Math.min(p, 100)}%"></span></div>
      <div class="b-meta"><span>Spent <strong>${U.fmt(spent)}</strong></span>
      <span>${budget > 0 ? (left >= 0 ? `Remaining <strong>${U.fmt(left)}</strong>` : `<strong class="neg">Over by ${U.fmt(-left)}</strong>`) : '<span class="muted">No budget set</span>'}</span>
      <span class="muted">${budget > 0 ? p.toFixed(0) + '%' : ''}</span></div></div>`;
  };

  const render = () => {
    const month = $('budgetMonth').value || U.today().slice(0, 7), b = S.getBudgets();
    const exp = ET.Tx.all().filter(t => t.type === 'expense' && t.date.startsWith(month)), spent = U.groupExpenses(exp), total = exp.reduce((s, t) => s + t.amount, 0);
    const over = [];
    if (b.overall > 0 && total > b.overall) over.push(`Overall monthly budget exceeded by ${U.fmt(total - b.overall)}.`);
    U.EXPENSE_CATS.forEach(c => { const v = b.categories[c]; if (v > 0 && (spent[c] || 0) > v) over.push(`${c} budget exceeded by ${U.fmt(spent[c] - v)}.`); });
    $('budgetAlerts').innerHTML = over.length ? `<div class="alert"><i data-lucide="alert-triangle">⚠</i><div>${over.map(U.esc).join('<br>')}</div></div>` : '';
    $('budgetBody').innerHTML = block('Overall monthly budget', total, b.overall, 'data-overall="1"') +
      `<div class="grid-3">${U.EXPENSE_CATS.map(c => block(c, spent[c] || 0, b.categories[c], `data-cat="${c}"`)).join('')}</div>`;
  };

  const init = () => {
    $('budgetMonth').value = U.today().slice(0, 7);
    $('budgetMonth').addEventListener('change', () => { render(); U.icons(); });
    $('budgetBody').addEventListener('change', e => {
      const inp = e.target.closest('input'); if (!inp) return;
      const v = inp.value === '' ? 0 : Number(inp.value), b = S.getBudgets();
      if (!isFinite(v) || v < 0) { alert('Budget must be a number that is zero or more.'); return render(); }
      if (inp.dataset.overall) b.overall = v; else b.categories[inp.dataset.cat] = v;
      S.saveBudgets(b); document.dispatchEvent(new CustomEvent('et:change'));
    });
  };
  return { init, render };
})();
