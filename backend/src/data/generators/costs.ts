import { faker } from '@faker-js/faker';
import type { CostRecord, AgentCategory } from '../../types/index.js';
import { agents } from './agents.js';
import { dailyMetrics } from './metrics.js';

faker.seed(12348);

// Pricing per 1K tokens
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
};

let costRecords: CostRecord[] = [];

export function initCosts(): void {
  costRecords = [];

  // Create cost records from daily metrics
  for (const metric of dailyMetrics) {
    const agent = agents.find(a => a.id === metric.agentId);
    if (!agent) continue;

    const pricing = PRICING[agent.model] || PRICING['gpt-4o-mini'];
    const inputCost = (metric.totalTokensInput / 1000) * pricing.input;
    const outputCost = (metric.totalTokensOutput / 1000) * pricing.output;

    costRecords.push({
      id: faker.string.uuid(),
      agentId: metric.agentId,
      date: metric.date,
      inputTokens: metric.totalTokensInput,
      outputTokens: metric.totalTokensOutput,
      totalCost: Number((inputCost + outputCost).toFixed(4)),
      model: agent.model
    });
  }
}

export function getCostsByAgent(agentId: string): CostRecord[] {
  return costRecords
    .filter(c => c.agentId === agentId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getCostsByCategory(category: AgentCategory): CostRecord[] {
  const categoryAgentIds = agents
    .filter(a => a.category === category)
    .map(a => a.id);

  return costRecords.filter(c => categoryAgentIds.includes(c.agentId));
}

export function getCostSummary(): {
  totalCost: number;
  costByModel: Record<string, number>;
  costByAgent: { agentId: string; agentName: string; category: AgentCategory; totalCost: number }[];
  costByCategory: Record<AgentCategory, number>;
  dailyCosts: { date: string; cost: number }[];
} {
  const totalCost = costRecords.reduce((sum, c) => sum + c.totalCost, 0);

  const costByModel: Record<string, number> = {};
  for (const record of costRecords) {
    costByModel[record.model] = (costByModel[record.model] || 0) + record.totalCost;
  }

  const costByAgentMap: Map<string, number> = new Map();
  for (const record of costRecords) {
    costByAgentMap.set(
      record.agentId,
      (costByAgentMap.get(record.agentId) || 0) + record.totalCost
    );
  }

  const costByAgent = Array.from(costByAgentMap.entries())
    .map(([agentId, cost]) => {
      const agent = agents.find(a => a.id === agentId);
      return {
        agentId,
        agentName: agent?.name || 'Unknown',
        category: agent?.category || 'inventory-intelligence' as AgentCategory,
        totalCost: Number(cost.toFixed(2))
      };
    })
    .sort((a, b) => b.totalCost - a.totalCost);

  // Cost by category
  const categories: AgentCategory[] = [
    'inventory-intelligence',
    'pricing-promotions',
    'store-operations',
    'customer-service-returns',
    'executive-insights',
  ];

  const costByCategory: Record<AgentCategory, number> = {} as Record<AgentCategory, number>;
  for (const category of categories) {
    const categoryCosts = getCostsByCategory(category);
    costByCategory[category] = Number(
      categoryCosts.reduce((sum, c) => sum + c.totalCost, 0).toFixed(2)
    );
  }

  const dailyCostsMap: Map<string, number> = new Map();
  for (const record of costRecords) {
    const dateStr = record.date.toISOString().split('T')[0];
    dailyCostsMap.set(dateStr, (dailyCostsMap.get(dateStr) || 0) + record.totalCost);
  }

  const dailyCosts = Array.from(dailyCostsMap.entries())
    .map(([date, cost]) => ({ date, cost: Number(cost.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCost: Number(totalCost.toFixed(2)),
    costByModel: Object.fromEntries(
      Object.entries(costByModel).map(([k, v]) => [k, Number(v.toFixed(2))])
    ),
    costByAgent,
    costByCategory,
    dailyCosts
  };
}

export function getCostSummaryByCategory(category: AgentCategory): {
  totalCost: number;
  costByAgent: { agentId: string; agentName: string; totalCost: number }[];
  dailyCosts: { date: string; cost: number }[];
} {
  const categoryCosts = getCostsByCategory(category);
  const totalCost = categoryCosts.reduce((sum, c) => sum + c.totalCost, 0);

  const costByAgentMap: Map<string, number> = new Map();
  for (const record of categoryCosts) {
    costByAgentMap.set(
      record.agentId,
      (costByAgentMap.get(record.agentId) || 0) + record.totalCost
    );
  }

  const costByAgent = Array.from(costByAgentMap.entries())
    .map(([agentId, cost]) => {
      const agent = agents.find(a => a.id === agentId);
      return {
        agentId,
        agentName: agent?.name || 'Unknown',
        totalCost: Number(cost.toFixed(2))
      };
    })
    .sort((a, b) => b.totalCost - a.totalCost);

  const dailyCostsMap: Map<string, number> = new Map();
  for (const record of categoryCosts) {
    const dateStr = record.date.toISOString().split('T')[0];
    dailyCostsMap.set(dateStr, (dailyCostsMap.get(dateStr) || 0) + record.totalCost);
  }

  const dailyCosts = Array.from(dailyCostsMap.entries())
    .map(([date, cost]) => ({ date, cost: Number(cost.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCost: Number(totalCost.toFixed(2)),
    costByAgent,
    dailyCosts
  };
}

export { costRecords };
