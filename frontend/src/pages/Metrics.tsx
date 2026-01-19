import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { getTimeseriesMetrics, getDashboardOverview, getMetricsByCategory } from '../services/api';
import type { DashboardOverview, CategoryMetrics, AgentCategory } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import styles from './Metrics.module.css';

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

export default function Metrics() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [timeseries, setTimeseries] = useState<{ date: string; conversations: number; avgResponseTime: number; successRate: number }[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewData, timeseriesData, categoryData] = await Promise.all([
          getDashboardOverview(),
          getTimeseriesMetrics(30),
          getMetricsByCategory(),
        ]);
        setOverview(overviewData);
        setTimeseries(timeseriesData);
        setCategoryMetrics(categoryData);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading metrics...</div>;
  }

  const categoryChartData = categoryMetrics.map(m => ({
    name: categoryLabels[m.category],
    category: m.category,
    conversations: m.totalConversations,
    successRate: m.successRate * 100,
  }));

  return (
    <div className={styles.page}>
      <PageHeader
        title="Performance Metrics"
        description="Monitor AI agent performance across all categories. Track interaction volumes, response times, and success rates to identify optimization opportunities and ensure service quality."
      />

      <div className={styles.summary}>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(0, 120, 212, 0.1)', color: '#0078d4' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{overview?.totalConversations?.toLocaleString()}</div>
            <div className={styles.metricLabel}>Total Interactions (30 days)</div>
          </div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(255, 185, 0, 0.15)', color: '#996f00' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{overview?.avgResponseTime}ms</div>
            <div className={styles.metricLabel}>Avg Response Time</div>
          </div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(16, 124, 16, 0.1)', color: '#107c10' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{((overview?.avgSuccessRate || 0) * 100).toFixed(1)}%</div>
            <div className={styles.metricLabel}>Success Rate</div>
          </div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(0, 188, 242, 0.1)', color: '#00bcf2' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{((overview?.totalTokens || 0) / 1000000).toFixed(2)}M</div>
            <div className={styles.metricLabel}>Tokens Processed</div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Performance by Category</h2>
        <p className={styles.chartDescription}>
          Interaction volume and success rate comparison across all agent categories over the past 30 days.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categoryChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'conversations' ? value.toLocaleString() : `${value.toFixed(1)}%`,
                name === 'conversations' ? 'Interactions' : 'Success Rate'
              ]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="conversations" radius={[0, 4, 4, 0]}>
              {categoryChartData.map((entry) => (
                <Cell key={entry.category} fill={categoryColors[entry.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Daily Interaction Volume</h2>
        <p className={styles.chartDescription}>
          Track daily interaction patterns to identify peak usage periods and plan capacity accordingly.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeseries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-NZ')}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="conversations" fill="#0078d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className={styles.charts}>
        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Response Time Trend</h2>
          <p className={styles.chartDescription}>
            Monitor response latency to ensure agents maintain acceptable performance levels.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-NZ', { day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 11 }} unit="ms" />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-NZ')}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="avgResponseTime" stroke="#ffb900" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Success Rate Trend</h2>
          <p className={styles.chartDescription}>
            Track resolution success to identify potential issues or training opportunities.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-NZ', { day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 11 }} domain={[0.8, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-NZ')}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Success Rate']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="successRate" stroke="#107c10" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
