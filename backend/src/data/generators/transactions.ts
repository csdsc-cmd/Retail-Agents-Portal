import { faker } from '@faker-js/faker';
import type {
  AgentTransactionLog,
  RetailEventType,
  TransactionOutcome,
  D365Platform,
  AgentCategory,
} from '../../types/index.js';
import { agents } from './agents.js';
import { stores } from './stores.js';

// Seed for reproducible data
faker.seed(12350);

// Data sources used by different agent categories
const DATA_SOURCES: Record<AgentCategory, string[]> = {
  'inventory-intelligence': [
    'D365 Inventory Management',
    'Warehouse Management System',
    'POS Transaction History',
    'Supplier Portal Data',
    'Demand Planning Module',
  ],
  'pricing-promotions': [
    'D365 Pricing Engine',
    'Competitor Price Database',
    'Margin Analysis Reports',
    'Promotional Calendar',
    'Sales History Analytics',
  ],
  'store-operations': [
    'D365 Human Resources',
    'Traffic Counter System',
    'Task Management System',
    'Equipment Monitoring IoT',
    'Compliance Audit Database',
  ],
  'customer-service-returns': [
    'D365 CRM Customer Records',
    'Returns Authorization System',
    'Customer Feedback Portal',
    'Loyalty Program Database',
    'Service Ticket History',
  ],
  'executive-insights': [
    'D365 Financial Reporting',
    'Cross-Store Analytics',
    'Executive Dashboard Feeds',
    'KPI Aggregation System',
    'Alert Management Console',
  ],
};

// Business rules by category
const BUSINESS_RULES: Record<AgentCategory, string[]> = {
  'inventory-intelligence': [
    'Reorder when stock < 15% of par level',
    'Priority restocking for high-velocity SKUs',
    'Variance threshold: 2% for audit flagging',
    'Seasonal demand multiplier applied',
    'Safety stock buffer calculation',
  ],
  'pricing-promotions': [
    'Margin floor: 25% minimum maintained',
    'Competitor match within 5% allowed',
    'Promotion cannibalization check required',
    'Markdown cadence: 10% weekly maximum',
    'Price elasticity threshold applied',
  ],
  'store-operations': [
    'Minimum staffing ratio: 1:150 traffic',
    'Queue alert at 5+ minute wait time',
    'Compliance check frequency: daily',
    'Maintenance SLA: 24hr response critical',
    'Labor cost cap: 18% of revenue',
  ],
  'customer-service-returns': [
    'Return window: 30 days with receipt',
    'Refund approval: manager for >$500',
    'Response SLA: 4 hours first contact',
    'Loyalty tier benefits applied automatically',
    'Escalation path defined per issue type',
  ],
  'executive-insights': [
    'Alert threshold: 10% variance from target',
    'Escalation SLA: 2 hours for critical',
    'Daily summary deadline: 7:00 AM',
    'Cross-store comparison: weekly cadence',
    'Financial close reporting: monthly',
  ],
};

// Reasoning patterns by event type
const REASONING_TEMPLATES: Record<RetailEventType, string[]> = {
  'inventory-discrepancy': [
    'Detected variance of {variance}% between system and physical count',
    'Cross-referenced with recent POS transactions for reconciliation',
    'Checked for pending transfers that may explain discrepancy',
    'Validated against supplier delivery records',
    'Flagged for investigation based on materiality threshold',
  ],
  'stockout-alert': [
    'Current stock level at {level}% of par',
    'Analyzed historical demand patterns for forecast',
    'Calculated lead time from preferred supplier',
    'Recommended reorder quantity based on demand forecast',
    'Checked alternative fulfillment options',
  ],
  'price-override': [
    'Analyzed competitor pricing data for {category}',
    'Calculated margin impact of proposed change',
    'Verified against minimum margin requirements',
    'Assessed price elasticity for demand impact',
    'Recommended optimal price point',
  ],
  'promotion-performance': [
    'Measured promotional lift vs. baseline sales',
    'Calculated cannibalization effect on related products',
    'Assessed margin dilution against targets',
    'Compared performance to historical promotions',
    'Generated optimization recommendations',
  ],
  'return-spike': [
    'Detected {percentage}% increase in returns for category',
    'Analyzed return reasons for pattern identification',
    'Cross-referenced with product quality reports',
    'Identified potential process improvement opportunities',
    'Flagged for quality team review',
  ],
  'customer-complaint': [
    'Categorized complaint type: {type}',
    'Matched to customer history for context',
    'Identified root cause from pattern analysis',
    'Generated resolution options based on policy',
    'Calculated customer lifetime value for prioritization',
  ],
  'policy-violation': [
    'Detected deviation from standard operating procedure',
    'Cross-referenced with compliance requirements',
    'Assessed risk level of violation',
    'Generated corrective action recommendation',
    'Scheduled follow-up verification',
  ],
  'executive-escalation': [
    'Aggregated critical alerts from all systems',
    'Prioritized based on business impact',
    'Generated executive summary with key metrics',
    'Recommended response actions with timeline',
    'Prepared stakeholder notification list',
  ],
  'routine-operation': [
    'Executed scheduled operational task',
    'Verified data integrity across systems',
    'Generated standard operational report',
    'Confirmed alignment with expected parameters',
    'Logged completion for audit trail',
  ],
  'demand-forecast': [
    'Analyzed historical sales data for patterns',
    'Applied seasonal adjustment factors',
    'Incorporated promotional calendar impact',
    'Validated against external market signals',
    'Generated confidence intervals for forecast',
  ],
  'margin-optimization': [
    'Calculated current margin performance',
    'Identified margin improvement opportunities',
    'Modeled price/volume trade-offs',
    'Recommended pricing adjustments',
    'Projected financial impact of changes',
  ],
  'staff-scheduling': [
    'Analyzed predicted traffic patterns',
    'Matched staffing to service level requirements',
    'Optimized for labor cost constraints',
    'Balanced employee preferences where possible',
    'Generated schedule with coverage metrics',
  ],
  'customer-resolution': [
    'Retrieved full customer interaction history',
    'Identified issue type and resolution path',
    'Applied loyalty tier benefits and policies',
    'Generated personalized resolution offer',
    'Scheduled follow-up for satisfaction confirmation',
  ],
};

// Decision templates by event type
const DECISION_TEMPLATES: Record<RetailEventType, string[]> = {
  'inventory-discrepancy': [
    'Flag for physical recount and investigation',
    'Adjust system inventory to match physical count',
    'Escalate to loss prevention for review',
    'Schedule audit for affected area',
  ],
  'stockout-alert': [
    'Initiate emergency reorder from primary supplier',
    'Transfer stock from nearby location',
    'Activate alternative supplier',
    'Schedule expedited delivery',
  ],
  'price-override': [
    'Approve price adjustment to ${price}',
    'Recommend price match to competitor',
    'Maintain current pricing based on margin analysis',
    'Implement temporary promotional pricing',
  ],
  'promotion-performance': [
    'Continue promotion with current parameters',
    'Recommend early termination due to poor ROI',
    'Extend promotion based on strong performance',
    'Adjust promotional mechanics for optimization',
  ],
  'return-spike': [
    'Alert quality team for product inspection',
    'Implement enhanced return verification',
    'Generate supplier quality report',
    'Recommend process improvement',
  ],
  'customer-complaint': [
    'Issue refund and courtesy credit',
    'Escalate to supervisor for resolution',
    'Provide product replacement',
    'Schedule callback from specialist team',
  ],
  'policy-violation': [
    'Issue corrective action notification',
    'Schedule retraining for affected staff',
    'Update procedure documentation',
    'Implement additional controls',
  ],
  'executive-escalation': [
    'Notify executive team immediately',
    'Convene emergency response meeting',
    'Activate crisis management protocol',
    'Prepare board notification if required',
  ],
  'routine-operation': [
    'Complete standard operational cycle',
    'Log results and close task',
    'Schedule next occurrence',
    'Generate summary report',
  ],
  'demand-forecast': [
    'Update inventory planning parameters',
    'Adjust safety stock levels',
    'Notify procurement of forecast changes',
    'Revise promotional calendar if needed',
  ],
  'margin-optimization': [
    'Implement recommended price changes',
    'Defer changes pending further analysis',
    'Escalate for management approval',
    'Schedule A/B test for validation',
  ],
  'staff-scheduling': [
    'Publish optimized schedule',
    'Request additional hours approval',
    'Activate on-call staff pool',
    'Adjust service level expectations',
  ],
  'customer-resolution': [
    'Complete resolution and close case',
    'Escalate to specialist team',
    'Issue compensation as authorized',
    'Schedule follow-up interaction',
  ],
};

function generateReasoning(eventType: RetailEventType): string[] {
  const templates = REASONING_TEMPLATES[eventType] || REASONING_TEMPLATES['routine-operation'];
  const count = faker.number.int({ min: 3, max: 5 });
  const selected = faker.helpers.arrayElements(templates, count);

  return selected.map(template =>
    template
      .replace('{variance}', faker.number.float({ min: 2, max: 15, fractionDigits: 1 }).toString())
      .replace('{level}', faker.number.int({ min: 5, max: 20 }).toString())
      .replace('{category}', faker.helpers.arrayElement(['Electronics', 'Apparel', 'Home Goods', 'Groceries']))
      .replace('{percentage}', faker.number.int({ min: 15, max: 45 }).toString())
      .replace('{type}', faker.helpers.arrayElement(['Product Quality', 'Service Issue', 'Delivery Problem', 'Pricing Concern']))
      .replace('{price}', faker.commerce.price({ min: 10, max: 500 }))
  );
}

function generateDecision(eventType: RetailEventType): string {
  const templates = DECISION_TEMPLATES[eventType] || DECISION_TEMPLATES['routine-operation'];
  return faker.helpers.arrayElement(templates);
}

function generateInputData(eventType: RetailEventType): Record<string, unknown> {
  const baseData: Record<string, unknown> = {
    requestId: faker.string.uuid(),
    timestamp: faker.date.recent({ days: 1 }).toISOString(),
    source: faker.helpers.arrayElement(['Automated Trigger', 'Scheduled Task', 'User Request', 'System Alert']),
  };

  switch (eventType) {
    case 'inventory-discrepancy':
      return {
        ...baseData,
        sku: faker.string.alphanumeric(8).toUpperCase(),
        systemQuantity: faker.number.int({ min: 50, max: 200 }),
        physicalCount: faker.number.int({ min: 40, max: 190 }),
        category: faker.commerce.department(),
      };
    case 'stockout-alert':
      return {
        ...baseData,
        sku: faker.string.alphanumeric(8).toUpperCase(),
        currentStock: faker.number.int({ min: 5, max: 30 }),
        parLevel: faker.number.int({ min: 100, max: 200 }),
        dailyDemand: faker.number.int({ min: 10, max: 50 }),
      };
    case 'price-override':
      return {
        ...baseData,
        productId: faker.string.alphanumeric(10),
        currentPrice: parseFloat(faker.commerce.price({ min: 20, max: 200 })),
        competitorPrice: parseFloat(faker.commerce.price({ min: 15, max: 190 })),
        costPrice: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      };
    case 'customer-complaint':
      return {
        ...baseData,
        customerId: faker.string.uuid(),
        orderNumber: `ORD-${faker.string.numeric(8)}`,
        complaintType: faker.helpers.arrayElement(['Quality', 'Service', 'Delivery', 'Price']),
        loyaltyTier: faker.helpers.arrayElement(['Bronze', 'Silver', 'Gold', 'Platinum']),
      };
    default:
      return baseData;
  }
}

// Generate transaction logs for all agents
function generateTransactionLogs(): AgentTransactionLog[] {
  const logs: AgentTransactionLog[] = [];

  for (const agent of agents) {
    // Generate 10-30 recent transactions per agent
    const transactionCount = faker.number.int({ min: 10, max: 30 });

    for (let i = 0; i < transactionCount; i++) {
      const eventType = faker.helpers.arrayElement<RetailEventType>([
        'inventory-discrepancy',
        'stockout-alert',
        'price-override',
        'promotion-performance',
        'customer-complaint',
        'routine-operation',
        'demand-forecast',
        'customer-resolution',
      ]);

      const deployedPlatforms = agent.platforms.filter(p => p.isDeployed);
      const platform = deployedPlatforms.length > 0
        ? faker.helpers.arrayElement(deployedPlatforms).platform
        : 'finops';

      const store = faker.helpers.arrayElement(stores);

      const outcomeWeights = [
        { value: 'success' as TransactionOutcome, weight: 75 },
        { value: 'partial' as TransactionOutcome, weight: 15 },
        { value: 'escalated' as TransactionOutcome, weight: 8 },
        { value: 'failed' as TransactionOutcome, weight: 2 },
      ];
      const outcome = faker.helpers.weightedArrayElement(outcomeWeights);

      const humanOverrideRequired = outcome === 'escalated' || faker.datatype.boolean({ probability: 0.1 });

      logs.push({
        id: faker.string.uuid(),
        agentId: agent.id,
        agentName: agent.name,
        timestamp: faker.date.recent({ days: 7 }),
        transactionType: eventType,
        platform,
        storeId: store.id,
        storeName: store.name,
        inputData: generateInputData(eventType),
        reasoning: generateReasoning(eventType),
        decision: generateDecision(eventType),
        confidenceScore: faker.number.int({ min: 65, max: 98 }),
        outcome,
        costSaved: parseFloat((agent.pricing.savingsPerTransaction * faker.number.float({ min: 0.7, max: 1.3 })).toFixed(2)),
        transactionCost: parseFloat((agent.pricing.costPerTransaction * faker.number.float({ min: 0.9, max: 1.1 })).toFixed(2)),
        dataSourcesUsed: faker.helpers.arrayElements(DATA_SOURCES[agent.category] || DATA_SOURCES['executive-insights'], faker.number.int({ min: 2, max: 4 })),
        rulesApplied: faker.helpers.arrayElements(BUSINESS_RULES[agent.category] || BUSINESS_RULES['executive-insights'], faker.number.int({ min: 1, max: 3 })),
        humanOverrideRequired,
        overrideReason: humanOverrideRequired
          ? faker.helpers.arrayElement([
              'Exceeds automated authorization threshold',
              'Unusual pattern requires human verification',
              'Policy exception requested',
              'Customer escalation pathway',
              'High-value decision requiring approval',
            ])
          : undefined,
      });
    }
  }

  // Sort by timestamp descending (most recent first)
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const transactionLogs = generateTransactionLogs();

export function getTransactionLogs(filters?: {
  agentId?: string;
  platform?: D365Platform;
  outcome?: TransactionOutcome;
  startDate?: Date;
  endDate?: Date;
}): AgentTransactionLog[] {
  let filtered = transactionLogs;

  if (filters?.agentId) {
    filtered = filtered.filter(t => t.agentId === filters.agentId);
  }

  if (filters?.platform) {
    filtered = filtered.filter(t => t.platform === filters.platform);
  }

  if (filters?.outcome) {
    filtered = filtered.filter(t => t.outcome === filters.outcome);
  }

  if (filters?.startDate) {
    filtered = filtered.filter(t => t.timestamp >= filters.startDate!);
  }

  if (filters?.endDate) {
    filtered = filtered.filter(t => t.timestamp <= filters.endDate!);
  }

  return filtered;
}

export function getTransactionById(id: string): AgentTransactionLog | undefined {
  return transactionLogs.find(t => t.id === id);
}

export function getTransactionsByAgent(agentId: string): AgentTransactionLog[] {
  return transactionLogs.filter(t => t.agentId === agentId);
}

export function getTransactionStats(): {
  totalTransactions: number;
  successRate: number;
  totalSavings: number;
  totalCost: number;
  escalationRate: number;
} {
  const total = transactionLogs.length;
  const successful = transactionLogs.filter(t => t.outcome === 'success').length;
  const escalated = transactionLogs.filter(t => t.outcome === 'escalated').length;
  const totalSavings = transactionLogs.reduce((sum, t) => sum + t.costSaved, 0);
  const totalCost = transactionLogs.reduce((sum, t) => sum + t.transactionCost, 0);

  return {
    totalTransactions: total,
    successRate: Math.round((successful / total) * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    escalationRate: Math.round((escalated / total) * 100) / 100,
  };
}

export { transactionLogs };
