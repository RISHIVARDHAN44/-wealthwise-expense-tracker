import React from 'react';
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../utils/formatCurrency';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartColors = ['#0f766e', '#e11d48', '#2563eb', '#f59e0b', '#7c3aed', '#16a34a', '#db2777', '#64748b', '#ea580c'];

export default function ExpenseChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        data: data.map((item) => item.amount),
        backgroundColor: chartColors,
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <section className="chart-panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">Spending mix</span>
          <h2>Expenses by category</h2>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-chart">Expense categories will appear here.</div>
      ) : (
        <div className="chart-layout">
          <div className="chart-wrap">
            <Doughnut
              data={chartData}
              options={{
                maintainAspectRatio: false,
                cutout: '62%',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="category-list">
            {data.map((item, index) => (
              <div className="category-row" key={item.category}>
                <span className="swatch" style={{ background: chartColors[index % chartColors.length] }} />
                <span>{item.category}</span>
                <strong>{item.percentage.toFixed(1)}%</strong>
                <em>{formatCurrency(item.amount)}</em>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
