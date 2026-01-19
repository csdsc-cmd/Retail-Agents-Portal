import { useState, useEffect, useCallback } from 'react';

const BUDGET_STORAGE_KEY = 'ai-agent-portal-budget-limit';
const DEFAULT_BUDGET = 5000;

export interface BudgetSettings {
  budgetLimit: number;
  setBudgetLimit: (limit: number) => void;
  resetToDefault: () => void;
}

export function useBudgetSettings(): BudgetSettings {
  const [budgetLimit, setBudgetLimitState] = useState<number>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }
    return DEFAULT_BUDGET;
  });

  // Persist to localStorage whenever budget changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BUDGET_STORAGE_KEY, budgetLimit.toString());
    }
  }, [budgetLimit]);

  const setBudgetLimit = useCallback((limit: number) => {
    if (limit > 0) {
      setBudgetLimitState(limit);
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setBudgetLimitState(DEFAULT_BUDGET);
  }, []);

  return {
    budgetLimit,
    setBudgetLimit,
    resetToDefault,
  };
}

export default useBudgetSettings;
