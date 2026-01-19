import styles from './SeverityBadge.module.css';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'small' | 'medium';
}

const severityLabels: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function SeverityBadge({ severity, size = 'medium' }: SeverityBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[severity]} ${styles[size]}`}>
      {severityLabels[severity]}
    </span>
  );
}
