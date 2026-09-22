import { useState } from 'react';
import API from '../api/axios';
import CircularSlider from './CircularSlider';
import {
  IconExpense,
  IconIncome,
  IconFood,
  IconTransport,
  IconBills,
  IconShopping,
  IconEntertainment,
  IconHousing,
  IconHealth,
  IconSalary,
  IconFreelance,
  IconInvestment,
  IconGift,
  IconOther,
} from './Icons';

const EXPENSE_CATEGORIES = [
  { id: 'Food', label: 'Food', icon: <IconFood size={18} /> },
  { id: 'Transport', label: 'Transport', icon: <IconTransport size={18} /> },
  { id: 'Bills', label: 'Bills', icon: <IconBills size={18} /> },
  { id: 'Shopping', label: 'Shopping', icon: <IconShopping size={18} /> },
  { id: 'Entertainment', label: 'Fun', icon: <IconEntertainment size={18} /> },
  { id: 'Housing', label: 'Housing', icon: <IconHousing size={18} /> },
  { id: 'Health', label: 'Health', icon: <IconHealth size={18} /> },
  { id: 'Other', label: 'Other', icon: <IconOther size={18} /> },
];

const INCOME_CATEGORIES = [
  { id: 'Salary', label: 'Salary', icon: <IconSalary size={18} /> },
  { id: 'Freelance', label: 'Freelance', icon: <IconFreelance size={18} /> },
  { id: 'Investment', label: 'Invest', icon: <IconInvestment size={18} /> },
  { id: 'Gift', label: 'Gift', icon: <IconGift size={18} /> },
  { id: 'Other', label: 'Other', icon: <IconOther size={18} /> },
];

const QUICK_INCREMENTS = [50, 100, 200, 500, 1000, 2000, 5000];
const QUICK_PRESETS = [50, 100, 250, 500, 1000, 2500, 5000];
const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash'];

export default function QuickAddWidget({ onEntryAdded }) {
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState(250);
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Food' : 'Salary');
  };

  const handleQuickIncrement = (inc) => {
    setAmount((prev) => Math.min(prev + inc, 50000));
  };

  const handleQuickPreset = (preset) => {
    setAmount(preset);
  };

  const handleQuickSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!amount || amount <= 0) {
      setFeedback({ type: 'error', text: 'Please choose an amount' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const today = new Date().toISOString().split('T')[0];

    try {
      if (type === 'expense') {
        await API.post('/expenses', {
          title: note.trim() || category,
          amount: parseFloat(amount),
          date: today,
          category,
          paymentMethod,
          notes: note.trim() ? `Quick add: ${note}` : 'Quick log',
        });
      } else {
        await API.post('/income', {
          source: note.trim() || category,
          amount: parseFloat(amount),
          date: today,
          frequency: 'One-time',
          category,
          notes: note.trim() ? `Quick add: ${note}` : 'Quick log',
        });
      }

      setFeedback({
        type: 'success',
        text: `Logged ${type === 'expense' ? '₹' + amount + ' expense' : '₹' + amount + ' income'}!`,
      });
      setNote('');
      if (onEntryAdded) onEntryAdded();

      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save entry',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-add-card">
      <div className="quick-add-header">
        <div className="quick-add-title-group">
          <span className="quick-add-badge">Quick Log</span>
          <h2 className="quick-add-title">Add in 2 Clicks</h2>
        </div>

        {/* Type toggle */}
        <div className="type-toggle-pills">
          <button
            type="button"
            className={`type-pill ${type === 'expense' ? 'active expense' : ''}`}
            onClick={() => handleTypeChange('expense')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <IconExpense size={14} /> Expense
            </span>
          </button>
          <button
            type="button"
            className={`type-pill ${type === 'income' ? 'active income' : ''}`}
            onClick={() => handleTypeChange('income')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <IconIncome size={14} /> Income
            </span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`quick-feedback ${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      <div className="quick-add-grid">
        {/* Left column: Circular Dial Slider */}
        <div className="quick-add-slider-col">
          <div className="slider-box">
            <span className="slider-instruction">Rotate dial or adjust below</span>
            <CircularSlider
              value={amount}
              min={10}
              max={10000}
              step={10}
              onChange={(val) => setAmount(val)}
            />
          </div>

          {/* Direct Amount Chips */}
          <div className="chips-section">
            <div className="chips-row-label">Quick Add Chips:</div>
            <div className="chips-group">
              {QUICK_INCREMENTS.map((inc) => (
                <button
                  key={inc}
                  type="button"
                  className="amount-chip"
                  onClick={() => handleQuickIncrement(inc)}
                >
                  +{inc >= 1000 ? `₹${inc / 1000}k` : `₹${inc}`}
                </button>
              ))}
              <button
                type="button"
                className="amount-chip reset"
                onClick={() => setAmount(0)}
                title="Reset amount to 0"
              >
                Reset
              </button>
            </div>

            <div className="chips-row-label" style={{ marginTop: '8px' }}>
              Set Exact Preset:
            </div>
            <div className="chips-group">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`amount-chip preset ${amount === p ? 'active' : ''}`}
                  onClick={() => handleQuickPreset(p)}
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Category & Quick Details */}
        <div className="quick-add-options-col">
          {/* Category Pills */}
          <div className="options-group">
            <label className="options-label">Select Category</label>
            <div className="category-pills-grid">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`category-pill ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  <span className="cat-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {c.icon}
                  </span>
                  <span className="cat-text">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Pills */}
          {type === 'expense' && (
            <div className="options-group">
              <label className="options-label">Payment Method</label>
              <div className="payment-pills-row">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    className={`payment-pill ${paymentMethod === pm ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(pm)}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div className="options-group">
            <label className="options-label">Note / Item Name (Optional)</label>
            <input
              type="text"
              className="quick-input"
              placeholder={`e.g. Grocery run (defaults to ${category})`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickSubmit();
              }}
            />
          </div>

          {/* 1-Click Black Action Button */}
          <div className="quick-add-action">
            <button
              type="button"
              className="btn-black-primary"
              disabled={loading || amount <= 0}
              onClick={handleQuickSubmit}
            >
              {loading ? (
                <span>Logging...</span>
              ) : (
                <span>
                  Log {type === 'expense' ? 'Expense' : 'Income'} • ₹
                  {amount.toLocaleString('en-IN')}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
