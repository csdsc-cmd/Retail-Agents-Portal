import type { AgentStatus, Sentiment, ConversationStatus } from '../../types';
import styles from './StatusBadge.module.css';

type BadgeVariant = AgentStatus | Sentiment | ConversationStatus;

interface StatusBadgeProps {
  status: BadgeVariant;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={styles.badge} data-status={status}>
      {status}
    </span>
  );
}
