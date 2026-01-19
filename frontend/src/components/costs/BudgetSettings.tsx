import { useState } from 'react';
import styles from './BudgetSettings.module.css';

interface BudgetSettingsProps {
  budgetLimit: number;
  onBudgetChange: (newLimit: number) => void;
}

const PRESET_BUDGETS = [
  { label: '$2,500', value: 2500 },
  { label: '$5,000', value: 5000 },
  { label: '$10,000', value: 10000 },
  { label: '$25,000', value: 25000 },
  { label: '$50,000', value: 50000 },
];

export default function BudgetSettings({ budgetLimit, onBudgetChange }: BudgetSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [customValue, setCustomValue] = useState(budgetLimit.toString());

  const handlePresetClick = (value: number) => {
    onBudgetChange(value);
    setCustomValue(value.toString());
    setIsEditing(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(customValue);
    if (!isNaN(value) && value > 0) {
      onBudgetChange(value);
      setIsEditing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <h3 className={styles.title}>Budget Configuration</h3>
        </div>
        <span className={styles.currentBudget}>
          Current: <strong>{formatCurrency(budgetLimit)}</strong>
        </span>
      </div>

      <div className={styles.content}>
        <p className={styles.description}>
          Set your monthly budget threshold for AI agent costs. You'll be alerted when spending approaches or exceeds this limit.
        </p>

        <div className={styles.presets}>
          <span className={styles.presetLabel}>Quick Select:</span>
          <div className={styles.presetButtons}>
            {PRESET_BUDGETS.map(preset => (
              <button
                key={preset.value}
                className={`${styles.presetButton} ${budgetLimit === preset.value ? styles.active : ''}`}
                onClick={() => handlePresetClick(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.customSection}>
          {isEditing ? (
            <form onSubmit={handleCustomSubmit} className={styles.customForm}>
              <div className={styles.inputWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  className={styles.customInput}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  min="100"
                  step="100"
                  autoFocus
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Save
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false);
                    setCustomValue(budgetLimit.toString());
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className={styles.customButton}
              onClick={() => setIsEditing(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Set Custom Budget
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
