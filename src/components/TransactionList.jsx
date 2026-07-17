import React from 'react';
import { Pencil, Trash2, Tag, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export default function TransactionList({ transactions, onEdit, onDelete }) {
  return (
    <section className="history-panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">Ledger</span>
          <h2>Transaction history</h2>
        </div>
        <span className="count-pill">{transactions.length} entries</span>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">Get started by adding your first transaction.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th className="amount-cell">Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <strong>{transaction.title}</strong>
                  </td>
                  <td>{transaction.category}</td>
                  <td>
                    <span className={`type-badge ${transaction.type}`}>{transaction.type}</span>
                  </td>
                  <td>{formatDate(transaction.date)}</td>
                  <td className={`amount-cell ${transaction.type}`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="actions-cell">
                    <button className="icon-button" onClick={() => onEdit(transaction)} aria-label={`Edit ${transaction.title}`}>
                      <Pencil size={16} />
                    </button>
                    <button className="icon-button danger" onClick={() => onDelete(transaction.id)} aria-label={`Delete ${transaction.title}`}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
