import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Agent, D365Platform } from '../../types';
import styles from './AgentWatchtowerTable.module.css';

interface AgentWatchtowerTableProps {
  agents: Agent[];
  onAgentClick?: (agentId: string) => void;
}

type SortField = 'name' | 'status' | 'platform' | 'transactions' | 'savings' | 'escalations' | 'responseTime';
type SortDirection = 'asc' | 'desc';

const platformLabels: Record<D365Platform, string> = {
  'finops': 'FinOps',
  'crm': 'CRM',
  'business-central': 'BC',
};

const platformColors: Record<D365Platform, string> = {
  'finops': '#0078d4',
  'crm': '#8764b8',
  'business-central': '#107c10',
};

const statusConfig = {
  active: { label: 'OK', color: '#107c10', icon: '●' },
  inactive: { label: 'OFF', color: '#6b7280', icon: '○' },
  error: { label: 'ERR', color: '#d13438', icon: '✗' },
  degraded: { label: 'DEG', color: '#ffb900', icon: '⚠' },
};

function Sparkline({ data, color = '#0078d4' }: { data: number[]; color?: string }) {
  if (!data || data.length === 0) return <span className={styles.noData}>-</span>;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 20;
  const width = 60;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className={styles.sparkline}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export default function AgentWatchtowerTable({ agents, onAgentClick }: AgentWatchtowerTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          const statusOrder = { error: 3, degraded: 2, inactive: 1, active: 0 };
          comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) -
                       (statusOrder[b.status as keyof typeof statusOrder] || 0);
          break;
        case 'platform':
          comparison = a.platform.localeCompare(b.platform);
          break;
        case 'transactions':
          comparison = a.metrics.totalConversations - b.metrics.totalConversations;
          break;
        case 'savings':
          comparison = (a.metrics.costSavings || 0) - (b.metrics.costSavings || 0);
          break;
        case 'escalations':
          comparison = (a.metrics.escalations || 0) - (b.metrics.escalations || 0);
          break;
        case 'responseTime':
          comparison = a.metrics.avgResponseTime - b.metrics.avgResponseTime;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [agents, sortField, sortDirection]);

  const handleRowClick = (agentId: string) => {
    if (onAgentClick) {
      onAgentClick(agentId);
    } else {
      navigate(`/agents/${agentId}`);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={`${styles.sortIcon} ${sortField === field ? styles.active : ''}`}>
      {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className={styles.sortable}>
                Agent <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('status')} className={styles.sortable}>
                Status <SortIcon field="status" />
              </th>
              <th onClick={() => handleSort('platform')} className={styles.sortable}>
                Platform <SortIcon field="platform" />
              </th>
              <th onClick={() => handleSort('transactions')} className={`${styles.sortable} ${styles.numeric}`}>
                Trans (24h) <SortIcon field="transactions" />
              </th>
              <th onClick={() => handleSort('savings')} className={`${styles.sortable} ${styles.numeric}`}>
                Savings <SortIcon field="savings" />
              </th>
              <th onClick={() => handleSort('escalations')} className={`${styles.sortable} ${styles.numeric}`}>
                Escalations <SortIcon field="escalations" />
              </th>
              <th onClick={() => handleSort('responseTime')} className={`${styles.sortable} ${styles.numeric}`}>
                Resp. Time <SortIcon field="responseTime" />
              </th>
              <th>Trend (7d)</th>
            </tr>
          </thead>
          <tbody>
            {sortedAgents.map(agent => {
              const status = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.active;
              const trendData = agent.metrics.dailyTransactions || [];
              const hasEscalations = (agent.metrics.escalations || 0) > 0;
              const isError = agent.status === 'error';
              const isDegraded = agent.status === 'degraded';

              return (
                <tr
                  key={agent.id}
                  onClick={() => handleRowClick(agent.id)}
                  className={`${styles.row} ${isError ? styles.errorRow : ''} ${isDegraded ? styles.degradedRow : ''}`}
                >
                  <td className={styles.agentName}>
                    <span className={styles.name}>{agent.name}</span>
                    <span className={styles.category}>{agent.category.replace(/-/g, ' ')}</span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${status.color}15`,
                        color: status.color,
                        borderColor: status.color
                      }}
                    >
                      <span className={styles.statusIcon}>{status.icon}</span>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.platformBadge}
                      style={{
                        backgroundColor: `${platformColors[agent.platform]}15`,
                        color: platformColors[agent.platform]
                      }}
                    >
                      {platformLabels[agent.platform]}
                    </span>
                  </td>
                  <td className={styles.numeric}>
                    {formatNumber(agent.metrics.totalConversations)}
                  </td>
                  <td className={`${styles.numeric} ${styles.savings}`}>
                    {formatCurrency(agent.metrics.costSavings || 0)}
                  </td>
                  <td className={`${styles.numeric} ${hasEscalations ? styles.escalationAlert : ''}`}>
                    {agent.metrics.escalations || 0}
                    {hasEscalations && <span className={styles.alertDot} />}
                  </td>
                  <td className={styles.numeric}>
                    {agent.metrics.avgResponseTime}ms
                  </td>
                  <td>
                    <Sparkline
                      data={trendData}
                      color={isError ? '#d13438' : isDegraded ? '#ffb900' : '#0078d4'}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {agents.length === 0 && (
        <div className={styles.empty}>
          <p>No agents found</p>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.footerText}>
          Showing {agents.length} agent{agents.length !== 1 ? 's' : ''}
        </span>
        <span className={styles.footerHint}>
          Click any row to view agent details
        </span>
      </div>
    </div>
  );
}
