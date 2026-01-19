import { SeverityBadge, type Severity } from './SeverityBadge';
import styles from './IncidentCard.module.css';

export type IncidentStatus = 'active' | 'investigating' | 'contained' | 'resolved';

interface IncidentCardProps {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  affectedStores: string[];
  affectedCategories: string[];
  startedAt: Date;
  onClick?: () => void;
}

const statusLabels: Record<IncidentStatus, string> = {
  active: 'Active',
  investigating: 'Investigating',
  contained: 'Contained',
  resolved: 'Resolved',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  }
  return 'Just now';
}

export function IncidentCard({
  title,
  description,
  severity,
  status,
  affectedStores,
  affectedCategories,
  startedAt,
  onClick,
}: IncidentCardProps) {
  return (
    <div
      className={`${styles.card} ${styles[status]} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <div className={styles.badges}>
          <SeverityBadge severity={severity} size="small" />
          <span className={`${styles.statusBadge} ${styles[`status-${status}`]}`}>
            {statusLabels[status]}
          </span>
        </div>
        <span className={styles.time}>{formatTimeAgo(startedAt)}</span>
      </div>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {affectedStores.length} store{affectedStores.length !== 1 ? 's' : ''}
          </span>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            {affectedCategories.length} categor{affectedCategories.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>
    </div>
  );
}
