import React, { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

const categories = ['Food', 'Rent', 'Salary', 'Transport', 'Shopping', 'Bills', 'Health', 'Investment', 'Other'];

const initialForm = {
  title: '',
  amount: '',
  category: 'Food',
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
};

export default function TransactionForm({ onSubmit, editingTransaction, onCancelEdit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        title: editingTransaction.title,
        amount: String(editingTransaction.amount),
        category: editingTransaction.category,
        type: editingTransaction.type,
        date: editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setErrors({});
    }
  }, [editingTransaction]);

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = 'Enter a transaction title.';
    if (!form.category) nextErrors.category = 'Choose a category.';
    if (!form.type) nextErrors.type = 'Choose income or expense.';
    if (!form.date) nextErrors.date = 'Choose a date.';

    const amount = Number(form.amount);
    if (form.amount === '') {
      nextErrors.amount = 'Enter an amount.';
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = 'Amount must be a number greater than zero.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      title: form.title.trim(),
      amount: Number(Number(form.amount).toFixed(2)),
      id: editingTransaction?.id,
      date: new Date(form.date).toISOString(),
    });

    setForm(initialForm);
    setErrors({});
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <div>
          <span className="eyebrow">New entry</span>
          <h2>{editingTransaction ? 'Edit transaction' : 'Add transaction'}</h2>
        </div>
        {editingTransaction && (
          <button type="button" className="icon-button ghost" onClick={onCancelEdit} aria-label="Cancel edit">
            <X size={18} />
          </button>
        )}
      </div>

      <label>
        <span>Title</span>
        <input
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="Monthly salary, groceries..."
        />
        {errors.title && <small>{errors.title}</small>}
      </label>

      <div className="form-row">
        <label>
          <span>Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
          {errors.date && <small>{errors.date}</small>}
        </label>

        <label>
          <span>Amount</span>
          <input
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            inputMode="decimal"
            placeholder="1250.50"
          />
          {errors.amount && <small>{errors.amount}</small>}
        </label>
      </div>

      <div className="form-row">
        <label>
          <span>Category</span>
          <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <small>{errors.category}</small>}
        </label>
      </div>

      <fieldset>
        <legend>Type</legend>
        <div className="segmented-control">
          <button
            type="button"
            className={form.type === 'income' ? 'active' : ''}
            onClick={() => updateField('type', 'income')}
          >
            Income
          </button>
          <button
            type="button"
            className={form.type === 'expense' ? 'active' : ''}
            onClick={() => updateField('type', 'expense')}
          >
            Expense
          </button>
        </div>
        {errors.type && <small>{errors.type}</small>}
      </fieldset>

      <button className="primary-button" type="submit">
        {editingTransaction ? <Check size={18} /> : <Plus size={18} />}
        {editingTransaction ? 'Save changes' : 'Add transaction'}
      </button>
    </form>
  );
}
