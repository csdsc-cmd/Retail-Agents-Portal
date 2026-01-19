import { CategoryBadge, type AgentCategory } from './CategoryBadge';
import styles from './IncidentTimeline.module.css';

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  category: AgentCategory;
  severity: EventSeverity;
}

interface IncidentTimelineProps {
  events: TimelineEvent[];
  maxEvents?: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-NZ', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NZ', {
    month: 'short',
    day: 'numeric',
  });
}

export function IncidentTimeline({ events, maxEvents }: IncidentTimelineProps) {
  const displayEvents = maxEvents ? events.slice(0, maxEvents) : events;
  const hasMore = maxEvents && events.length > maxEvents;

  return (
    <div className={styles.timeline}>
      {displayEvents.map((event, index) => (
        <div key={event.id} className={styles.event}>
          <div className={styles.connector}>
            <div className={`${styles.dot} ${styles[event.severity]}`} />
            {index < displayEvents.length - 1 && <div className={styles.line} />}
          </div>
          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.time}>
                {formatTime(event.timestamp)}
                <span className={styles.date}>{formatDate(event.timestamp)}</span>
              </span>
              <CategoryBadge category={event.category} size="small" />
            </div>
            <h4 className={styles.title}>{event.title}</h4>
            <p className={styles.description}>{event.description}</p>
            <span className={styles.agent}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {event.agentName}
            </span>
          </div>
        </div>
      ))}
      {hasMore && (
        <div className={styles.more}>
          +{events.length - maxEvents} more events
        </div>
      )}
    </div>
  );
}
