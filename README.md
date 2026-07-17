# Personal Wealth & Expense Tracker

A client-side React app for tracking personal income and expenses, reviewing recent transactions, and visualizing spending by category.

## Tech Stack

- React.js for a component-based UI.
- Vite for fast local development and production builds.
- Chart.js with react-chartjs-2 for live expense visualization.
- LocalStorage for simple persistent browser storage.
- CSS for a clean responsive interface without extra build complexity.

## Features

- Add, edit, and delete income or expense transactions.
- Validate required fields and positive numeric amounts.
- Show total income, total expenses, and net balance instantly.
- Format all values as INR using `Intl.NumberFormat('en-IN')`.
- Group expenses by category and calculate chart percentages.
- Persist transactions after page refresh.
- Friendly empty states for first-time users.
- Responsive layout that handles large currency values.

## Setup

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Build

```bash
npm run build
```

## Future Improvements

- Add date filters and monthly reports.
- Export transactions to CSV.
- Add budget limits by category.
- Support custom categories.
- Add optional cloud sync and authentication.
