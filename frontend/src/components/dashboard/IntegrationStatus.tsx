import { useMemo } from 'react';
import type { Agent, D365Platform } from '../../types';
import styles from './IntegrationStatus.module.css';

interface IntegrationStatusProps {
  agents: Agent[];
}

type IntegrationHealth = 'connected' | 'degraded' | 'disconnected';

interface PlatformIntegration {
  platform: D365Platform;
  label: string;
  health: IntegrationHealth;
  agentCount: number;
  lastSync: Date;
  transactionCount: number;
}

const platformConfig: Record<D365Platform, { label: string; color: string; icon: string }> = {
  'finops': {
    label: 'D365 FinOps',
    color: '#0078d4',
    icon: '📊'
  },
  'crm': {
    label: 'D365 CRM',
    color: '#8764b8',
    icon: '👥'
  },
  'business-central': {
    label: 'Business Central',
    color: '#107c10',
    icon: '🏢'
  }
};

const healthConfig: Record<IntegrationHealth, { label: string; color: string; icon: string }> = {
  'connected': { label: 'Connected', color: '#107c10', icon: '●' },
  'degraded': { label: 'Degraded', color: '#ffb900', icon: '⚠' },
  'disconnected': { label: 'Disconnected', color: '#d13438', icon: '✗' }
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function IntegrationStatus({ agents }: IntegrationStatusProps) {
  const integrations = useMemo<PlatformIntegration[]>(() => {
    const platforms: D365Platform[] = ['finops', 'crm', 'business-central'];

    return platforms.map(platform => {
      // Find agents deployed to this platform
      const platformAgents = agents.filter(agent =>
        agent.platforms?.some(p => p.platform === platform && p.isDeployed)
      );

      // Calculate total transactions for this platform
      const transactionCount = platformAgents.reduce((sum, agent) => {
        const platformDeployment = agent.platforms?.find(p => p.platform === platform);
        return sum + (platformDeployment?.transactionCount || 0);
      }, 0);

      // Determine health based on agent statuses
      const errorAgents = platformAgents.filter(a => a.status === 'error').length;
      const degradedAgents = platformAgents.filter(a => a.status === 'degraded').length;

      let health: IntegrationHealth = 'connected';
      if (platformAgents.length === 0) {
        health = 'disconnected';
      } else if (errorAgents > 0 || (errorAgents + degradedAgents) > platformAgents.length * 0.3) {
        health = 'degraded';
      }

      // Simulate last sync time (more recent for healthy platforms)
      const syncOffset = health === 'connected' ? 5 : health === 'degraded' ? 45 : 300;
      const lastSync = new Date(Date.now() - syncOffset * 1000 * Math.random());

      return {
        platform,
        label: platformConfig[platform].label,
        health,
        agentCount: platformAgents.length,
        lastSync,
        transactionCount
      };
    });
  }, [agents]);

  const overallHealth = useMemo(() => {
    const hasDisconnected = integrations.some(i => i.health === 'disconnected');
    const hasDegraded = integrations.some(i => i.health === 'degraded');

    if (hasDisconnected) return 'degraded';
    if (hasDegraded) return 'degraded';
    return 'connected';
  }, [integrations]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Integration Health</h3>
        <span
          className={styles.overallBadge}
          style={{
            backgroundColor: `${healthConfig[overallHealth].color}15`,
            color: healthConfig[overallHealth].color
          }}
        >
          {healthConfig[overallHealth].icon} {overallHealth === 'connected' ? 'All Systems Operational' : 'Issues Detected'}
        </span>
      </div>

      <div className={styles.grid}>
        {integrations.map(integration => {
          const config = platformConfig[integration.platform];
          const healthInfo = healthConfig[integration.health];

          return (
            <div
              key={integration.platform}
              className={`${styles.card} ${styles[integration.health]}`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.platformIcon}>{config.icon}</span>
                <span className={styles.platformName}>{config.label}</span>
              </div>

              <div className={styles.statusRow}>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: `${healthInfo.color}15`,
                    color: healthInfo.color
                  }}
                >
                  {healthInfo.icon} {healthInfo.label}
                </span>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{integration.agentCount}</span>
                  <span className={styles.metricLabel}>Agents</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{formatNumber(integration.transactionCount)}</span>
                  <span className={styles.metricLabel}>Transactions</span>
                </div>
              </div>

              <div className={styles.syncInfo}>
                <span className={styles.syncLabel}>Last sync:</span>
                <span className={styles.syncTime}>{formatTimeAgo(integration.lastSync)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
