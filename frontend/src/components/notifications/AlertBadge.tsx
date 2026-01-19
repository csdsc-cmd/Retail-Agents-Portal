import styles from './AlertBadge.module.css';

interface AlertBadgeProps {
  count: number;
  onClick?: () => void;
}

export default function AlertBadge({ count, onClick }: AlertBadgeProps) {
  return (
    <button
      className={styles.bellButton}
      onClick={onClick}
      aria-label={`${count} unread notifications`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" className={styles.bellIcon}>
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
      {count > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
