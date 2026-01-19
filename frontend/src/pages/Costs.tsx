import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { getCostSummary, getCostsByCategory } from '../services/api';
import type { CostSummary, AgentCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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
  const [categoryCosts, setCategoryCosts] = useState<{ category: AgentCategory; totalCost: number; agentCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [costData, categoryData] = await Promise.all([
          getCostSummary(),
          getCostsByCategory(),
        ]);
        setCosts(costData);
        setCategoryCosts(categoryData);
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
  const categoryChartData = categoryCosts.map(c => ({
    name: categoryLabels[c.category],
    category: c.category,
    cost: c.totalCost,
    agents: c.agentCount,
  }));

  return (
    <div className={styles.page}>
      <PageHeader
        title="Cost Analysis"
        description="Track and analyze AI agent operational costs across your retail network. Monitor spending by model, category, and individual agent to optimize resource allocation and budget planning."
      />

      <div className={styles.summary}>
        <Card className={styles.totalCard}>
          <div className={styles.totalIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.totalContent}>
            <div className={styles.totalLabel}>Total Cost (30 days)</div>
            <div className={styles.totalValue}>${costs.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </Card>
      </div>

      {/* Cost by Category */}
      <Card className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Cost by Category</h2>
        <p className={styles.chartDescription}>
          Understand which agent categories are driving the most costs to identify optimization opportunities.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categoryChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
              {categoryChartData.map((entry) => (
                <Cell key={entry.category} fill={categoryColors[entry.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
