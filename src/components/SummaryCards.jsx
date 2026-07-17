import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const cards = [
  { key: 'income', label: 'Total Income', icon: ArrowUpCircle },
  { key: 'expenses', label: 'Total Expenses', icon: ArrowDownCircle },
  { key: 'balance', label: 'Net Balance', icon: WalletCards },
];

export default function SummaryCards({ summary }) {
  return (
    <section className="summary-grid" aria-label="Financial summary">
      {cards.map(({ key, label, icon: Icon }) => (
        <article className={`summary-card ${key}`} key={key}>
          <div className="summary-icon" aria-hidden="true">
            <Icon size={22} />
          </div>
          <div>
            <p>{label}</p>
            <strong>{formatCurrency(summary[key])}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
