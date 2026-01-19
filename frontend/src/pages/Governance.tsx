import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { getAuditLogs, getUsers } from '../services/api';
import type { AuditLog, User } from '../types';
import styles from './Governance.module.css';

const actionLabels: Record<string, { label: string; color: string }> = {
  'agent.created': { label: 'Agent Created', color: '#107c10' },
  'agent.updated': { label: 'Agent Updated', color: '#0078d4' },
  'agent.deleted': { label: 'Agent Deleted', color: '#d13438' },
  'agent.started': { label: 'Agent Started', color: '#107c10' },
  'agent.stopped': { label: 'Agent Stopped', color: '#ffb900' },
  'agent.config.changed': { label: 'Config Changed', color: '#8764b8' },
  'incident.detected': { label: 'Incident Detected', color: '#d13438' },
  'incident.escalated': { label: 'Incident Escalated', color: '#d13438' },
  'incident.assigned': { label: 'Incident Assigned', color: '#0078d4' },
  'incident.resolved': { label: 'Incident Resolved', color: '#107c10' },
  'incident.commented': { label: 'Comment Added', color: '#6b7280' },
  'alert.triggered': { label: 'Alert Triggered', color: '#d13438' },
  'alert.acknowledged': { label: 'Alert Acknowledged', color: '#0078d4' },
  'alert.dismissed': { label: 'Alert Dismissed', color: '#6b7280' },
  'store.flagged': { label: 'Store Flagged', color: '#ffb900' },
  'store.cleared': { label: 'Store Cleared', color: '#107c10' },
  'report.generated': { label: 'Report Generated', color: '#0078d4' },
  'report.exported': { label: 'Report Exported', color: '#0078d4' },
  'report.scheduled': { label: 'Report Scheduled', color: '#8764b8' },
  'user.login': { label: 'User Login', color: '#6b7280' },
  'user.logout': { label: 'User Logout', color: '#6b7280' },
  'policy.updated': { label: 'Policy Updated', color: '#ffb900' },
  'policy.approved': { label: 'Policy Approved', color: '#107c10' },
  'threshold.adjusted': { label: 'Threshold Adjusted', color: '#8764b8' },
  'threshold.breached': { label: 'Threshold Breached', color: '#d13438' },
};

export default function Governance() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const [logsData, usersData] = await Promise.all([
          getAuditLogs(page, 20),
          getUsers()
        ]);
        setLogs(logsData.data);
        setTotalPages(logsData.pagination.totalPages);
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to load governance data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page]);

  if (loading) {
    return <div className={styles.loading}>Loading governance data...</div>;
  }

  const roleColors: Record<string, string> = {
    admin: '#d13438',
    operator: '#0078d4',
    viewer: '#6b7280'
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    operator: 'Operator',
    viewer: 'Viewer'
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Governance & Audit"
        description="Maintain oversight and compliance with comprehensive audit trails. Track all user actions, configuration changes, and incident responses to ensure accountability and support regulatory requirements."
        actions={
          <ExportButton
            config={{
              title: 'Governance & Audit Report',
              filename: 'governance-audit-report',
              sections: [
                { title: 'System Users', data: users.map(u => ({ name: u.name, email: u.email, role: roleLabels[u.role] })) },
                { title: 'Audit Trail', data: logs.map(l => ({ timestamp: l.timestamp, user: l.userName, action: actionLabels[l.action]?.label || l.action, resource: l.resource })) },
              ],
            }}
          />
        }
      />

      <div className={styles.sections}>
        <Card className={styles.usersCard}>
          <h2 className={styles.sectionTitle}>System Users</h2>
          <p className={styles.sectionDescription}>
            Users with access to the Retail AI Command Center, organized by role and permission level.
          </p>
          <div className={styles.usersList}>
            {users.map(user => (
              <div key={user.id} className={styles.userRow}>
                <img src={user.avatar} alt="" className={styles.avatar} />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
                <span
                  className={styles.role}
                  style={{ backgroundColor: `${roleColors[user.role]}15`, color: roleColors[user.role] }}
                >
                  {roleLabels[user.role]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.logsCard}>
          <h2 className={styles.sectionTitle}>Audit Trail</h2>
          <p className={styles.sectionDescription}>
            Comprehensive log of all system activities, including agent operations, incident management, and user actions.
          </p>
          <div className={styles.logsList}>
            {logs.map(log => {
              const actionInfo = actionLabels[log.action] || { label: log.action, color: '#6b7280' };
              return (
                <div key={log.id} className={styles.logRow}>
                  <div className={styles.logMeta}>
                    <span className={styles.logTime}>
                      {new Date(log.timestamp).toLocaleString('en-NZ', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className={styles.logUser}>{log.userName}</span>
                  </div>
                  <div className={styles.logAction}>
                    <span
                      className={styles.actionBadge}
                      style={{ backgroundColor: `${actionInfo.color}15`, color: actionInfo.color }}
                    >
                      {actionInfo.label}
                    </span>
                    <span className={styles.logResource}>{log.resource}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={styles.pageButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={styles.pageButton}
            >
              Next
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
