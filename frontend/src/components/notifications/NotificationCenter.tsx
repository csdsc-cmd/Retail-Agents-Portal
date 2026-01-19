import { useEffect, useRef } from 'react';
import NotificationItem, { Notification } from './NotificationItem';
import styles from './NotificationCenter.module.css';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      role="dialog"
      aria-label="Notifications"
      aria-modal="true"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Notifications</h3>
        {unreadCount > 0 && (
          <button className={styles.markAllButton} onClick={onMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerText}>
          {unreadCount === 0 ? 'All caught up!' : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  );
}
