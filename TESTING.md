# Manual Test Cases
Mark each as Pass/Fail. Start from a fresh profile (or Settings → Reset demo data).

| # | Area | Steps | Expected |
|---|---|---|---|
| 1 | Startup | Open `index.html` first time | Dashboard populated with sample data, no console errors |
| 2 | Persistence | Add a transaction, refresh | Transaction still present |
| 3 | Add | Add expense ₹500 Food today | Appears first in table; balance & expenses cards update; charts update |
| 4 | Validation | Submit empty title / amount 0 / amount -5 / no date | Inline errors, nothing saved |
| 5 | Edit | Edit a transaction, change type to Income | Category list switches; values update everywhere |
| 6 | Delete | Click delete → Cancel, then delete → OK | Cancel keeps it; OK removes it and updates totals |
| 7 | Search | Type part of a title in top search | Jumps to Transactions and filters by title |
| 8 | Filters | Combine type, category and date range | Only matching rows; count shows "x of y" |
| 9 | Sort | Switch Newest/Oldest | Order reverses |
| 10 | Empty state | Settings → Clear all transactions | Empty states on dashboard, table, charts; no errors; cards show ₹0 |
| 11 | Budgets | Set Food budget below spent | Red bar, "Over by" text, warning banner |
| 12 | Budgets | Set budget ~85% of spent | Amber bar |
| 13 | Budgets | Change month selector | Spent values reflect that month |
| 14 | Analytics | Switch all 4 periods | Cards, breakdown and chart change; no duplicate charts |
| 15 | Export | Settings → Export CSV | File downloads, opens in Excel/Sheets with all rows |
| 16 | Reset | Settings → Reset demo data → OK | Sample data and default budgets restored |
| 17 | Corrupt data | In DevTools set `et_transactions` to `abc`, refresh | App loads with empty data, no crash |
| 18 | Responsive | Resize to 1024 / 768 / 375 px | Sidebar becomes a slide-in menu; cards stack; tables scroll horizontally |
| 19 | Navigation | Click every sidebar link and browser back/forward | Correct page and highlighted item |
