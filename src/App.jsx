import React, { useMemo, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import ExpenseChart from './components/ExpenseChart';
import SummaryCards from './components/SummaryCards';
import InsightsPanel from './components/InsightsPanel';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Login from './components/Login';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateSummary, groupExpensesByCategory } from './utils/calculations';

export default function App() {
  const [user, setUser] = useLocalStorage('wealth-tracker-user', null);
  const [theme, setTheme] = useLocalStorage('wealth-tracker-theme', 'light');
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch transactions from the database when logged in
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('wealth-tracker-token');
    fetch(`${API_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        }
      })
      .catch(console.error);
  }, [user]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const summary = useMemo(() => calculateSummary(safeTransactions), [safeTransactions]);
  const expenseData = useMemo(() => groupExpensesByCategory(safeTransactions), [safeTransactions]);

  const upsertTransaction = async (transaction) => {
    const isEdit = !!transaction.id;
    const tx = { ...transaction, id: isEdit ? transaction.id : crypto.randomUUID() };
    
    // Optimistic UI update
    if (isEdit) {
      setTransactions((current) =>
        current.map((item) => (item.id === tx.id ? { ...item, ...tx } : item))
      );
      setEditingTransaction(null);
    } else {
      setTransactions((current) => [tx, ...current]);
    }

    // Save to database
    const token = localStorage.getItem('wealth-tracker-token');
    try {
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(tx)
      });
      if (!response.ok) {
        console.error('Failed to save:', await response.text());
      }
    } catch (err) {
      console.error('Network error saving transaction:', err);
    }
  };

  const deleteTransaction = async (id) => {
    // Optimistic UI update
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }

    // Delete from database
    const token = localStorage.getItem('wealth-tracker-token');
    try {
      await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to delete from database', err);
    }
  };

  const handleUpdateBudget = async (newBudget) => {
    try {
      const token = localStorage.getItem('wealth-tracker-token');
      const res = await fetch(`${API_URL}/api/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ budget: newBudget })
      });
      if (res.ok) {
        setUser({ ...user, budget: newBudget });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTransactions([]);
    localStorage.removeItem('wealth-tracker-token');
  };

  if (!user) {
    return (
      <>
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="icon-button ghost" title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <Login onLogin={setUser} />
      </>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <div className="header-left">
          <h1>Personal finance</h1>
        </div>
        <p>Track income, expenses, category trends, and balance changes in one calm dashboard.</p>
        </div>
        <div className="user-actions">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="icon-button ghost" title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <span className="user-greeting">Hi, <strong>{user.name}</strong></span>
          <button onClick={handleLogout} className="icon-button ghost logout-button" title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </header>

      <SummaryCards summary={summary} />

      <InsightsPanel 
        transactions={transactions} 
        budget={user.budget} 
        onUpdateBudget={handleUpdateBudget} 
      />

      <div className="main-grid">
        <TransactionForm
          onSubmit={upsertTransaction}
          editingTransaction={editingTransaction}
          onCancelEdit={() => setEditingTransaction(null)}
        />
        <ExpenseChart data={expenseData} />
      </div>

      <TransactionList transactions={transactions || []} onEdit={setEditingTransaction} onDelete={deleteTransaction} />
    </main>
  );
}
