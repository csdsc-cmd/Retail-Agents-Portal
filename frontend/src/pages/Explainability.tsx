import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { getTransactions, getTransactionStats, getTransaction } from '../services/api';
import type { AgentTransactionLog, TransactionStats, D365Platform, TransactionOutcome } from '../types';
import styles from './Explainability.module.css';

const platformLabels: Record<D365Platform, string> = {
  'finops': 'D365 FinOps',
  'crm': 'D365 CRM',
  'business-central': 'Business Central',
};

const outcomeColors: Record<TransactionOutcome, string> = {
  'success': '#107c10',
  'partial': '#ffb900',
  'escalated': '#d13438',
  'failed': '#a4262c',
};

const outcomeLabels: Record<TransactionOutcome, string> = {
  'success': 'Success',
  'partial': 'Partial',
  'escalated': 'Escalated',
  'failed': 'Failed',
};

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-NZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEventTypeLabel(eventType: string): string {
  return eventType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Explainability() {
  const [transactions, setTransactions] = useState<AgentTransactionLog[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<AgentTransactionLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [platformFilter, setPlatformFilter] = useState<D365Platform | ''>('');
  const [outcomeFilter, setOutcomeFilter] = useState<TransactionOutcome | ''>('');

  useEffect(() => {
    loadData();
  }, [page, platformFilter, outcomeFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const [txData, statsData] = await Promise.all([
        getTransactions(page, 15, {
          platform: platformFilter || undefined,
          outcome: outcomeFilter || undefined,
        }),
        getTransactionStats(),
      ]);
      setTransactions(txData.data);
      setTotalPages(txData.pagination.totalPages);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTransaction(id: string) {
    try {
      const tx = await getTransaction(id);
      setSelectedTransaction(tx);
    } catch (err) {
      console.error('Failed to load transaction details:', err);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Transaction Explainability"
        description="Review every decision made by your AI agents with full transparency. Each transaction includes the input data, reasoning steps, business rules applied, and final decision for audit and compliance purposes."
        actions={
          <ExportButton
            config={{
              title: 'Transaction Explainability Report',
              filename: 'explainability-report',
              sections: [
                { title: 'Transaction Statistics', data: { totalTransactions: stats?.totalTransactions, successRate: stats?.successRate, totalSavings: stats?.totalSavings, escalationRate: stats?.escalationRate } },
                { title: 'Transactions', data: transactions.map(tx => ({ agent: tx.agentName, type: tx.transactionType, platform: platformLabels[tx.platform], outcome: outcomeLabels[tx.outcome], confidence: tx.confidenceScore, costSaved: tx.costSaved, timestamp: tx.timestamp })) },
              ],
            }}
          />
        }
      />

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{stats?.totalTransactions.toLocaleString() || 0}</div>
          <div className={styles.statLabel}>Total Transactions (7d)</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#107c10' }}>
            {((stats?.successRate || 0) * 100).toFixed(1)}%
          </div>
          <div className={styles.statLabel}>Success Rate</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#107c10' }}>
            {formatCurrency(stats?.totalSavings || 0)}
          </div>
          <div className={styles.statLabel}>Total Savings</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#d13438' }}>
            {((stats?.escalationRate || 0) * 100).toFixed(1)}%
          </div>
          <div className={styles.statLabel}>Escalation Rate</div>
        </Card>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={platformFilter}
          onChange={(e) => { setPlatformFilter(e.target.value as D365Platform | ''); setPage(1); }}
          className={styles.filterSelect}
        >
          <option value="">All Platforms</option>
          <option value="finops">D365 FinOps</option>
          <option value="crm">D365 CRM</option>
          <option value="business-central">Business Central</option>
        </select>
        <select
          value={outcomeFilter}
          onChange={(e) => { setOutcomeFilter(e.target.value as TransactionOutcome | ''); setPage(1); }}
          className={styles.filterSelect}
        >
          <option value="">All Outcomes</option>
          <option value="success">Success</option>
          <option value="partial">Partial</option>
          <option value="escalated">Escalated</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Transaction List */}
        <Card className={styles.listCard}>
          <h2 className={styles.sectionTitle}>Recent Transactions</h2>
          {loading ? (
            <div className={styles.loading}>Loading transactions...</div>
          ) : (
            <>
              <div className={styles.transactionList}>
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className={`${styles.transactionItem} ${selectedTransaction?.id === tx.id ? styles.selected : ''}`}
                    onClick={() => handleSelectTransaction(tx.id)}
                  >
                    <div className={styles.txHeader}>
                      <span className={styles.txAgent}>{tx.agentName}</span>
                      <span
                        className={styles.txOutcome}
                        style={{ backgroundColor: `${outcomeColors[tx.outcome]}15`, color: outcomeColors[tx.outcome] }}
                      >
                        {outcomeLabels[tx.outcome]}
                      </span>
                    </div>
                    <div className={styles.txType}>{getEventTypeLabel(tx.transactionType)}</div>
                    <div className={styles.txMeta}>
                      <span>{formatDate(tx.timestamp)}</span>
                      <span>{platformLabels[tx.platform]}</span>
                      <span className={styles.txSavings}>+{formatCurrency(tx.costSaved)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className={styles.pageButton}
                  >
                    Previous
                  </button>
                  <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className={styles.pageButton}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Transaction Detail */}
        <Card className={styles.detailCard}>
          {selectedTransaction ? (
            <>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailTitle}>{selectedTransaction.agentName}</h2>
                <span
                  className={styles.detailOutcome}
                  style={{ backgroundColor: outcomeColors[selectedTransaction.outcome] }}
                >
                  {outcomeLabels[selectedTransaction.outcome]}
                </span>
              </div>

              <div className={styles.detailMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Transaction Type</span>
                  <span className={styles.metaValue}>{getEventTypeLabel(selectedTransaction.transactionType)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Platform</span>
                  <span className={styles.metaValue}>{platformLabels[selectedTransaction.platform]}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Timestamp</span>
                  <span className={styles.metaValue}>{new Date(selectedTransaction.timestamp).toLocaleString()}</span>
                </div>
                {selectedTransaction.storeName && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Store</span>
                    <span className={styles.metaValue}>{selectedTransaction.storeName}</span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Confidence Score</span>
                  <span className={styles.metaValue}>{selectedTransaction.confidenceScore}%</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Decision</h3>
                <div className={styles.decision}>{selectedTransaction.decision}</div>
              </div>

              <div className={styles.detailSection}>
                <h3>Reasoning Steps</h3>
                <ol className={styles.reasoningList}>
                  {selectedTransaction.reasoning.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className={styles.detailSection}>
                <h3>Data Sources Used</h3>
                <div className={styles.tagList}>
                  {selectedTransaction.dataSourcesUsed.map((source, i) => (
                    <span key={i} className={styles.tag}>{source}</span>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Business Rules Applied</h3>
                <div className={styles.tagList}>
                  {selectedTransaction.rulesApplied.map((rule, i) => (
                    <span key={i} className={styles.ruleTag}>{rule}</span>
                  ))}
                </div>
              </div>

              {selectedTransaction.humanOverrideRequired && (
                <div className={styles.overrideSection}>
                  <div className={styles.overrideHeader}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Human Override Required
                  </div>
                  <div className={styles.overrideReason}>{selectedTransaction.overrideReason}</div>
                </div>
              )}

              <div className={styles.financialSection}>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Transaction Cost</span>
                  <span className={styles.financialValue}>{formatCurrency(selectedTransaction.transactionCost)}</span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Cost Saved</span>
                  <span className={styles.financialValue} style={{ color: '#107c10' }}>
                    +{formatCurrency(selectedTransaction.costSaved)}
                  </span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Net Savings</span>
                  <span className={styles.financialValue} style={{ color: '#107c10', fontWeight: 700 }}>
                    +{formatCurrency(selectedTransaction.costSaved - selectedTransaction.transactionCost)}
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Input Data</h3>
                <pre className={styles.inputData}>
                  {JSON.stringify(selectedTransaction.inputData, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <h3>Select a Transaction</h3>
              <p>Choose a transaction from the list to view its full explainability details.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
