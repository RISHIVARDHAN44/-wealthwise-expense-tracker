export const calculateStreak = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;

  // Extract unique dates of all transactions, sorted descending
  const dates = [...new Set(transactions.map(t => new Date(t.date).toISOString().split('T')[0]))].sort().reverse();
  
  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  let currentDate = new Date(dates[0]);

  // If the most recent transaction wasn't today or yesterday, streak is broken
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  for (let i = 0; i < dates.length; i++) {
    const txDate = new Date(dates[i]);
    
    // Calculate difference in days between expected date and actual date
    const expectedTime = currentDate.getTime();
    const actualTime = txDate.getTime();
    const diffDays = Math.round(Math.abs((expectedTime - actualTime) / 86400000));

    if (diffDays === 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const calculateBudgetUsage = (transactions, budget) => {
  if (!budget || budget <= 0) return { used: 0, percentage: 0, color: 'var(--primary)' };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const spentThisMonth = transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage = Math.min((spentThisMonth / budget) * 100, 100);
  
  let color = 'var(--primary)';
  if (percentage >= 100) color = 'var(--danger)';
  else if (percentage >= 90) color = '#f97316'; // Orange
  else if (percentage >= 80) color = '#eab308'; // Yellow

  return { spent: spentThisMonth, percentage, color };
};

export const generateRecommendations = (transactions, budget) => {
  if (!transactions || transactions.length === 0) {
    return "Start logging expenses to get personalized insights!";
  }

  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) {
    return "You have no expenses yet. Keep up the good work!";
  }

  // Find top spending category
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const topCategory = Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b);

  if (!budget) {
    const avgExpense = expenses.reduce((sum, t) => sum + t.amount, 0) / Math.max(1, new Set(expenses.map(t => new Date(t.date).getMonth())).size);
    return `You spend most on ${topCategory}. Based on your history, we recommend setting a monthly budget of around $${(avgExpense * 1.2).toFixed(0)}.`;
  }

  const { percentage } = calculateBudgetUsage(transactions, budget);
  
  if (percentage >= 90) {
    return `🚨 Critical: Cut back on ${topCategory} (${((categoryTotals[topCategory] / expenses.reduce((sum, t) => sum + t.amount, 0)) * 100).toFixed(0)}% of expenses) to avoid exceeding your budget!`;
  } else if (percentage >= 75) {
    return `💡 Tip: You're approaching your limit. Try cooking at home or deferring non-essential ${topCategory} purchases.`;
  } else {
    return `✅ Great job! Your spending is well within limits. Keep monitoring ${topCategory} to stay on track.`;
  }
};
