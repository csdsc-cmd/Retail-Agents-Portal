import { faker } from '@faker-js/faker';
import type {
  Conversation,
  Sentiment,
  ConversationStatus,
  BusinessContext,
  RetailEventType,
  EventSeverity,
  AgentCategory,
} from '../../types/index.js';
import { agents, getAgentIds } from './agents.js';
import { stores, getRandomStore } from './stores.js';
import { incidents } from './incidents.js';

faker.seed(12346); // Different seed for variety

// Map agent categories to likely event types (5 categories, no loss-prevention)
const categoryEventTypes: Record<AgentCategory, RetailEventType[]> = {
  'inventory-intelligence': ['stockout-alert', 'inventory-discrepancy', 'demand-forecast', 'routine-operation'],
  'pricing-promotions': ['price-override', 'promotion-performance', 'margin-optimization', 'routine-operation'],
  'store-operations': ['policy-violation', 'staff-scheduling', 'routine-operation'],
  'customer-service-returns': ['return-spike', 'customer-complaint', 'customer-resolution', 'routine-operation'],
  'executive-insights': ['executive-escalation', 'routine-operation'],
};

// Map event types to likely severities (no theft-detection)
const eventSeverities: Record<RetailEventType, EventSeverity[]> = {
  'inventory-discrepancy': ['high', 'medium'],
  'price-override': ['low', 'info'],
  'return-spike': ['medium', 'high'],
  'stockout-alert': ['medium', 'high'],
  'customer-complaint': ['medium', 'low'],
  'promotion-performance': ['medium', 'low', 'info'],
  'policy-violation': ['high', 'medium'],
  'executive-escalation': ['critical', 'high'],
  'routine-operation': ['info', 'low'],
  'demand-forecast': ['medium', 'low', 'info'],
  'margin-optimization': ['medium', 'low'],
  'staff-scheduling': ['low', 'info'],
  'customer-resolution': ['medium', 'low', 'info'],
};

function generateBusinessContext(agentId: string): BusinessContext | undefined {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return undefined;

  const store = getRandomStore();
  const eventTypes = categoryEventTypes[agent.category];
  const eventType = faker.helpers.arrayElement(eventTypes);
  const severities = eventSeverities[eventType];
  const severity = faker.helpers.arrayElement(severities);

  // Link some conversations to incidents (especially for incident-related agents)
  let incidentId: string | undefined;
  let relatedAgentIds: string[] | undefined;

  // Check if this agent is involved in any incidents
  const relatedIncidents = incidents.filter(i => i.relatedAgentIds.includes(agentId));
  if (relatedIncidents.length > 0 && faker.datatype.boolean({ probability: 0.3 })) {
    const incident = faker.helpers.arrayElement(relatedIncidents);
    incidentId = incident.id;
    // Get other agents involved in this incident
    relatedAgentIds = incident.relatedAgentIds.filter(id => id !== agentId).slice(0, 3);
  }

  return {
    storeId: store.id,
    storeName: store.name,
    eventType,
    severity,
    incidentId,
    relatedAgentIds,
  };
}

function generateConversation(agentIds: string[]): Conversation {
  const startedAt = faker.date.recent({ days: 30 });
  const isActive = faker.datatype.boolean({ probability: 0.05 });
  const agentId = faker.helpers.arrayElement(agentIds);

  // Get business context for this agent
  const businessContext = generateBusinessContext(agentId);

  // Adjust sentiment based on event type
  let sentimentWeights = [
    { value: 'positive' as Sentiment, weight: 6 },
    { value: 'neutral' as Sentiment, weight: 3 },
    { value: 'negative' as Sentiment, weight: 1 },
  ];

  if (businessContext) {
    // Incident-related conversations tend to be more negative/neutral
    if (businessContext.incidentId) {
      sentimentWeights = [
        { value: 'positive' as Sentiment, weight: 2 },
        { value: 'neutral' as Sentiment, weight: 5 },
        { value: 'negative' as Sentiment, weight: 3 },
      ];
    }
    // High-severity events also tend more negative
    else if (businessContext.severity === 'critical' || businessContext.severity === 'high') {
      sentimentWeights = [
        { value: 'positive' as Sentiment, weight: 3 },
        { value: 'neutral' as Sentiment, weight: 4 },
        { value: 'negative' as Sentiment, weight: 3 },
      ];
    }
  }

  const status: ConversationStatus = isActive
    ? 'active'
    : faker.helpers.weightedArrayElement([
        { value: 'completed', weight: 9 },
        { value: 'failed', weight: 1 },
      ]);

  const endedAt = status === 'active'
    ? null
    : faker.date.between({ from: startedAt, to: new Date() });

  const messageCount = faker.number.int({ min: 4, max: 30 });
  const avgTokensPerMessage = faker.number.int({ min: 50, max: 200 });

  const sentiment = faker.helpers.weightedArrayElement(sentimentWeights);

  return {
    id: faker.string.uuid(),
    agentId,
    userId: faker.string.uuid(),
    startedAt,
    endedAt,
    messageCount,
    totalTokens: messageCount * avgTokensPerMessage,
    sentiment,
    status,
    businessContext,
  };
}

// Generate and cache conversations
let conversations: Conversation[] = [];

export function initConversations(): void {
  const agentIds = getAgentIds();
  conversations = Array.from({ length: 500 }, () => generateConversation(agentIds));
}

export function getConversations(filters?: {
  agentId?: string;
  status?: string;
  sentiment?: string;
  storeId?: string;
  incidentId?: string;
  eventType?: string;
}): Conversation[] {
  let result = conversations;

  if (filters?.agentId) {
    result = result.filter(c => c.agentId === filters.agentId);
  }
  if (filters?.status) {
    result = result.filter(c => c.status === filters.status);
  }
  if (filters?.sentiment) {
    result = result.filter(c => c.sentiment === filters.sentiment);
  }
  if (filters?.storeId) {
    result = result.filter(c => c.businessContext?.storeId === filters.storeId);
  }
  if (filters?.incidentId) {
    result = result.filter(c => c.businessContext?.incidentId === filters.incidentId);
  }
  if (filters?.eventType) {
    result = result.filter(c => c.businessContext?.eventType === filters.eventType);
  }

  return result.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find(c => c.id === id);
}

export function getConversationsByAgent(agentId: string): Conversation[] {
  return conversations.filter(c => c.agentId === agentId);
}

export function getConversationsByIncident(incidentId: string): Conversation[] {
  return conversations.filter(c => c.businessContext?.incidentId === incidentId);
}

export function getConversationsByStore(storeId: string): Conversation[] {
  return conversations.filter(c => c.businessContext?.storeId === storeId);
}

export { conversations };
