export type AgentStatus = 'active' | 'inactive' | 'error';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ConversationStatus = 'active' | 'completed' | 'failed';
export type UserRole = 'admin' | 'operator' | 'viewer';

// D365 Platform Types
export type D365Platform = 'finops' | 'crm' | 'business-central';

// Retail Agent Categories (5 categories matching website)
export type AgentCategory =
  | 'inventory-intelligence'
  | 'pricing-promotions'
  | 'store-operations'
  | 'customer-service-returns'
  | 'executive-insights';

// Incident severity levels
export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// Incident status
export type IncidentStatus = 'active' | 'investigating' | 'resolved';

// Retail event types for business context (non-crime focused)
export type RetailEventType =
  | 'inventory-discrepancy'
  | 'price-override'
  | 'return-spike'
  | 'stockout-alert'
  | 'customer-complaint'
  | 'promotion-performance'
  | 'policy-violation'
  | 'executive-escalation'
  | 'routine-operation'
  | 'demand-forecast'
  | 'margin-optimization'
  | 'staff-scheduling'
  | 'customer-resolution';

// Store information
export interface Store {
  id: string;
  name: string;
  region: string;
  type: 'flagship' | 'standard' | 'mall' | 'express';
}

// Business context for conversations
export interface BusinessContext {
  storeId: string;
  storeName: string;
  eventType: RetailEventType;
  severity: EventSeverity;
  incidentId?: string;
  relatedAgentIds?: string[];
}

// Incident timeline event
export interface IncidentTimelineEvent {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  agentCategory: AgentCategory;
  eventType: RetailEventType;
  description: string;
  conversationId?: string;
}

// Incident for tracking cascading events
export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: IncidentStatus;
  startedAt: Date;
  resolvedAt?: Date;
  affectedStores: Store[];
  relatedAgentIds: string[];
  timeline: IncidentTimelineEvent[];
  financialImpact?: number;
}

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface AgentMetricsSummary {
  totalConversations: number;
  avgResponseTime: number;
  successRate: number;
}

// Transaction pricing for agents
export interface TransactionPricing {
  costPerTransaction: number;      // $ cost per transaction
  savingsPerTransaction: number;   // $ saved per transaction vs manual
  avgTransactionsPerDay: number;   // Average daily transactions
}

// Savings breakdown by time period
export interface SavingsBreakdown {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

// Platform deployment configuration
export interface PlatformDeployment {
  platform: D365Platform;
  isDeployed: boolean;
  deployedAt?: Date;
  transactionCount?: number;
}

// Transaction outcome types
export type TransactionOutcome = 'success' | 'partial' | 'failed' | 'escalated';

// Agent transaction log entry for explainability
export interface AgentTransactionLog {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  transactionType: RetailEventType;
  platform: D365Platform;
  storeId?: string;
  storeName?: string;
  // Decision explainability
  inputData: Record<string, unknown>;      // What data the agent received
  reasoning: string[];                      // Step-by-step reasoning
  decision: string;                         // Final decision made
  confidenceScore: number;                  // 0-100 confidence level
  outcome: TransactionOutcome;
  // Financial impact
  costSaved: number;                        // $ saved by this transaction
  transactionCost: number;                  // $ cost of running this transaction
  // Audit trail
  dataSourcesUsed: string[];               // Which D365 modules/tables were queried
  rulesApplied: string[];                  // Business rules that influenced decision
  humanOverrideRequired: boolean;          // Whether human review was needed
  overrideReason?: string;                 // If overridden, why
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: AgentStatus;
  category: AgentCategory;
  createdAt: Date;
  lastActiveAt: Date;
  config: AgentConfig;
  metrics: AgentMetricsSummary;
  // New pricing and savings fields
  pricing: TransactionPricing;
  savings: SavingsBreakdown;
  platforms: PlatformDeployment[];
  roiMetric: string;  // e.g., "35% stockout reduction"
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  messageCount: number;
  totalTokens: number;
  sentiment: Sentiment;
  status: ConversationStatus;
  businessContext?: BusinessContext;
}

export interface DailyMetrics {
  id: string;
  agentId: string;
  date: Date;
  conversations: number;
  avgResponseTime: number;
  successRate: number;
  totalTokensInput: number;
  totalTokensOutput: number;
}

export interface CostRecord {
  id: string;
  agentId: string;
  date: Date;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  model: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  lastLoginAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
