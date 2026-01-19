import { faker } from '@faker-js/faker';
import type { DailyMetrics, AgentCategory } from '../../types/index.js';
import { agents } from './agents.js';

faker.seed(12347);

const DAYS_OF_HISTORY = 30;

// Category-based conversation volume multipliers
const categoryVolumeMultipliers: Record<AgentCategory, number> = {
  'customer-service-returns': 2.5,  // High volume - customer facing
  'store-operations': 1.5,          // Moderate volume
  'inventory-intelligence': 1.2,     // Regular automated checks
  'pricing-promotions': 0.8,         // Lower volume - strategic
  'executive-insights': 0.3,         // Low volume - summary/strategic
};

function generateDailyMetrics(agentId: string, date: Date, model: string, category: AgentCategory): DailyMetrics {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const volumeMultiplier = categoryVolumeMultipliers[category];

  // Base conversations adjusted by category
  const baseConversations = faker.number.int({ min: 15, max: 80 });
  let conversations = Math.floor(baseConversations * volumeMultiplier);

  // Weekend reduction (less for operations, more for customer service)
  if (isWeekend) {
    const weekendFactor = category === 'customer-service-returns' ? 0.7 :
                          category === 'store-operations' ? 0.5 :
                          category === 'executive-insights' ? 0.1 : 0.4;
    conversations = Math.floor(conversations * weekendFactor);
  }

  // More expensive models tend to have better metrics
  const isGpt4 = model === 'gpt-4o';
  const isGpt4Mini = model === 'gpt-4o-mini';

  // Success rate influenced by model and category
  const baseSuccessRate = isGpt4 ? 0.95 : isGpt4Mini ? 0.92 : 0.88;
  const categoryBonus = category === 'executive-insights' ? 0.02 :
                        category === 'inventory-intelligence' ? 0.01 : 0;

  // Response time varies by category (executive summaries take longer)
  const baseResponseTime = category === 'executive-insights' ? 2000 :
                           category === 'pricing-promotions' ? 1500 :
                           category === 'customer-service-returns' ? 1000 : 1200;

  const avgInputTokens = faker.number.int({ min: 100, max: 300 });
  const avgOutputTokens = faker.number.int({ min: 150, max: 450 });

  return {
    id: faker.string.uuid(),
    agentId,
    date,
    conversations: Math.max(1, conversations),
    avgResponseTime: faker.number.int({
      min: baseResponseTime - 300,
      max: baseResponseTime + 500
    }),
    successRate: faker.number.float({
      min: Math.max(0.85, baseSuccessRate + categoryBonus - 0.03),
      max: Math.min(0.99, baseSuccessRate + categoryBonus + 0.03),
      fractionDigits: 2
    }),
    totalTokensInput: conversations * avgInputTokens,
    totalTokensOutput: conversations * avgOutputTokens
  };
}

// Generate metrics for all agents for past 30 days
let dailyMetrics: DailyMetrics[] = [];

export function initMetrics(): void {
  const today = new Date();
  dailyMetrics = [];

  for (const agent of agents) {
    for (let i = 0; i < DAYS_OF_HISTORY; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      dailyMetrics.push(generateDailyMetrics(agent.id, date, agent.model, agent.category));
    }
  }
}

export function getMetricsByAgent(agentId: string): DailyMetrics[] {
  return dailyMetrics
    .filter(m => m.agentId === agentId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getMetricsForDate(date: Date): DailyMetrics[] {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return dailyMetrics.filter(m => {
    const metricDate = new Date(m.date);
    metricDate.setHours(0, 0, 0, 0);
    return metricDate.getTime() === targetDate.getTime();
  });
}

export function getMetricsByCategory(category: AgentCategory): DailyMetrics[] {
  const categoryAgentIds = agents
    .filter(a => a.category === category)
    .map(a => a.id);

  return dailyMetrics.filter(m => categoryAgentIds.includes(m.agentId));
}

export function getAggregateMetrics(): {
  totalConversations: number;
  avgResponseTime: number;
  avgSuccessRate: number;
  totalTokens: number;
} {
  const totals = dailyMetrics.reduce(
    (acc, m) => ({
      conversations: acc.conversations + m.conversations,
      responseTime: acc.responseTime + m.avgResponseTime,
      successRate: acc.successRate + m.successRate,
      tokens: acc.tokens + m.totalTokensInput + m.totalTokensOutput
    }),
    { conversations: 0, responseTime: 0, successRate: 0, tokens: 0 }
  );

  return {
    totalConversations: totals.conversations,
    avgResponseTime: Math.round(totals.responseTime / dailyMetrics.length),
    avgSuccessRate: Number((totals.successRate / dailyMetrics.length).toFixed(2)),
    totalTokens: totals.tokens
  };
}

export function getAggregateMetricsByCategory(): Record<AgentCategory, {
  totalConversations: number;
  avgResponseTime: number;
  avgSuccessRate: number;
  agentCount: number;
}> {
  const categories: AgentCategory[] = [
    'inventory-intelligence',
    'pricing-promotions',
    'store-operations',
    'customer-service-returns',
    'executive-insights',
  ];

  const result: Record<AgentCategory, {
    totalConversations: number;
    avgResponseTime: number;
    avgSuccessRate: number;
    agentCount: number;
  }> = {} as any;

  for (const category of categories) {
    const categoryMetrics = getMetricsByCategory(category);
    const agentCount = agents.filter(a => a.category === category).length;

    if (categoryMetrics.length === 0) {
      result[category] = {
        totalConversations: 0,
        avgResponseTime: 0,
        avgSuccessRate: 0,
        agentCount,
      };
      continue;
    }

    const totals = categoryMetrics.reduce(
      (acc, m) => ({
        conversations: acc.conversations + m.conversations,
        responseTime: acc.responseTime + m.avgResponseTime,
        successRate: acc.successRate + m.successRate,
      }),
      { conversations: 0, responseTime: 0, successRate: 0 }
    );

    result[category] = {
      totalConversations: totals.conversations,
      avgResponseTime: Math.round(totals.responseTime / categoryMetrics.length),
      avgSuccessRate: Number((totals.successRate / categoryMetrics.length).toFixed(2)),
      agentCount,
    };
  }

  return result;
}

export function getTimeSeriesMetrics(days: number = 30): {
  date: string;
  conversations: number;
  avgResponseTime: number;
  successRate: number;
}[] {
  const today = new Date();
  const result: Map<string, { conversations: number; responseTime: number; successRate: number; count: number }> = new Map();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.set(dateStr, { conversations: 0, responseTime: 0, successRate: 0, count: 0 });
  }

  for (const m of dailyMetrics) {
    const dateStr = m.date.toISOString().split('T')[0];
    const entry = result.get(dateStr);
    if (entry) {
      entry.conversations += m.conversations;
      entry.responseTime += m.avgResponseTime;
      entry.successRate += m.successRate;
      entry.count += 1;
    }
  }

  return Array.from(result.entries())
    .map(([date, data]) => ({
      date,
      conversations: data.conversations,
      avgResponseTime: data.count > 0 ? Math.round(data.responseTime / data.count) : 0,
      successRate: data.count > 0 ? Number((data.successRate / data.count).toFixed(2)) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTimeSeriesMetricsByCategory(category: AgentCategory, days: number = 30): {
  date: string;
  conversations: number;
  avgResponseTime: number;
  successRate: number;
}[] {
  const categoryAgentIds = agents
    .filter(a => a.category === category)
    .map(a => a.id);

  const today = new Date();
  const result: Map<string, { conversations: number; responseTime: number; successRate: number; count: number }> = new Map();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.set(dateStr, { conversations: 0, responseTime: 0, successRate: 0, count: 0 });
  }

  for (const m of dailyMetrics) {
    if (!categoryAgentIds.includes(m.agentId)) continue;

    const dateStr = m.date.toISOString().split('T')[0];
    const entry = result.get(dateStr);
    if (entry) {
      entry.conversations += m.conversations;
      entry.responseTime += m.avgResponseTime;
      entry.successRate += m.successRate;
      entry.count += 1;
    }
  }

  return Array.from(result.entries())
    .map(([date, data]) => ({
      date,
      conversations: data.conversations,
      avgResponseTime: data.count > 0 ? Math.round(data.responseTime / data.count) : 0,
      successRate: data.count > 0 ? Number((data.successRate / data.count).toFixed(2)) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export { dailyMetrics };
