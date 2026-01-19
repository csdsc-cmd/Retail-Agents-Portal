import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { getAgent, getAgentMetrics, getAgentCosts } from '../services/api';
import type { Agent, DailyMetrics, CostRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './AgentDetail.module.css';

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [costs, setCosts] = useState<CostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [agentData, metricsData, costsData] = await Promise.all([
          getAgent(id),
          getAgentMetrics(id),
          getAgentCosts(id)
        ]);
        setAgent(agentData);
        setMetrics(metricsData);
        setCosts(costsData);
      } catch (err) {
        console.error('Failed to load agent:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className={styles.loading}>Loading agent details...</div>;
  }

  if (!agent) {
    return <div className={styles.loading}>Agent not found</div>;
  }

  const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);

  return (
    <div className={styles.page}>
      <Link to="/agents" className={styles.backLink}>← Back to Agents</Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{agent.name}</h1>
          <p className={styles.description}>{agent.description}</p>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className={styles.overview}>
        <Card className={styles.infoCard}>
          <h3>Configuration</h3>
          <dl className={styles.infoList}>
            <div className={styles.infoItem}>
              <dt>Model</dt>
              <dd>{agent.model}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Temperature</dt>
              <dd>{agent.config.temperature}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Max Tokens</dt>
              <dd>{agent.config.maxTokens}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Created</dt>
              <dd>{new Date(agent.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </Card>

        <Card className={styles.infoCard}>
          <h3>Performance</h3>
          <dl className={styles.infoList}>
            <div className={styles.infoItem}>
              <dt>Total Conversations</dt>
              <dd>{agent.metrics.totalConversations.toLocaleString()}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Avg Response Time</dt>
              <dd>{agent.metrics.avgResponseTime}ms</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Success Rate</dt>
              <dd>{(agent.metrics.successRate * 100).toFixed(1)}%</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>30-Day Cost</dt>
              <dd>${totalCost.toFixed(2)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className={styles.chartCard}>
        <h3>Daily Conversations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.slice(-14)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className={styles.promptCard}>
        <h3>System Prompt</h3>
        <pre className={styles.prompt}>{agent.config.systemPrompt}</pre>
      </Card>
    </div>
  );
}
