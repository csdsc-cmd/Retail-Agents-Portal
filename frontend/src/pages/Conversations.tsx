import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { PageHeader } from '../components/common/PageHeader';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { getConversations, getAgents } from '../services/api';
import type { Conversation, Agent } from '../types';
import styles from './Conversations.module.css';

const eventTypeLabels: Record<string, string> = {
  'theft-detected': 'Theft Detected',
  'inventory-discrepancy': 'Inventory Issue',
  'suspicious-return': 'Suspicious Return',
  'price-anomaly': 'Price Anomaly',
  'compliance-violation': 'Compliance',
  'customer-complaint': 'Customer Complaint',
  'staff-alert': 'Staff Alert',
  'system-alert': 'System Alert',
};

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const [convData, agentData] = await Promise.all([
          getConversations(page, 20),
          getAgents(1, 100)
        ]);
        setConversations(convData.data);
        setTotalPages(convData.pagination.totalPages);

        const agentMap = new Map<string, Agent>();
        agentData.data.forEach(a => agentMap.set(a.id, a));
        setAgents(agentMap);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page]);

  if (loading) {
    return <div className={styles.loading}>Loading conversations...</div>;
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Agent Interactions"
        description="Review all AI agent interactions across your retail network. Each interaction includes business context showing the store, event type, and resolution outcome to help identify patterns and training opportunities."
      />

      <Card className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Business Context</th>
              <th>Started</th>
              <th>Messages</th>
              <th>Tokens</th>
              <th>Sentiment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map(conv => {
              const agent = agents.get(conv.agentId);
              return (
                <tr key={conv.id}>
                  <td className={styles.agentCell}>
                    <div className={styles.agentInfo}>
                      <span className={styles.agentName}>{agent?.name || 'Unknown'}</span>
                      {agent && <CategoryBadge category={agent.category} size="small" />}
                    </div>
                  </td>
                  <td className={styles.contextCell}>
                    {conv.businessContext ? (
                      <div className={styles.contextInfo}>
                        <span className={styles.storeName}>{conv.businessContext.storeName}</span>
                        <span className={styles.eventType}>
                          {eventTypeLabels[conv.businessContext.eventType] || conv.businessContext.eventType}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.noContext}>-</span>
                    )}
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(conv.startedAt).toLocaleString('en-NZ', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{conv.messageCount}</td>
                  <td>{conv.totalTokens.toLocaleString()}</td>
                  <td><StatusBadge status={conv.sentiment} /></td>
                  <td><StatusBadge status={conv.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
  );
}
