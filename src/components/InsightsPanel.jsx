import React, { useState } from 'react';
import { Flame, Lightbulb, Target } from 'lucide-react';
import { calculateStreak, calculateBudgetUsage, generateRecommendations } from '../utils/insights';
import { formatCurrency } from '../utils/formatCurrency';

export default function InsightsPanel({ transactions, budget, onUpdateBudget }) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget || '');

  const streak = calculateStreak(transactions);
  const { spent, percentage, color } = calculateBudgetUsage(transactions, budget);
  const recommendation = generateRecommendations(transactions, budget);

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    const num = Number(budgetInput);
    if (!isNaN(num) && num >= 0) {
      onUpdateBudget(num);
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="insights-panel">
      <div className="insights-grid">
        
        {/* Streak Card */}
        <div className="insight-card streak-card">
          <div className="insight-header">
            <Flame className="insight-icon streak" />
            <h3>Daily Logging Streak</h3>
          </div>
          <div className="streak-content">
            <strong className="streak-count">{streak}</strong>
            <span>{streak === 1 ? 'Day' : 'Days'}</span>
          </div>
          <p className="insight-muted">Log an expense daily to keep the flame alive!</p>
        </div>

        {/* Budget Progress Card */}
        <div className="insight-card budget-card">
          <div className="insight-header">
            <Target className="insight-icon target" />
            <h3>Monthly Budget</h3>
            {!isEditingBudget && (
              <button className="text-button" onClick={() => setIsEditingBudget(true)}>Edit</button>
            )}
          </div>
          
          {isEditingBudget ? (
            <form onSubmit={handleBudgetSubmit} className="budget-form">
              <input 
                type="number" 
                value={budgetInput} 
                onChange={(e) => setBudgetInput(e.target.value)} 
                placeholder="Enter budget..."
                autoFocus
              />
              <button type="submit" className="primary-button small">Save</button>
              <button type="button" className="icon-button ghost small" onClick={() => setIsEditingBudget(false)}>Cancel</button>
            </form>
          ) : budget ? (
            <>
              <div className="budget-stats">
                <span>{formatCurrency(spent)} spent</span>
                <span className="budget-limit">of {formatCurrency(budget)}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className={`progress-bar-fill ${percentage >= 100 ? 'pulse' : ''}`}
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
              {percentage >= 80 && (
                <p className="budget-warning" style={{ color }}>
                  {percentage >= 100 ? "You've exceeded your budget!" : "You are approaching your budget limit."}
                </p>
              )}
            </>
          ) : (
            <div className="no-budget">
              <p>Set a monthly budget to unlock spending alerts.</p>
              <button className="primary-button outline" onClick={() => setIsEditingBudget(true)}>Set Budget</button>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="insight-card recommendations-card">
          <div className="insight-header">
            <Lightbulb className="insight-icon bulb" />
            <h3>Smart Insights</h3>
          </div>
          <p className="recommendation-text">{recommendation}</p>
        </div>

      </div>
    </div>
  );
}
