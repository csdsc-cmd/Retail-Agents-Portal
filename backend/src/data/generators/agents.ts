import { faker } from '@faker-js/faker';
import type {
  Agent,
  AgentStatus,
  AgentCategory,
  TransactionPricing,
  SavingsBreakdown,
  PlatformDeployment,
  D365Platform
} from '../../types/index.js';

// Seed for reproducible data
faker.seed(12345);

const MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];

// Retail-specific agent definitions by category (5 categories, no loss prevention)
interface AgentDefinition {
  name: string;
  description: string;
  systemPrompt: string;
  category: AgentCategory;
  preferredModel?: string;
  // New ROI and pricing fields
  roiMetric: string;
  costPerTransaction: number;
  savingsPerTransaction: number;
  avgTransactionsPerDay: number;
  primaryPlatform: D365Platform;
  additionalPlatforms: D365Platform[];
}

const AGENT_DEFINITIONS: AgentDefinition[] = [
  // Inventory Intelligence (5 agents)
  {
    name: 'Stock Level Monitor',
    description: 'Real-time inventory tracking across all store locations with automatic reorder triggers and low-stock alerts.',
    systemPrompt: 'You monitor inventory levels across all retail locations, alerting when stock falls below thresholds and triggering automatic reorder recommendations.',
    category: 'inventory-intelligence',
    preferredModel: 'gpt-4o',
    roiMetric: '35% stockout reduction',
    costPerTransaction: 0.12,
    savingsPerTransaction: 4.50,
    avgTransactionsPerDay: 450,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Shelf Gap Detector',
    description: 'Computer vision-powered shelf monitoring to identify out-of-stock conditions and planogram compliance issues.',
    systemPrompt: 'You analyze shelf images to identify gaps, out-of-stock items, and planogram deviations, prioritizing restocking needs.',
    category: 'inventory-intelligence',
    preferredModel: 'gpt-4o',
    roiMetric: '28% faster restocking',
    costPerTransaction: 0.18,
    savingsPerTransaction: 3.20,
    avgTransactionsPerDay: 280,
    primaryPlatform: 'finops',
    additionalPlatforms: [],
  },
  {
    name: 'Inventory Reconciliation Agent',
    description: 'Compares system inventory against physical counts and flags discrepancies for investigation.',
    systemPrompt: 'You reconcile inventory counts between POS systems, warehouse management, and physical audits, flagging discrepancies that exceed variance thresholds.',
    category: 'inventory-intelligence',
    preferredModel: 'gpt-4o',
    roiMetric: '92% variance detection',
    costPerTransaction: 0.25,
    savingsPerTransaction: 12.80,
    avgTransactionsPerDay: 120,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Demand Forecaster',
    description: 'ML-based demand prediction for seasonal and promotional inventory planning across all product categories.',
    systemPrompt: 'You forecast product demand using historical sales, seasonal patterns, promotional calendars, and external factors to optimize inventory planning.',
    category: 'inventory-intelligence',
    preferredModel: 'gpt-4o',
    roiMetric: '24% improved forecast accuracy',
    costPerTransaction: 0.35,
    savingsPerTransaction: 18.50,
    avgTransactionsPerDay: 85,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Warehouse Sync Agent',
    description: 'Coordinates inventory data between stores, warehouses, and distribution centers for optimal stock allocation.',
    systemPrompt: 'You synchronize inventory across the supply chain, coordinating transfers between warehouses and stores to minimize stockouts and overstock.',
    category: 'inventory-intelligence',
    preferredModel: 'gpt-4o-mini',
    roiMetric: '18% reduced carrying costs',
    costPerTransaction: 0.08,
    savingsPerTransaction: 2.40,
    avgTransactionsPerDay: 380,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },

  // Pricing and Promotions (4 agents)
  {
    name: 'Price Optimization Engine',
    description: 'Dynamic pricing recommendations based on competitor data, demand signals, and margin targets.',
    systemPrompt: 'You analyze market conditions, competitor pricing, and demand elasticity to recommend optimal price points that maximize revenue and margins.',
    category: 'pricing-promotions',
    preferredModel: 'gpt-4o',
    roiMetric: '$24K margin protected/month',
    costPerTransaction: 0.45,
    savingsPerTransaction: 32.00,
    avgTransactionsPerDay: 150,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Promotion Performance Tracker',
    description: 'Real-time ROI analysis for active promotional campaigns with recommendations for optimization.',
    systemPrompt: 'You track promotional campaign performance, measuring lift, cannibalization, and ROI to provide optimization recommendations.',
    category: 'pricing-promotions',
    preferredModel: 'gpt-4o-mini',
    roiMetric: '15% improved promo ROI',
    costPerTransaction: 0.15,
    savingsPerTransaction: 8.50,
    avgTransactionsPerDay: 220,
    primaryPlatform: 'finops',
    additionalPlatforms: ['crm'],
  },
  {
    name: 'Markdown Advisor',
    description: 'Suggests optimal markdown timing and depth for aging inventory to maximize recovery while clearing stock.',
    systemPrompt: 'You analyze inventory age, sell-through rates, and margin targets to recommend optimal markdown strategies for clearing aging stock.',
    category: 'pricing-promotions',
    preferredModel: 'gpt-4o-mini',
    roiMetric: '22% better markdown recovery',
    costPerTransaction: 0.20,
    savingsPerTransaction: 14.20,
    avgTransactionsPerDay: 95,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Competitor Price Monitor',
    description: 'Tracks competitor pricing across key categories and alerts on significant price changes requiring response.',
    systemPrompt: 'You monitor competitor pricing, identify meaningful price movements, and alert when competitive response may be needed.',
    category: 'pricing-promotions',
    preferredModel: 'gpt-3.5-turbo',
    roiMetric: '4hr faster price response',
    costPerTransaction: 0.05,
    savingsPerTransaction: 1.80,
    avgTransactionsPerDay: 650,
    primaryPlatform: 'finops',
    additionalPlatforms: [],
  },

  // Store Operations (4 agents)
  {
    name: 'Staff Scheduling Optimizer',
    description: 'Creates optimal shift schedules based on predicted foot traffic, sales patterns, and labor budget constraints.',
    systemPrompt: 'You optimize staff schedules based on traffic forecasts, sales patterns, employee availability, and labor cost targets.',
    category: 'store-operations',
    preferredModel: 'gpt-4o',
    roiMetric: '98% task compliance',
    costPerTransaction: 0.30,
    savingsPerTransaction: 22.50,
    avgTransactionsPerDay: 45,
    primaryPlatform: 'finops',
    additionalPlatforms: ['crm'],
  },
  {
    name: 'Queue Management Agent',
    description: 'Monitors checkout wait times and triggers alerts to open additional registers during peak periods.',
    systemPrompt: 'You monitor queue lengths and wait times, alerting managers when additional checkout capacity is needed to maintain service levels.',
    category: 'store-operations',
    preferredModel: 'gpt-3.5-turbo',
    roiMetric: '35% reduced wait times',
    costPerTransaction: 0.04,
    savingsPerTransaction: 0.85,
    avgTransactionsPerDay: 1200,
    primaryPlatform: 'finops',
    additionalPlatforms: [],
  },
  {
    name: 'Store Compliance Checker',
    description: 'Audits store operations against company policies, safety regulations, and brand standards.',
    systemPrompt: 'You audit store operations for compliance with policies, safety standards, and brand guidelines, flagging violations for correction.',
    category: 'store-operations',
    preferredModel: 'gpt-4o-mini',
    roiMetric: '94% compliance rate',
    costPerTransaction: 0.22,
    savingsPerTransaction: 15.00,
    avgTransactionsPerDay: 180,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Maintenance Alert System',
    description: 'Tracks equipment status, schedules preventive maintenance, and escalates critical repair needs.',
    systemPrompt: 'You monitor store equipment health, schedule preventive maintenance, and escalate urgent repair needs to minimize downtime.',
    category: 'store-operations',
    preferredModel: 'gpt-3.5-turbo',
    roiMetric: '45% less equipment downtime',
    costPerTransaction: 0.08,
    savingsPerTransaction: 28.00,
    avgTransactionsPerDay: 35,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },

  // Customer Service and Returns (4 agents)
  {
    name: 'Customer Inquiry Handler',
    description: 'First-line support for product questions, store hours, stock availability, and general inquiries.',
    systemPrompt: 'You handle customer inquiries about products, store information, and general questions with friendly, helpful responses.',
    category: 'customer-service-returns',
    preferredModel: 'gpt-4o',
    roiMetric: '60% faster resolution',
    costPerTransaction: 0.15,
    savingsPerTransaction: 8.50,
    avgTransactionsPerDay: 850,
    primaryPlatform: 'crm',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Returns Processing Agent',
    description: 'Validates return eligibility against policy, processes refund requests, and identifies return patterns.',
    systemPrompt: 'You process return requests, validate eligibility against return policy, calculate refunds, and identify patterns in return behavior.',
    category: 'customer-service-returns',
    preferredModel: 'gpt-4o-mini',
    roiMetric: '42% faster returns',
    costPerTransaction: 0.18,
    savingsPerTransaction: 6.20,
    avgTransactionsPerDay: 320,
    primaryPlatform: 'crm',
    additionalPlatforms: ['finops'],
  },
  {
    name: 'Customer Feedback Analyzer',
    description: 'Aggregates and categorizes customer feedback from all channels for actionable insights.',
    systemPrompt: 'You analyze customer feedback from surveys, reviews, and support interactions to identify trends and improvement opportunities.',
    category: 'customer-service-returns',
    preferredModel: 'gpt-4o',
    roiMetric: '85% sentiment coverage',
    costPerTransaction: 0.25,
    savingsPerTransaction: 4.80,
    avgTransactionsPerDay: 480,
    primaryPlatform: 'crm',
    additionalPlatforms: [],
  },
  {
    name: 'Loyalty Program Manager',
    description: 'Handles points queries, tier upgrades, personalized offers, and member benefit inquiries.',
    systemPrompt: 'You manage loyalty program interactions, answering points questions, processing tier changes, and delivering personalized offers.',
    category: 'customer-service-returns',
    preferredModel: 'gpt-4o-mini',
    roiMetric: '28% higher engagement',
    costPerTransaction: 0.10,
    savingsPerTransaction: 3.50,
    avgTransactionsPerDay: 580,
    primaryPlatform: 'crm',
    additionalPlatforms: ['business-central'],
  },

  // Executive Insights (4 agents)
  {
    name: 'Daily Business Summary',
    description: 'Compiles key metrics into executive-ready morning briefings with highlights and action items.',
    systemPrompt: 'You compile daily business summaries with key metrics, notable events, and recommended actions for executive review.',
    category: 'executive-insights',
    preferredModel: 'gpt-4o',
    roiMetric: '80% less analyst time',
    costPerTransaction: 0.55,
    savingsPerTransaction: 125.00,
    avgTransactionsPerDay: 12,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central', 'crm'],
  },
  {
    name: 'Cross-Store Performance Comparator',
    description: 'Benchmarks store performance across KPIs and identifies best practices for replication.',
    systemPrompt: 'You compare store performance across key metrics, identifying top performers and practices that should be replicated.',
    category: 'executive-insights',
    preferredModel: 'gpt-4o',
    roiMetric: '15% performance uplift',
    costPerTransaction: 0.40,
    savingsPerTransaction: 85.00,
    avgTransactionsPerDay: 25,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
  {
    name: 'Strategic Alert Coordinator',
    description: 'Escalates critical issues requiring executive attention with context and recommended responses.',
    systemPrompt: 'You identify critical business issues requiring executive attention, providing context and recommended response options.',
    category: 'executive-insights',
    preferredModel: 'gpt-4o',
    roiMetric: '2hr faster escalation',
    costPerTransaction: 0.35,
    savingsPerTransaction: 450.00,
    avgTransactionsPerDay: 8,
    primaryPlatform: 'finops',
    additionalPlatforms: ['crm'],
  },
  {
    name: 'Financial Health Monitor',
    description: 'Tracks revenue, margins, and cost metrics against targets with variance analysis and trend alerts.',
    systemPrompt: 'You monitor financial performance against targets, alerting on significant variances and providing trend analysis.',
    category: 'executive-insights',
    preferredModel: 'gpt-4o',
    roiMetric: '12% better margin visibility',
    costPerTransaction: 0.48,
    savingsPerTransaction: 180.00,
    avgTransactionsPerDay: 18,
    primaryPlatform: 'finops',
    additionalPlatforms: ['business-central'],
  },
];

function calculateSavings(pricing: TransactionPricing): SavingsBreakdown {
  const netSavingsPerTransaction = pricing.savingsPerTransaction - pricing.costPerTransaction;
  const dailySavings = netSavingsPerTransaction * pricing.avgTransactionsPerDay;

  return {
    daily: Math.round(dailySavings * 100) / 100,
    weekly: Math.round(dailySavings * 7 * 100) / 100,
    monthly: Math.round(dailySavings * 30 * 100) / 100,
    yearly: Math.round(dailySavings * 365 * 100) / 100,
  };
}

function generatePlatformDeployments(
  primaryPlatform: D365Platform,
  additionalPlatforms: D365Platform[],
  avgTransactionsPerDay: number
): PlatformDeployment[] {
  const deployments: PlatformDeployment[] = [];
  const allPlatforms: D365Platform[] = ['finops', 'crm', 'business-central'];

  for (const platform of allPlatforms) {
    const isPrimary = platform === primaryPlatform;
    const isAdditional = additionalPlatforms.includes(platform);
    const isDeployed = isPrimary || isAdditional;

    deployments.push({
      platform,
      isDeployed,
      deployedAt: isDeployed ? faker.date.past({ years: 1 }) : undefined,
      transactionCount: isDeployed
        ? Math.floor(avgTransactionsPerDay * (isPrimary ? 0.7 : 0.3 / additionalPlatforms.length) * faker.number.int({ min: 25, max: 35 }))
        : undefined,
    });
  }

  return deployments;
}

function generateAgent(definition: AgentDefinition, index: number): Agent {
  const createdAt = faker.date.past({ years: 1 });

  // Weight status - executive insights more likely active
  const statusWeights = definition.category === 'executive-insights'
    ? [{ value: 'active' as AgentStatus, weight: 9 }, { value: 'inactive' as AgentStatus, weight: 1 }]
    : [{ value: 'active' as AgentStatus, weight: 7 }, { value: 'inactive' as AgentStatus, weight: 2 }, { value: 'error' as AgentStatus, weight: 1 }];

  const status = faker.helpers.weightedArrayElement(statusWeights);

  const lastActiveAt = status === 'active'
    ? faker.date.recent({ days: 1 })
    : status === 'inactive'
      ? faker.date.recent({ days: 30 })
      : faker.date.recent({ days: 7 });

  const model = definition.preferredModel || faker.helpers.arrayElement(MODELS);

  // Metrics vary by category
  const baseConversations = definition.category === 'customer-service-returns' ? 2000 :
                            definition.category === 'executive-insights' ? 100 : 800;

  const conversationVariance = faker.number.int({ min: -300, max: 500 });

  const pricing: TransactionPricing = {
    costPerTransaction: definition.costPerTransaction,
    savingsPerTransaction: definition.savingsPerTransaction,
    avgTransactionsPerDay: definition.avgTransactionsPerDay,
  };

  const savings = calculateSavings(pricing);
  const platforms = generatePlatformDeployments(
    definition.primaryPlatform,
    definition.additionalPlatforms,
    definition.avgTransactionsPerDay
  );

  return {
    id: faker.string.uuid(),
    name: definition.name,
    description: definition.description,
    model,
    status,
    category: definition.category,
    createdAt,
    lastActiveAt,
    config: {
      temperature: faker.number.float({ min: 0.3, max: 0.8, fractionDigits: 1 }),
      maxTokens: faker.helpers.arrayElement([2048, 4096, 8192]),
      systemPrompt: definition.systemPrompt,
    },
    metrics: {
      totalConversations: Math.max(50, baseConversations + conversationVariance),
      avgResponseTime: faker.number.int({ min: 800, max: 2500 }),
      successRate: faker.number.float({ min: 0.88, max: 0.99, fractionDigits: 2 }),
    },
    pricing,
    savings,
    platforms,
    roiMetric: definition.roiMetric,
  };
}

// Generate and cache agents (21 agents across 5 categories)
const agents: Agent[] = AGENT_DEFINITIONS.map((def, i) => generateAgent(def, i));

export function getAgents(filters?: { status?: string; category?: string; platform?: D365Platform }): Agent[] {
  let filtered = agents;

  if (filters?.status) {
    filtered = filtered.filter(a => a.status === filters.status);
  }

  if (filters?.category) {
    filtered = filtered.filter(a => a.category === filters.category);
  }

  if (filters?.platform) {
    filtered = filtered.filter(a =>
      a.platforms.some(p => p.platform === filters.platform && p.isDeployed)
    );
  }

  return filtered;
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getAgentIds(): string[] {
  return agents.map(a => a.id);
}

export function getAgentsByCategory(category: AgentCategory): Agent[] {
  return agents.filter(a => a.category === category);
}

export function getAgentsByPlatform(platform: D365Platform): Agent[] {
  return agents.filter(a => a.platforms.some(p => p.platform === platform && p.isDeployed));
}

export function getAgentCategories(): { category: AgentCategory; count: number; agents: Agent[] }[] {
  const categories: AgentCategory[] = [
    'inventory-intelligence',
    'pricing-promotions',
    'store-operations',
    'customer-service-returns',
    'executive-insights',
  ];

  return categories.map(category => ({
    category,
    count: agents.filter(a => a.category === category).length,
    agents: agents.filter(a => a.category === category),
  }));
}

// Get total savings across all agents
export function getTotalSavings(): SavingsBreakdown {
  return agents.reduce((total, agent) => ({
    daily: total.daily + agent.savings.daily,
    weekly: total.weekly + agent.savings.weekly,
    monthly: total.monthly + agent.savings.monthly,
    yearly: total.yearly + agent.savings.yearly,
  }), { daily: 0, weekly: 0, monthly: 0, yearly: 0 });
}

// Get savings by category
export function getSavingsByCategory(): Record<AgentCategory, SavingsBreakdown> {
  const categories: AgentCategory[] = [
    'inventory-intelligence',
    'pricing-promotions',
    'store-operations',
    'customer-service-returns',
    'executive-insights',
  ];

  const result: Record<string, SavingsBreakdown> = {};

  for (const category of categories) {
    const categoryAgents = agents.filter(a => a.category === category);
    result[category] = categoryAgents.reduce((total, agent) => ({
      daily: total.daily + agent.savings.daily,
      weekly: total.weekly + agent.savings.weekly,
      monthly: total.monthly + agent.savings.monthly,
      yearly: total.yearly + agent.savings.yearly,
    }), { daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  }

  return result as Record<AgentCategory, SavingsBreakdown>;
}

// Get savings by platform
export function getSavingsByPlatform(): Record<D365Platform, SavingsBreakdown> {
  const platforms: D365Platform[] = ['finops', 'crm', 'business-central'];
  const result: Record<string, SavingsBreakdown> = {};

  for (const platform of platforms) {
    const platformAgents = agents.filter(a =>
      a.platforms.some(p => p.platform === platform && p.isDeployed)
    );
    result[platform] = platformAgents.reduce((total, agent) => ({
      daily: total.daily + agent.savings.daily,
      weekly: total.weekly + agent.savings.weekly,
      monthly: total.monthly + agent.savings.monthly,
      yearly: total.yearly + agent.savings.yearly,
    }), { daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  }

  return result as Record<D365Platform, SavingsBreakdown>;
}

export { agents };
