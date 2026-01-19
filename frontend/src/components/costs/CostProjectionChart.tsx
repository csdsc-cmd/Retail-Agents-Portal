import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import styles from './CostProjectionChart.module.css';

interface CostProjectionChartProps {
  historicalCosts: { date: string; cost: number }[];
  projectedEndOfMonth: number;
  budgetLimit: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function CostProjectionChart({
  historicalCosts,
  projectedEndOfMonth,
  budgetLimit
}: CostProjectionChartProps) {
  // Generate projected data based on historical trend
  const chartData = useMemo(() => {
    if (historicalCosts.length === 0) return [];

    const lastHistoricalDate = new Date(historicalCosts[historicalCosts.length - 1].date);

    // Calculate daily average from historical data
    const totalDays = historicalCosts.length;
    const totalCost = historicalCosts.reduce((sum, d) => sum + d.cost, 0);
    const avgDailyCost = totalDays > 0 ? totalCost / totalDays : 0;

    // Get end of month
    const endOfMonth = new Date(lastHistoricalDate.getFullYear(), lastHistoricalDate.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((endOfMonth.getTime() - lastHistoricalDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate projection points
    const projectionData = [];
    let runningCost = totalCost;

    for (let i = 1; i <= daysRemaining; i++) {
      const projectedDate = new Date(lastHistoricalDate);
      projectedDate.setDate(projectedDate.getDate() + i);

      runningCost += avgDailyCost;
      const variance = avgDailyCost * 0.15; // +/- 15% confidence band

      projectionData.push({
        date: projectedDate.toISOString().split('T')[0],
        projected: Math.round(runningCost),
        projectedLow: Math.round(runningCost - variance * i),
        projectedHigh: Math.round(runningCost + variance * i),
        isProjected: true
      });
    }

    // Combine historical and projected data
    const historical = historicalCosts.map((d, index) => {
      const cumulativeCost = historicalCosts.slice(0, index + 1).reduce((sum, item) => sum + item.cost, 0);
      return {
        date: d.date,
        actual: cumulativeCost,
        isProjected: false
      };
    });

    // Add last historical point to projection start
    if (historical.length > 0) {
      const lastHistorical = historical[historical.length - 1];
      projectionData.unshift({
        date: lastHistorical.date,
        projected: lastHistorical.actual,
        projectedLow: lastHistorical.actual,
        projectedHigh: lastHistorical.actual,
        isProjected: true
      });
    }

    return [...historical, ...projectionData.slice(1)];
  }, [historicalCosts]);

  const isOverBudget = projectedEndOfMonth > budgetLimit;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Cost Projection</h4>
        <div className={styles.projection}>
          <span className={styles.projectionLabel}>Projected Month-End:</span>
          <span className={`${styles.projectionValue} ${isOverBudget ? styles.overBudget : ''}`}>
            {formatCurrency(projectedEndOfMonth)}
          </span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-gray-400)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--color-gray-400)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--color-gray-500)' }}
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-gray-500)' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'actual' ? 'Actual' : 'Projected'
              ]}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Legend />

            {/* Budget reference line */}
            <ReferenceLine
              y={budgetLimit}
              stroke="var(--color-error)"
              strokeDasharray="5 5"
              label={{
                value: `Budget: ${formatCurrency(budgetLimit)}`,
                position: 'right',
                fill: 'var(--color-error)',
                fontSize: 11
              }}
            />

            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="projectedHigh"
              stroke="none"
              fill="var(--color-gray-200)"
              fillOpacity={0.3}
              name="High Estimate"
            />
            <Area
              type="monotone"
              dataKey="projectedLow"
              stroke="none"
              fill="var(--bg-card)"
              name="Low Estimate"
            />

            {/* Actual costs */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--color-primary-500)"
              strokeWidth={2}
              fill="url(#colorActual)"
              name="Actual"
            />

            {/* Projected costs */}
            <Area
              type="monotone"
              dataKey="projected"
              stroke="var(--color-gray-500)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorProjected)"
              name="Projected"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendLine} ${styles.actual}`} />
          <span>Actual Cumulative Cost</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendLine} ${styles.projected}`} />
          <span>Projected (with ±15% band)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendLine} ${styles.budget}`} />
          <span>Budget Limit</span>
        </div>
      </div>
    </div>
  );
}
