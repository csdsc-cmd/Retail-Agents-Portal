import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AlertBadge from '../notifications/AlertBadge';
import NotificationCenter from '../notifications/NotificationCenter';
import { Notification } from '../notifications/NotificationItem';
import styles from './Sidebar.module.css';

// Mock notifications for demo
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Cost savings milestone reached: $850,000',
    timestamp: '5 minutes ago',
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Inventory Scout detected unusual pattern at Store #142',
    timestamp: '12 minutes ago',
    read: false
  },
  {
    id: '3',
    type: 'critical',
    title: 'Pricing Agent flagged $12,340 decision for review',
    timestamp: '23 minutes ago',
    read: false
  },
  {
    id: '4',
    type: 'info',
    title: 'Weekly performance report ready for review',
    timestamp: '1 hour ago',
    read: true
  },
  {
    id: '5',
    type: 'success',
    title: 'Customer Service Agent resolved 47 queries automatically',
    timestamp: '2 hours ago',
    read: true
  }
];

const navItems = [
  { path: '/', label: 'Command Center', icon: 'GridViewRounded' },
  { path: '/agents', label: 'AI Agents', icon: 'SmartToy' },
  { path: '/explainability', label: 'Explainability', icon: 'Description' },
  { path: '/incidents', label: 'Incidents', icon: 'Warning' },
  { path: '/metrics', label: 'Metrics', icon: 'BarChart' },
  { path: '/costs', label: 'Cost Analysis', icon: 'Payments' },
  { path: '/conversations', label: 'Conversations', icon: 'Forum' },
  { path: '/governance', label: 'Governance', icon: 'Security' },
];

// SVG icons for D365-style look
const icons: Record<string, JSX.Element> = {
  GridViewRounded: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/>
    </svg>
  ),
  SmartToy: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/>
    </svg>
  ),
  Warning: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
    </svg>
  ),
  BarChart: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/>
    </svg>
  ),
  Payments: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/>
    </svg>
  ),
  Forum: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
    </svg>
  ),
  Security: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  ),
  Description: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
};

export default function Sidebar() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Retail AI</span>
              <span className={styles.logoSubtitle}>Command Center</span>
            </div>
          </div>
          <AlertBadge
            count={unreadCount}
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
          />
        </div>

      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            end={item.path === '/'}
          >
            <span className={styles.navIcon}>{icons[item.icon]}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.branding}>
          <span className={styles.poweredBy}>Powered by</span>
          <span className={styles.brandName}>Fusion5</span>
        </div>
      </div>
    </aside>

      <NotificationCenter
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </>
  );
}
