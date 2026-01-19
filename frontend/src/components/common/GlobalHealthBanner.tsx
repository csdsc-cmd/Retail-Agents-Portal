import { useState } from 'react';
import styles from './GlobalHealthBanner.module.css';

export type HealthStatus = 'healthy' | 'degraded' | 'critical';

interface HealthBreakdown {
  healthy: number;
  degraded: number;
  critical: number;
}

interface GlobalHealthBannerProps {
  status?: HealthStatus;
  breakdown?: HealthBreakdown;
  lastUpdated?: string;
}

const defaultBreakdown: HealthBreakdown = {
  healthy: 12,
  degraded: 2,
  critical: 1
};

function getOverallStatus(breakdown: HealthBreakdown): HealthStatus {
  if (breakdown.critical > 0) return 'critical';
  if (breakdown.degraded > 0) return 'degraded';
  return 'healthy';
}

function getStatusText(status: HealthStatus, breakdown: HealthBreakdown): string {
  switch (status) {
    case 'healthy':
      return 'All Systems Operational';
    case 'degraded':
      return `${breakdown.degraded} Agent${breakdown.degraded > 1 ? 's' : ''} Degraded`;
    case 'critical':
      return 'Critical Issue Detected';
  }
}

function getStatusIcon(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return '✓';
    case 'degraded':
      return '⚠';
    case 'critical':
      return '✕';
  }
}

export default function GlobalHealthBanner({
  status,
  breakdown = defaultBreakdown,
  lastUpdated = '2 minutes ago'
}: GlobalHealthBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentStatus = status || getOverallStatus(breakdown);
  const statusText = getStatusText(currentStatus, breakdown);
  const statusIcon = getStatusIcon(currentStatus);
  const totalAgents = breakdown.healthy + breakdown.degraded + breakdown.critical;

  return (
    <div
      className={`${styles.banner} ${styles[currentStatus]}`}
      role="status"
      aria-live="polite"
      aria-label={`System health status: ${statusText}`}
    >
      <button
        className={styles.bannerContent}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="health-breakdown"
      >
        <div className={styles.statusIndicator}>
          <span className={styles.pulse} aria-hidden="true" />
          <span className={styles.icon} aria-hidden="true">{statusIcon}</span>
        </div>
        <span className={styles.statusText}>{statusText}</span>
        <span className={styles.agentCount}>{totalAgents} agents monitored</span>
        <span className={styles.lastUpdated}>Updated {lastUpdated}</span>
        <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} aria-hidden="true">
          ▼
        </span>
      </button>

      {isExpanded && (
        <div id="health-breakdown" className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <span className={`${styles.breakdownDot} ${styles.healthyDot}`} />
            <span className={styles.breakdownLabel}>Healthy</span>
            <span className={styles.breakdownCount}>{breakdown.healthy}</span>
          </div>
          <div className={styles.breakdownItem}>
            <span className={`${styles.breakdownDot} ${styles.degradedDot}`} />
            <span className={styles.breakdownLabel}>Degraded</span>
            <span className={styles.breakdownCount}>{breakdown.degraded}</span>
          </div>
          <div className={styles.breakdownItem}>
            <span className={`${styles.breakdownDot} ${styles.criticalDot}`} />
            <span className={styles.breakdownLabel}>Critical</span>
            <span className={styles.breakdownCount}>{breakdown.critical}</span>
          </div>
        </div>
      )}
    </div>
  );
}
