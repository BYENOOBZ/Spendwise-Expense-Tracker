# Spendwise – Expense Tracker & Budget Planner

A responsive personal-finance dashboard built with **HTML, CSS and vanilla JavaScript**. No backend, no build step: all data lives in your browser's LocalStorage. Amounts are shown in Indian Rupees (₹).

## Features
- Dashboard: balance, income, expenses and savings-rate cards (calculated from real data), income-vs-expense bar chart (6 months), expense doughnut chart, recent transactions.
- Transactions: add / edit / delete (with confirmation), validation, search, type / category / date-range filters, newest/oldest sort.
- Budgets: overall and per-category monthly budgets, progress bars (green → amber at 80% → red when exceeded), warnings.
- Analytics: period filter (this month, last month, last 6 months, this year), category breakdown, trend chart, highest category, average daily spend.
- Settings: CSV export, reset demo data, clear all transactions, display name.
- Sample data on first launch; empty states everywhere.

## Technology stack
HTML5 · CSS3 · JavaScript (ES6+) · [Chart.js 4.4.1](https://www.chartjs.org/) · [Lucide icons](https://lucide.dev/) (both via CDN) · LocalStorage

## Screenshots
Add images to `screenshots/` and link them here:
- `![Dashboard](screenshots/dashboard.png)`
- `![Transactions](screenshots/transactions.png)`
- `![Budgets](screenshots/budgets.png)`
- `![Analytics](screenshots/analytics.png)`

## Installation
1. Clone or download the repository.
2. Open `index.html` in a modern browser. That's it (an internet connection is needed once for the CDN scripts and fonts).

## Folder structure
```
expense-tracker/
├── index.html
├── css/        style.css · dashboard.css · transactions.css · responsive.css
├── js/         utils.js · storage.js · transactions.js · dashboard.js · analytics.js · budgets.js · app.js
├── assets/
├── screenshots/
├── README.md · TESTING.md · .gitignore
```
Scripts use a shared `window.ET` namespace (not ES modules) so the app works from `file://`. Load order matters: utils → storage → transactions → dashboard → analytics → budgets → app.

## How LocalStorage works
| Key | Content |
|---|---|
| `et_transactions` | Array of `{id,title,amount,type,category,date,description}` |
| `et_budgets` | `{overall, categories:{Food:…}}` |
| `et_prefs` | `{name}` |
| `et_initialized` | Set after the first launch so demo data is seeded only once |

Data is read on startup and written after every change. Invalid or corrupt entries are ignored. To wipe everything manually: DevTools → Application → Local Storage → clear.

## Team contribution
| Member | Name | Responsibilities | Files |
|---|---|---|---|
| 1 | _Your name_ | App structure, dashboard, integration | `index.html`, `css/style.css`, `css/dashboard.css`, `css/responsive.css`, `js/app.js`, `js/dashboard.js`, `js/utils.js` |
| 2 | _Your name_ | Transactions: add/edit/delete/filter | `js/transactions.js`, `css/transactions.css`, `js/storage.js` |
| 3 | _Your name_ | Analytics, budgets, docs, testing | `js/analytics.js`, `js/budgets.js`, `README.md`, `TESTING.md` |

## Future improvements
Recurring transactions · multi-currency · dark mode · JSON import/restore · charts for budget history · PWA/offline support · optional cloud sync.
