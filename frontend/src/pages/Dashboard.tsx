import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { IncidentCard } from '../components/common/IncidentCard';
import ExportButton from '../components/common/ExportButton';
import AgentWatchtowerTable from '../components/dashboard/AgentWatchtowerTable';
import IntegrationStatus from '../components/dashboard/IntegrationStatus';
import {
  getIncidents,
  getAgents,
  getSavings,
  getTransactionStats,
} from '../services/api';
import type { Incident, SavingsData, TransactionStats, Agent } from '../types';
import styles from './Dashboard.module.css';

type DashboardView = 'watchtower' | 'analytics';

const AUTO_REFRESH_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<DashboardView>('watchtower');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(60000); // Default 1 minute
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (!isInitial) {
      setRefreshing(true);
    }
    try {
      const [incidentsData, agentsResponse, savingsData, statsData] = await Promise.all([
        getIncidents(),
        getAgents(1, 100),
        getSavings(),
        getTransactionStats(),
      ]);
      setIncidents(incidentsData);
      setAgents(agentsResponse.data);
      setSavings(savingsData);
      setTransactionStats(statsData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh timer
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    if (autoRefreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        loadData(false);
      }, autoRefreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefreshInterval, loadData]);

  const handleManualRefresh = () => {
    loadData(false);
  };

  if (loading) {
    return <div className={styles.loading}>Loading command center...</div>;
  }

  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'investigating');
  const primaryIncident = activeIncidents[0];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const totalSavings = savings ? savings.total.monthly : 0;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const errorAgents = agents.filter(a => a.status === 'error' || a.status === 'degraded').length;

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="AI Agent Command Center"
        description="Real-time monitoring of all AI agents across your D365 platforms."
        actions={
          <div className={styles.headerActions}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${view === 'watchtower' ? styles.active : ''}`}
                onClick={() => setView('watchtower')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                Watchtower
              </button>
              <button
                className={`${styles.viewButton} ${view === 'analytics' ? styles.active : ''}`}
                onClick={() => setView('analytics')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Analytics
              </button>
            </div>
            <ExportButton
              config={{
                title: 'AI Agent Command Center Report',
                filename: 'dashboard-report',
                sections: [
                  { title: 'Key Metrics', data: { totalSavings, totalTransactions: transactionStats?.totalTransactions, successRate: transactionStats?.successRate, escalationRate: transactionStats?.escalationRate } },
                  { title: 'Agent Summary', data: agents.map(a => ({ name: a.name, status: a.status, platform: a.platform, transactions: a.metrics.totalConversations, savings: a.metrics.costSavings, escalations: a.metrics.escalations })) },
                  { title: 'Active Incidents', data: activeIncidents.map(i => ({ id: i.id, title: i.title, severity: i.severity, status: i.status, startedAt: i.startedAt })) },
                ],
              }}
            />
          </div>
        }
      />

      {/* Compact Metrics Row */}
      <div className={styles.compactMetrics}>
        <div className={styles.compactMetric}>
          <span className={styles.compactValue}>{agents.length}</span>
          <span className={styles.compactLabel}>Total Agents</span>
        </div>
        <div className={styles.compactDivider} />
        <div className={styles.compactMetric}>
          <span className={`${styles.compactValue} ${styles.success}`}>{activeAgents}</span>
          <span className={styles.compactLabel}>Active</span>
        </div>
        <div className={styles.compactDivider} />
        <div className={styles.compactMetric}>
          <span className={`${styles.compactValue} ${errorAgents > 0 ? styles.error : ''}`}>{errorAgents}</span>
          <span className={styles.compactLabel}>Issues</span>
        </div>
        <div className={styles.compactDivider} />
        <div className={styles.compactMetric}>
          <span className={`${styles.compactValue} ${styles.savings}`}>{formatCurrency(totalSavings)}</span>
          <span className={styles.compactLabel}>Monthly Savings</span>
        </div>
        <div className={styles.compactDivider} />
        <div className={styles.compactMetric}>
          <span className={styles.compactValue}>{transactionStats?.totalTransactions.toLocaleString() || 0}</span>
          <span className={styles.compactLabel}>Transactions (7d)</span>
        </div>
        <div className={styles.compactDivider} />
        <div className={styles.compactMetric}>
          <span className={styles.compactValue}>{((transactionStats?.successRate || 0) * 100).toFixed(1)}%</span>
          <span className={styles.compactLabel}>Success Rate</span>
        </div>
        <div className={styles.compactDivider} />
        <div className={styles.compactMetric}>
          <span className={`${styles.compactValue} ${(transactionStats?.escalationRate || 0) > 0.05 ? styles.warning : ''}`}>
            {((transactionStats?.escalationRate || 0) * 100).toFixed(1)}%
          </span>
          <span className={styles.compactLabel}>Escalations</span>
        </div>
        <div className={styles.refreshControls}>
          <button
            className={`${styles.refreshButton} ${refreshing ? styles.spinning : ''}`}
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh now"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <div className={styles.refreshInfo}>
            <span className={styles.refreshLabel}>Updated:</span>
            <span className={styles.refreshTime}>{lastRefresh.toLocaleTimeString()}</span>
          </div>
          <select
            className={styles.autoRefreshSelect}
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
            title="Auto-refresh interval"
          >
            {AUTO_REFRESH_INTERVALS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.value === 0 ? 'Auto: Off' : `Auto: ${opt.label}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Incident Banner (if any) */}
      {primaryIncident && (
        <div className={styles.incidentBanner} onClick={() => navigate(`/incidents/${primaryIncident.id}`)}>
          <div className={styles.incidentBannerIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className={styles.incidentBannerContent}>
            <span className={styles.incidentBannerTitle}>{primaryIncident.title}</span>
            <span className={styles.incidentBannerMeta}>
              {primaryIncident.affectedStores.length} stores affected • {primaryIncident.status}
            </span>
          </div>
          <span className={styles.incidentBannerAction}>View Details →</span>
        </div>
      )}

      {view === 'watchtower' ? (
        <>
          {/* Main Watchtower Table */}
          <Card className={styles.watchtowerCard}>
            <div className={styles.watchtowerHeader}>
              <h2 className={styles.watchtowerTitle}>Agent Status Overview</h2>
              <span className={styles.watchtowerCount}>{agents.length} agents</span>
            </div>
            <AgentWatchtowerTable agents={agents} onAgentClick={handleAgentClick} />
          </Card>

          {/* Integration Status */}
          <IntegrationStatus agents={agents} />
        </>
      ) : (
        /* Analytics View - Simplified version of old dashboard */
        <div className={styles.analyticsGrid}>
          <Card className={styles.analyticsCard}>
            <h2 className={styles.sectionTitle}>Savings by Category</h2>
            <p className={styles.sectionDescription}>
              Navigate to the Cost Analysis page for detailed breakdowns.
            </p>
            <button className={styles.navButton} onClick={() => navigate('/costs')}>
              View Cost Analysis →
            </button>
          </Card>

          <Card className={styles.analyticsCard}>
            <h2 className={styles.sectionTitle}>Transaction Logs</h2>
            <p className={styles.sectionDescription}>
              Access full explainability logs for all agent transactions.
            </p>
            <button className={styles.navButton} onClick={() => navigate('/explainability')}>
              View Transaction Logs →
            </button>
          </Card>

          {primaryIncident ? (
            <Card className={styles.analyticsCard}>
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
            </Card>
          ) : (
            <Card className={styles.analyticsCard}>
              <div className={styles.allClear}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3>All Systems Normal</h3>
                <p>No active business events requiring attention.</p>
              </div>
            </Card>
          )}

          <Card className={styles.analyticsCard}>
            <h2 className={styles.sectionTitle}>Agent Management</h2>
            <p className={styles.sectionDescription}>
              Configure agents, review performance, and manage deployments.
            </p>
            <button className={styles.navButton} onClick={() => navigate('/agents')}>
              Manage Agents →
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
