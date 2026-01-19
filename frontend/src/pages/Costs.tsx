import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import ExportButton from '../components/common/ExportButton';
import BudgetGauge from '../components/costs/BudgetGauge';
import BudgetSettings from '../components/costs/BudgetSettings';
import CostProjectionChart from '../components/costs/CostProjectionChart';
import { useBudgetSettings } from '../hooks/useBudgetSettings';
import { getCostSummary, getCostsByCategory, getSavings } from '../services/api';
import type { CostSummary, AgentCategory, SavingsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area, Legend } from 'recharts';
import styles from './Costs.module.css';

const categoryColors: Record<AgentCategory, string> = {
  'inventory-intelligence': '#0078d4',
  'pricing-promotions': '#107c10',
  'store-operations': '#ffb900',
  'customer-service-returns': '#8764b8',
  'executive-insights': '#00bcf2',
};

const categoryLabels: Record<AgentCategory, string> = {
  'inventory-intelligence': 'Inventory',
  'pricing-promotions': 'Pricing',
  'store-operations': 'Operations',
  'customer-service-returns': 'Customer Service',
  'executive-insights': 'Executive',
};

const MODEL_COLORS = ['#0078d4', '#107c10', '#ffb900', '#8764b8', '#d13438'];

export default function Costs() {
  const [costs, setCosts] = useState<CostSummary | null>(null);
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [categoryCosts, setCategoryCosts] = useState<{ category: AgentCategory; totalCost: number; agentCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { budgetLimit, setBudgetLimit } = useBudgetSettings();

  useEffect(() => {
    async function loadData() {
      try {
        const [costData, categoryData, savingsData] = await Promise.all([
          getCostSummary(),
          getCostsByCategory(),
          getSavings(),
        ]);
        setCosts(costData);
        setCategoryCosts(categoryData);
        setSavings(savingsData);
      } catch (err) {
        console.error('Failed to load costs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading costs...</div>;
  }

  if (!costs) {
    return <div className={styles.loading}>No cost data available</div>;
  }

  const modelData = Object.entries(costs.costByModel).map(([name, value]) => ({ name, value }));
  const topAgents = costs.costByAgent.slice(0, 10);

  // Build ROI by category data
  const categoryChartData = categoryCosts.map(c => {
    const categorySavings = savings?.byCategory[c.category]?.monthly || 0;
    const roi = c.totalCost > 0 ? ((categorySavings - c.totalCost) / c.totalCost * 100) : 0;
    return {
      name: categoryLabels[c.category],
      category: c.category,
      cost: c.totalCost,
      savings: categorySavings,
      net: categorySavings - c.totalCost,
      roi: roi,
      agents: c.agentCount,
    };
  });

  // Calculate totals
  const totalSavings = savings?.total.monthly || 0;
  const netValue = totalSavings - costs.totalCost;
  const overallROI = costs.totalCost > 0 ? ((totalSavings - costs.totalCost) / costs.totalCost * 100) : 0;

  // Build daily cost vs savings data (simulate savings based on ratio)
  const dailyCostVsSavings = costs.dailyCosts.map(d => {
    // Estimate daily savings proportionally
    const dailySavings = (totalSavings / 30) * (d.cost / (costs.totalCost / 30));
    return {
      date: d.date,
      cost: d.cost,
      savings: dailySavings || totalSavings / 30,
      net: (dailySavings || totalSavings / 30) - d.cost,
    };
  });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Cost & ROI Analysis"
        description="Track operational costs against value generated. Monitor spending by model, category, and individual agent to optimize resource allocation and maximize return on investment."
        actions={
          <ExportButton
            config={{
              title: 'Cost & ROI Analysis Report',
              filename: 'cost-roi-analysis-report',
              sections: [
                { title: 'Summary', data: { totalCost: costs.totalCost, totalSavings, netValue, roi: overallROI, budgetLimit } },
                { title: 'Cost by Model', data: modelData },
                { title: 'ROI by Category', data: categoryChartData },
                { title: 'Top Agents by Cost', data: topAgents },
                { title: 'Daily Costs', data: costs.dailyCosts },
              ],
            }}
          />
        }
      />

      {/* Key Metrics Summary */}
      <div className={styles.summary}>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#ef4444' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Operating Cost (30d)</div>
            <div className={styles.metricValue}>${costs.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#22c55e' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Value Generated (30d)</div>
            <div className={`${styles.metricValue} ${styles.savings}`}>${totalSavings.toLocaleString()}</div>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: netValue >= 0 ? '#22c55e' : '#ef4444' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Net Value</div>
            <div className={`${styles.metricValue} ${netValue >= 0 ? styles.positive : styles.negative}`}>
              {netValue >= 0 ? '+' : ''}${netValue.toLocaleString()}
            </div>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: overallROI >= 0 ? '#22c55e' : '#ef4444' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Return on Investment</div>
            <div className={`${styles.metricValue} ${overallROI >= 0 ? styles.positive : styles.negative}`}>
              {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(0)}%
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Gauge */}
      <div className={styles.budgetRow}>
        <BudgetGauge
          currentSpend={costs.totalCost}
          budgetLimit={budgetLimit}
          label="Monthly Budget"
        />
        <Card className={styles.roiSummaryCard}>
          <h3>ROI Summary</h3>
          <p className={styles.roiDescription}>
            Your AI agents generated <strong>${totalSavings.toLocaleString()}</strong> in value this month
            while costing <strong>${costs.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> to operate.
            This represents a <strong className={overallROI >= 0 ? styles.positive : styles.negative}>
              {overallROI.toFixed(0)}% return on investment
            </strong>.
          </p>
          <div className={styles.roiBar}>
            <div
              className={styles.roiBarCost}
              style={{ width: `${Math.min(100, (costs.totalCost / totalSavings) * 100)}%` }}
            />
            <div className={styles.roiBarSavings} />
          </div>
          <div className={styles.roiBarLabels}>
            <span>Cost: ${costs.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>Value: ${totalSavings.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      <CostProjectionChart
        historicalCosts={costs.dailyCosts}
        projectedEndOfMonth={costs.totalCost * 1.15}
        budgetLimit={budgetLimit}
      />

      {/* Cost vs Savings Trend */}
      <Card className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Daily Cost vs. Value Generated</h2>
        <p className={styles.chartDescription}>
          Compare daily operating costs against value generated to track ROI trends over time.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={dailyCostVsSavings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-NZ', { day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-NZ')}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === 'cost' ? 'Cost' : name === 'savings' ? 'Value' : 'Net'
              ]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Area type="monotone" dataKey="savings" fill="#dcfce7" stroke="#22c55e" strokeWidth={2} name="Value Generated" />
            <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={false} name="Cost" />
            <Bar dataKey="net" fill="#3b82f6" opacity={0.4} name="Net Value" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Budget Configuration */}
      <BudgetSettings
        budgetLimit={budgetLimit}
        onBudgetChange={setBudgetLimit}
      />

      {/* ROI by Category */}
      <Card className={styles.chartCard}>
        <h2 className={styles.chartTitle}>ROI by Category</h2>
        <p className={styles.chartDescription}>
          Compare costs against value generated for each agent category to identify your best performers.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={categoryChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === 'cost' ? 'Cost' : name === 'savings' ? 'Value' : 'Net'
              ]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Bar dataKey="cost" fill="#ef4444" name="Cost" radius={[0, 4, 4, 0]} />
            <Bar dataKey="savings" fill="#22c55e" name="Value Generated" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Category ROI Table */}
        <div className={styles.roiTable}>
          <div className={styles.roiTableHeader}>
            <span>Category</span>
            <span>Cost</span>
            <span>Value</span>
            <span>Net</span>
            <span>ROI</span>
          </div>
          {categoryChartData.map(cat => (
            <div key={cat.category} className={styles.roiTableRow}>
              <span className={styles.roiTableCategory}>
                <span className={styles.categoryDot} style={{ backgroundColor: categoryColors[cat.category] }} />
                {cat.name}
              </span>
              <span>${cat.cost.toFixed(2)}</span>
              <span className={styles.savings}>${cat.savings.toLocaleString()}</span>
              <span className={cat.net >= 0 ? styles.positive : styles.negative}>
                {cat.net >= 0 ? '+' : ''}${cat.net.toLocaleString()}
              </span>
              <span className={cat.roi >= 0 ? styles.positive : styles.negative}>
                {cat.roi >= 0 ? '+' : ''}{cat.roi.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className={styles.charts}>
        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Cost by Model</h2>
          <p className={styles.chartDescription}>
            Distribution of costs across different AI models used by your agents.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={modelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {modelData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={MODEL_COLORS[index % MODEL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Daily Cost Trend</h2>
          <p className={styles.chartDescription}>
            Monitor daily spending patterns to identify anomalies and forecast future costs.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={costs.dailyCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-NZ', { day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-NZ')}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="cost" stroke="#0078d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className={styles.tableCard}>
        <h2 className={styles.chartTitle}>Top 10 Agents by Cost</h2>
        <p className={styles.chartDescription}>
          Individual agents with the highest operational costs. Consider reviewing high-cost agents for optimization.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topAgents} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <YAxis
              type="category"
              dataKey="agentName"
              tick={{ fontSize: 11 }}
              width={200}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="totalCost" fill="#0078d4" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
