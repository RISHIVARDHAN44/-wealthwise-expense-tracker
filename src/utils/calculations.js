export const calculateSummary = (transactions) =>
  transactions.reduce(
    (summary, transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === 'income') {
        summary.income += amount;
      } else {
        summary.expenses += amount;
      }

      summary.balance = summary.income - summary.expenses;
      return summary;
    },
    { income: 0, expenses: 0, balance: 0 }
  );

export const groupExpensesByCategory = (transactions) => {
  const grouped = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
      return acc;
    }, {});

  const total = Object.values(grouped).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};
