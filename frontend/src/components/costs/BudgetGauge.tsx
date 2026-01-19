import { useEffect, useState } from 'react';
import styles from './BudgetGauge.module.css';

interface BudgetGaugeProps {
  currentSpend: number;
  budgetLimit: number;
  label?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getStatus(percentage: number): { status: 'on-track' | 'at-risk' | 'over-budget'; label: string } {
  if (percentage >= 95) {
    return { status: 'over-budget', label: 'Over Budget' };
  } else if (percentage >= 80) {
    return { status: 'at-risk', label: 'At Risk' };
  }
  return { status: 'on-track', label: 'On Track' };
}

export default function BudgetGauge({ currentSpend, budgetLimit, label = '30-Day Budget' }: BudgetGaugeProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const actualPercentage = Math.min((currentSpend / budgetLimit) * 100, 100);
  const { status, label: statusLabel } = getStatus(actualPercentage);

  useEffect(() => {
    // Animate the gauge fill on mount
    const timer = setTimeout(() => {
      setAnimatedPercentage(actualPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [actualPercentage]);

  // Calculate stroke dash for circular gauge
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className={styles.container}>
      <div className={styles.gaugeWrapper}>
        <svg className={styles.gauge} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className={styles.backgroundCircle}
            cx="50"
            cy="50"
            r="45"
            strokeWidth="8"
          />
          {/* Green zone (0-80%) */}
          <circle
            className={styles.greenZone}
            cx="50"
            cy="50"
            r="45"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.2}
            transform="rotate(-90 50 50)"
          />
          {/* Yellow zone (80-95%) */}
          <circle
            className={styles.yellowZone}
            cx="50"
            cy="50"
            r="45"
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.15} ${circumference}`}
            strokeDashoffset={circumference * 0.05}
            transform="rotate(198 50 50)"
          />
          {/* Red zone (95-100%) */}
          <circle
            className={styles.redZone}
            cx="50"
            cy="50"
            r="45"
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.05} ${circumference}`}
            transform="rotate(252 50 50)"
          />
          {/* Progress indicator */}
          <circle
            className={`${styles.progress} ${styles[status]}`}
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className={styles.gaugeCenter}>
          <span className={styles.percentage}>{Math.round(actualPercentage)}%</span>
          <span className={`${styles.statusLabel} ${styles[status]}`}>{statusLabel}</span>
        </div>
      </div>

      <div className={styles.details}>
        <span className={styles.label}>{label}</span>
        <div className={styles.amounts}>
          <span className={styles.current}>{formatCurrency(currentSpend)}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.limit}>{formatCurrency(budgetLimit)}</span>
        </div>
      </div>
    </div>
  );
}
