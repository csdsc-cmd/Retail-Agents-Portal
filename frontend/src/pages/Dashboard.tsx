import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { IncidentCard } from '../components/common/IncidentCard';
import { IncidentTimeline } from '../components/common/IncidentTimeline';
import { CategoryBadge } from '../components/common/CategoryBadge';
import {
  getIncidents,
  getAgentCategories,
  getSavings,
  getTransactionStats,
} from '../services/api';
import type { Incident, SavingsData, TransactionStats, AgentCategory, Agent } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './Dashboard.module.css';

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

const platformLabels: Record<string, string> = {
  'finops': 'D365 FinOps',
  'crm': 'D365 CRM',
  'business-central': 'Business Central',
};

const platformColors: Record<string, string> = {
  'finops': '#0078d4',
  'crm': '#8764b8',
  'business-central': '#107c10',
};

type SavingsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function Dashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [categories, setCategories] = useState<{ category: AgentCategory; count: number; agents: Agent[] }[]>([]);
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingsPeriod, setSavingsPeriod] = useState<SavingsPeriod>('monthly');

  useEffect(() => {
    async function loadData() {
      try {
        const [incidentsData, categoriesData, savingsData, statsData] = await Promise.all([
          getIncidents(),
          getAgentCategories(),
          getSavings(),
          getTransactionStats(),
        ]);
        setIncidents(incidentsData);
        setCategories(categoriesData);
        setSavings(savingsData);
        setTransactionStats(statsData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading command center...</div>;
  }

  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'investigating');
  const primaryIncident = activeIncidents[0];

  const getSavingsValue = (breakdown: { daily: number; weekly: number; monthly: number; yearly: number }) => {
    return breakdown[savingsPeriod];
  };

  const categoryChartData = savings ? Object.entries(savings.byCategory).map(([category, breakdown]) => ({
    name: categoryLabels[category as AgentCategory] || category,
    savings: getSavingsValue(breakdown),
    category: category as AgentCategory,
  })) : [];

  const platformChartData = savings ? Object.entries(savings.byPlatform).map(([platform, breakdown]) => ({
    name: platformLabels[platform] || platform,
    savings: getSavingsValue(breakdown),
    platform,
  })) : [];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const totalSavings = savings ? getSavingsValue(savings.total) : 0;

  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="AI Agent Command Center"
        description="Monitor your Retail AI agents across D365 platforms. Track transaction savings, review agent performance, and access explainable decision logs for every automated action."
      />

      {/* Savings Period Toggle */}
      <div className={styles.periodToggle}>
        <span className={styles.periodLabel}>View savings:</span>
        <div className={styles.periodButtons}>
          {(['daily', 'weekly', 'monthly', 'yearly'] as SavingsPeriod[]).map(period => (
            <button
              key={period}
              className={`${styles.periodButton} ${savingsPeriod === period ? styles.active : ''}`}
              onClick={() => setSavingsPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metrics}>
        <Card className={`${styles.metricCard} ${styles.savingsCard}`}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(16, 124, 16, 0.1)', color: '#107c10' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{formatCurrency(totalSavings)}</div>
            <div className={styles.metricLabel}>Total Savings ({savingsPeriod})</div>
          </div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(0, 120, 212, 0.1)', color: '#0078d4' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{transactionStats?.totalTransactions.toLocaleString() || 0}</div>
            <div className={styles.metricLabel}>Transactions (7d)</div>
          </div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(135, 100, 184, 0.1)', color: '#8764b8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{((transactionStats?.successRate || 0) * 100).toFixed(1)}%</div>
            <div className={styles.metricLabel}>Success Rate</div>
          </div>
        </Card>
        <Card className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'rgba(209, 52, 56, 0.1)', color: '#d13438' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{((transactionStats?.escalationRate || 0) * 100).toFixed(1)}%</div>
            <div className={styles.metricLabel}>Escalation Rate</div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column - Savings Charts */}
        <div className={styles.leftColumn}>
          {/* Savings by Category */}
          <Card className={styles.chartCard}>
            <h2 className={styles.sectionTitle}>Savings by Agent Category</h2>
            <p className={styles.sectionDescription}>
              Net savings generated by each category of AI agents ({savingsPeriod} view).
            </p>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Savings']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="savings" radius={[0, 4, 4, 0]}>
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.category} fill={categoryColors[entry.category]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Savings by Platform */}
          <Card className={styles.chartCard}>
            <h2 className={styles.sectionTitle}>Savings by D365 Platform</h2>
            <p className={styles.sectionDescription}>
              Distribution of savings across your D365 deployment environments.
            </p>
            <div className={styles.platformGrid}>
              {platformChartData.map(item => (
                <div key={item.platform} className={styles.platformItem}>
                  <div className={styles.platformHeader}>
                    <div className={styles.platformDot} style={{ backgroundColor: platformColors[item.platform] }} />
                    <span className={styles.platformName}>{item.name}</span>
                  </div>
                  <div className={styles.platformValue}>{formatCurrency(item.savings)}</div>
                  <div className={styles.platformBar}>
                    <div
                      className={styles.platformProgress}
                      style={{
                        width: `${(item.savings / totalSavings) * 100}%`,
                        backgroundColor: platformColors[item.platform],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Incidents & Categories */}
        <div className={styles.rightColumn}>
          {/* Active Incident or All Clear */}
          {primaryIncident ? (
            <Card className={styles.incidentDetailCard}>
              <h2 className={styles.sectionTitle}>Active Business Event</h2>
              <IncidentCard
                id={primaryIncident.id}
                title={primaryIncident.title}
                description={primaryIncident.description}
                severity={primaryIncident.severity as 'critical' | 'high' | 'medium' | 'low'}
                status={primaryIncident.status}
                affectedStores={primaryIncident.affectedStores}
                affectedCategories={primaryIncident.affectedCategories}
                startedAt={new Date(primaryIncident.startedAt)}
                onClick={() => navigate(`/incidents/${primaryIncident.id}`)}
              />

              <h3 className={styles.timelineTitle}>Agent Response Timeline</h3>
              <IncidentTimeline
                events={primaryIncident.timeline.map(e => ({
                  ...e,
                  timestamp: new Date(e.timestamp),
                }))}
                maxEvents={4}
              />
            </Card>
          ) : (
            <Card className={styles.noIncidentCard}>
              <div className={styles.noIncidentIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>All Systems Normal</h3>
              <p>No active business events requiring attention. All AI agents operating within expected parameters.</p>
            </Card>
          )}

          {/* Agent Categories */}
          <Card className={styles.categoriesCard}>
            <h2 className={styles.sectionTitle}>Agent Categories</h2>
            <p className={styles.sectionDescription}>
              {categories.length} specialized categories, {categories.reduce((sum, c) => sum + c.count, 0)} total agents
            </p>
            <div className={styles.categoriesList}>
              {categories.map(cat => (
                <div
                  key={cat.category}
                  className={styles.categoryItem}
                  onClick={() => navigate(`/agents?category=${cat.category}`)}
                >
                  <div className={styles.categoryColor} style={{ backgroundColor: categoryColors[cat.category] }} />
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{categoryLabels[cat.category]}</span>
                    <span className={styles.categoryCount}>{cat.count} agents</span>
                  </div>
                  <CategoryBadge category={cat.category} size="small" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className={styles.quickActionsCard}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <button className={styles.quickAction} onClick={() => navigate('/explainability')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>View Transaction Logs</span>
            <span className={styles.quickActionDesc}>Review agent decisions with full explainability</span>
          </button>
          <button className={styles.quickAction} onClick={() => navigate('/agents')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>Manage Agents</span>
            <span className={styles.quickActionDesc}>Configure pricing and platform deployments</span>
          </button>
          <button className={styles.quickAction} onClick={() => navigate('/costs')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Cost Analysis</span>
            <span className={styles.quickActionDesc}>Track transaction costs and ROI by category</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
