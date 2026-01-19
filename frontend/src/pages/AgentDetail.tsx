import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { getAgent, getAgentMetrics, getAgentCosts } from '../services/api';
import type { Agent, DailyMetrics, CostRecord, D365Platform, AgentCategory } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, Line } from 'recharts';
import styles from './AgentDetail.module.css';

const platformLabels: Record<D365Platform, string> = {
  'finops': 'D365 Finance & Operations',
  'crm': 'D365 Customer Engagement',
  'business-central': 'D365 Business Central',
};

const platformColors: Record<D365Platform, string> = {
  'finops': '#0078d4',
  'crm': '#107c10',
  'business-central': '#8764b8',
};

const categoryLabels: Record<AgentCategory, string> = {
  'inventory-intelligence': 'Inventory Intelligence',
  'pricing-promotions': 'Pricing & Promotions',
  'store-operations': 'Store Operations',
  'customer-service-returns': 'Customer Service & Returns',
  'executive-insights': 'Executive Insights',
};

const categoryDescriptions: Record<AgentCategory, string> = {
  'inventory-intelligence': 'Monitors stock levels, predicts demand, and automates reorder decisions across your retail network.',
  'pricing-promotions': 'Optimizes pricing strategies, manages promotional campaigns, and protects margins dynamically.',
  'store-operations': 'Streamlines daily store operations, staff scheduling, and operational efficiency tasks.',
  'customer-service-returns': 'Handles customer inquiries, processes returns, and resolves issues with empathy and speed.',
  'executive-insights': 'Aggregates data across all systems to provide strategic insights and executive-level reporting.',
};

const workflowSteps: Record<AgentCategory, string[]> = {
  'inventory-intelligence': [
    'Receive real-time inventory data from D365',
    'Analyze demand patterns and seasonal trends',
    'Generate reorder recommendations',
    'Execute approved purchase orders',
    'Monitor delivery and update stock levels',
  ],
  'pricing-promotions': [
    'Monitor competitor pricing and market conditions',
    'Analyze margin impact of price changes',
    'Recommend optimal pricing strategies',
    'Deploy approved price updates across channels',
    'Track promotion performance in real-time',
  ],
  'store-operations': [
    'Receive operational data from store systems',
    'Optimize staff scheduling based on traffic',
    'Generate task lists and priorities',
    'Monitor compliance and SLA adherence',
    'Report operational metrics to management',
  ],
  'customer-service-returns': [
    'Receive customer inquiry or return request',
    'Validate against policy and purchase history',
    'Determine resolution path and authorization',
    'Process return/refund in D365',
    'Update customer record and close ticket',
  ],
  'executive-insights': [
    'Aggregate data from all business systems',
    'Apply AI analysis for pattern detection',
    'Generate executive summary reports',
    'Identify anomalies requiring attention',
    'Deliver insights via preferred channels',
  ],
};

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const monthlySavings = agent.savings.monthly;
  const roi = totalCost > 0 ? ((monthlySavings - totalCost) / totalCost * 100) : 0;
  const netValue = monthlySavings - totalCost;

  // Combine metrics with cost data for ROI chart
  const roiChartData = metrics.slice(-14).map((m, idx) => {
    const costRecord = costs[idx] || { totalCost: 0 };
    const dailySavings = agent.pricing.savingsPerTransaction * m.conversations;
    return {
      date: m.date,
      cost: costRecord.totalCost,
      savings: dailySavings,
      net: dailySavings - costRecord.totalCost,
    };
  });

  const deployedPlatforms = agent.platforms.filter(p => p.isDeployed);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>Dashboard</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to="/agents" className={styles.breadcrumbLink}>Agents</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{agent.name}</span>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroMeta}>
            <span className={styles.categoryBadge}>{categoryLabels[agent.category]}</span>
            <StatusBadge status={agent.status} />
          </div>
          <h1 className={styles.heroTitle}>{agent.name}</h1>
          <p className={styles.heroDescription}>{agent.description}</p>
          <p className={styles.heroContext}>{categoryDescriptions[agent.category]}</p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>${monthlySavings.toLocaleString()}</span>
            <span className={styles.heroStatLabel}>Monthly Savings</span>
          </div>
          <div className={styles.heroStat}>
            <span className={`${styles.heroStatValue} ${roi > 0 ? styles.positive : styles.negative}`}>
              {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
            </span>
            <span className={styles.heroStatLabel}>ROI</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{agent.metrics.totalConversations.toLocaleString()}</span>
            <span className={styles.heroStatLabel}>Transactions (30d)</span>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <Card className={styles.valueCard}>
        <div className={styles.valueHeader}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h2>Business Value</h2>
        </div>
        <div className={styles.valueGrid}>
          <div className={styles.valueItem}>
            <div className={styles.valueItemHeader}>
              <span className={styles.valueItemLabel}>Operating Cost</span>
              <span className={styles.valueItemValue}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <p className={styles.valueItemDescription}>
              Total AI compute and API costs for the last 30 days
            </p>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueItemHeader}>
              <span className={styles.valueItemLabel}>Generated Savings</span>
              <span className={`${styles.valueItemValue} ${styles.savings}`}>${monthlySavings.toLocaleString()}</span>
            </div>
            <p className={styles.valueItemDescription}>
              {agent.roiMetric}
            </p>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueItemHeader}>
              <span className={styles.valueItemLabel}>Net Value</span>
              <span className={`${styles.valueItemValue} ${netValue >= 0 ? styles.positive : styles.negative}`}>
                {netValue >= 0 ? '+' : ''}${netValue.toLocaleString()}
              </span>
            </div>
            <p className={styles.valueItemDescription}>
              Direct contribution to bottom line after all costs
            </p>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueItemHeader}>
              <span className={styles.valueItemLabel}>Cost Per Transaction</span>
              <span className={styles.valueItemValue}>${agent.pricing.costPerTransaction.toFixed(3)}</span>
            </div>
            <p className={styles.valueItemDescription}>
              Average cost per automated decision or action
            </p>
          </div>
        </div>
      </Card>

      {/* ROI Over Time Chart */}
      <Card className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>Cost vs. Savings Trend</h2>
          <p className={styles.chartDescription}>
            Daily comparison of operating costs against value generated
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={roiChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === 'cost' ? 'Cost' : name === 'savings' ? 'Savings' : 'Net Value'
              ]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Area type="monotone" dataKey="savings" fill="#dcfce7" stroke="#22c55e" strokeWidth={2} name="savings" />
            <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={false} name="cost" />
            <Bar dataKey="net" fill="#3b82f6" opacity={0.3} name="net" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className={styles.twoColumn}>
        {/* Integration Points */}
        <Card className={styles.integrationCard}>
          <div className={styles.sectionHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <h2>System Integrations</h2>
          </div>
          <p className={styles.sectionDescription}>
            Connected D365 platforms and data sources this agent uses
          </p>
          <div className={styles.integrations}>
            {deployedPlatforms.map(platform => (
              <div key={platform.platform} className={styles.integrationItem}>
                <div
                  className={styles.integrationDot}
                  style={{ backgroundColor: platformColors[platform.platform] }}
                />
                <div className={styles.integrationContent}>
                  <span className={styles.integrationName}>{platformLabels[platform.platform]}</span>
                  <span className={styles.integrationMeta}>
                    {platform.transactionCount?.toLocaleString() || 0} transactions
                    {platform.deployedAt && ` • Since ${new Date(platform.deployedAt).toLocaleDateString()}`}
                  </span>
                </div>
                <div className={styles.integrationStatus}>
                  <span className={styles.connectedBadge}>Connected</span>
                </div>
              </div>
            ))}
            {agent.platforms.filter(p => !p.isDeployed).map(platform => (
              <div key={platform.platform} className={`${styles.integrationItem} ${styles.notDeployed}`}>
                <div className={styles.integrationDot} style={{ backgroundColor: '#d1d5db' }} />
                <div className={styles.integrationContent}>
                  <span className={styles.integrationName}>{platformLabels[platform.platform]}</span>
                  <span className={styles.integrationMeta}>Not deployed</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Business Workflow */}
        <Card className={styles.workflowCard}>
          <div className={styles.sectionHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h2>Business Workflow</h2>
          </div>
          <p className={styles.sectionDescription}>
            How this agent operates within your business processes
          </p>
          <div className={styles.workflow}>
            {workflowSteps[agent.category].map((step, idx) => (
              <div key={idx} className={styles.workflowStep}>
                <div className={styles.workflowStepNumber}>{idx + 1}</div>
                <span className={styles.workflowStepText}>{step}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className={styles.metricsCard}>
        <div className={styles.sectionHeader}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <h2>Performance Metrics</h2>
        </div>
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{(agent.metrics.successRate * 100).toFixed(1)}%</span>
            <span className={styles.metricLabel}>Success Rate</span>
            <span className={styles.metricDescription}>Transactions completed without escalation</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{agent.metrics.avgResponseTime}ms</span>
            <span className={styles.metricLabel}>Avg Response Time</span>
            <span className={styles.metricDescription}>Time to process each transaction</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{agent.metrics.escalations || 0}</span>
            <span className={styles.metricLabel}>Human Escalations</span>
            <span className={styles.metricDescription}>Transactions requiring human review</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{agent.pricing.avgTransactionsPerDay}</span>
            <span className={styles.metricLabel}>Daily Transactions</span>
            <span className={styles.metricDescription}>Average automated actions per day</span>
          </div>
        </div>
      </Card>

      {/* Transaction Volume Chart */}
      <Card className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>Transaction Volume</h2>
          <p className={styles.chartDescription}>
            Number of automated transactions processed daily
          </p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={metrics.slice(-14)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Area
              type="monotone"
              dataKey="conversations"
              stroke="#0078d4"
              fill="#0078d4"
              fillOpacity={0.1}
              strokeWidth={2}
              name="Transactions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Technical Configuration (Collapsible) */}
      <Card className={styles.configCard}>
        <details className={styles.configDetails}>
          <summary className={styles.configSummary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Technical Configuration
          </summary>
          <div className={styles.configContent}>
            <div className={styles.configGrid}>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Model</span>
                <span className={styles.configValue}>{agent.model}</span>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Temperature</span>
                <span className={styles.configValue}>{agent.config.temperature}</span>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Max Tokens</span>
                <span className={styles.configValue}>{agent.config.maxTokens.toLocaleString()}</span>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Created</span>
                <span className={styles.configValue}>{new Date(agent.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={styles.promptSection}>
              <span className={styles.promptLabel}>System Prompt</span>
              <pre className={styles.prompt}>{agent.config.systemPrompt}</pre>
            </div>
          </div>
        </details>
      </Card>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.secondaryButton}
          onClick={() => navigate('/explainability', { state: { agentId: agent.id } })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          View Transaction Logs
        </button>
        <button
          className={styles.secondaryButton}
          onClick={() => navigate('/costs', { state: { agentId: agent.id } })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          View Cost Analysis
        </button>
      </div>
    </div>
  );
}
