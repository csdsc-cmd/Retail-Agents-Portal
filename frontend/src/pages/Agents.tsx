import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { PageHeader } from '../components/common/PageHeader';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { getAgents, getAgentCategories } from '../services/api';
import type { Agent, AgentCategory } from '../types';
import styles from './Agents.module.css';

const categoryLabels: Record<AgentCategory, string> = {
  'inventory-intelligence': 'Inventory Intelligence',
  'pricing-promotions': 'Pricing & Promotions',
  'store-operations': 'Store Operations',
  'customer-service-returns': 'Customer Service',
  'executive-insights': 'Executive Insights',
};

const categoryColors: Record<AgentCategory, string> = {
  'inventory-intelligence': '#0078d4',
  'pricing-promotions': '#107c10',
  'store-operations': '#ffb900',
  'customer-service-returns': '#8764b8',
  'executive-insights': '#00bcf2',
};

const categoryDescriptions: Record<AgentCategory, string> = {
  'inventory-intelligence': 'Monitors stock levels, detects shelf gaps, and forecasts demand to optimize inventory management.',
  'pricing-promotions': 'Optimizes pricing strategies, tracks promotion performance, and monitors competitor pricing.',
  'store-operations': 'Manages staff scheduling, queue management, compliance checks, and maintenance alerts.',
  'customer-service-returns': 'Handles customer inquiries, processes returns, analyzes feedback, and manages loyalty programs.',
  'executive-insights': 'Provides daily summaries, cross-store comparisons, strategic alerts, and financial health monitoring.',
};

export default function Agents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<{ category: AgentCategory; count: number; agents: Agent[] }[]>([]);
  const [loading, setLoading] = useState(true);

  const statusFilter = searchParams.get('status') || '';
  const categoryFilter = (searchParams.get('category') || '') as AgentCategory | '';

  useEffect(() => {
    async function loadData() {
      try {
        const [agentsData, categoriesData] = await Promise.all([
          getAgents(1, 100, statusFilter || undefined, categoryFilter || undefined),
          getAgentCategories(),
        ]);
        setAgents(agentsData.data);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load agents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  if (loading) {
    return <div className={styles.loading}>Loading agents...</div>;
  }

  const selectedCategory = categories.find(c => c.category === categoryFilter);
  const pageDescription = categoryFilter && selectedCategory
    ? categoryDescriptions[categoryFilter]
    : 'Manage and monitor all AI agents deployed across your retail network. Each agent is specialized for specific operations and continuously learns from interactions.';

  return (
    <div className={styles.page}>
      <PageHeader
        title={selectedCategory ? categoryLabels[selectedCategory.category] : 'AI Agents'}
        description={pageDescription}
        actions={
          <div className={styles.filters}>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        <button
          className={`${styles.categoryTab} ${!categoryFilter ? styles.active : ''}`}
          onClick={() => handleCategoryChange('')}
        >
          All Categories
          <span className={styles.tabCount}>{agents.length}</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.category}
            className={`${styles.categoryTab} ${categoryFilter === cat.category ? styles.active : ''}`}
            onClick={() => handleCategoryChange(cat.category)}
            style={{ '--tab-color': categoryColors[cat.category] } as React.CSSProperties}
          >
            {categoryLabels[cat.category]}
            <span className={styles.tabCount}>{cat.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {agents.map(agent => (
          <Link key={agent.id} to={`/agents/${agent.id}`} className={styles.cardLink}>
            <Card className={styles.agentCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.agentName}>{agent.name}</h3>
                <StatusBadge status={agent.status} />
              </div>
              <CategoryBadge category={agent.category} size="small" />
              <p className={styles.description}>{agent.description}</p>
              <div className={styles.meta}>
                <span className={styles.model}>{agent.model}</span>
                <span className={styles.conversations}>
                  {agent.metrics.totalConversations.toLocaleString()} interactions
                </span>
              </div>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{agent.metrics.avgResponseTime}ms</span>
                  <span className={styles.statLabel}>Avg Response</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{(agent.metrics.successRate * 100).toFixed(0)}%</span>
                  <span className={styles.statLabel}>Success Rate</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {agents.length === 0 && (
        <div className={styles.empty}>
          <p>No agents found matching the selected filters.</p>
        </div>
      )}
    </div>
  );
}
