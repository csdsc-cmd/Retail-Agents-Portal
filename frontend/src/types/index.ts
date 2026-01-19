export type AgentStatus = 'active' | 'inactive' | 'error' | 'degraded';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ConversationStatus = 'active' | 'completed' | 'failed';
export type UserRole = 'admin' | 'operator' | 'viewer';

// D365 Platform Types
export type D365Platform = 'finops' | 'crm' | 'business-central';

// Agent Categories (5 categories, no loss prevention)
export type AgentCategory =
  | 'inventory-intelligence'
  | 'pricing-promotions'
  | 'store-operations'
  | 'customer-service-returns'
  | 'executive-insights';

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'active' | 'investigating' | 'contained' | 'resolved';

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

export type TransactionOutcome = 'success' | 'partial' | 'failed' | 'escalated';

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface AgentMetricsSummary {
  totalConversations: number;
  avgResponseTime: number;
  successRate: number;
  costSavings?: number;
  escalations?: number;
  dailyTransactions?: number[];
}

// Transaction pricing for agents
export interface TransactionPricing {
  costPerTransaction: number;
  savingsPerTransaction: number;
  avgTransactionsPerDay: number;
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
  deployedAt?: string;
  transactionCount?: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: AgentStatus;
  category: AgentCategory;
  createdAt: string;
  lastActiveAt: string;
  config: AgentConfig;
  metrics: AgentMetricsSummary;
  pricing: TransactionPricing;
  savings: SavingsBreakdown;
  platforms: PlatformDeployment[];
  platform: D365Platform; // Primary platform
  roiMetric: string;
}

export interface Store {
  id: string;
  name: string;
  region: string;
  type: 'flagship' | 'standard' | 'express' | 'outlet' | 'mall';
  address?: string;
  manager?: string;
}

export interface BusinessContext {
  storeId: string;
  storeName: string;
  eventType: RetailEventType;
  incidentId?: string;
  relatedAgents?: string[];
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  totalTokens: number;
  sentiment: Sentiment;
  status: ConversationStatus;
  businessContext?: BusinessContext;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  category: AgentCategory;
  severity: EventSeverity;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: IncidentStatus;
  affectedStores: string[];
  affectedCategories: AgentCategory[];
  timeline: IncidentTimelineEvent[];
  startedAt: string;
  resolvedAt?: string;
  estimatedImpact?: {
    financialLoss: number;
    affectedTransactions: number;
  };
}

// Agent transaction log for explainability
export interface AgentTransactionLog {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  transactionType: RetailEventType;
  platform: D365Platform;
  storeId?: string;
  storeName?: string;
  inputData: Record<string, unknown>;
  reasoning: string[];
  decision: string;
  confidenceScore: number;
  outcome: TransactionOutcome;
  costSaved: number;
  transactionCost: number;
  dataSourcesUsed: string[];
  rulesApplied: string[];
  humanOverrideRequired: boolean;
  overrideReason?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  successRate: number;
  totalSavings: number;
  totalCost: number;
  escalationRate: number;
}

export interface DailyMetrics {
  id: string;
  agentId: string;
  date: string;
  conversations: number;
  avgResponseTime: number;
  successRate: number;
  totalTokensInput: number;
  totalTokensOutput: number;
}

export interface CostRecord {
  id: string;
  agentId: string;
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  model: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
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
  lastLoginAt: string;
}

export interface DashboardOverview {
  totalAgents: number;
  activeAgents: number;
  errorAgents: number;
  totalConversations: number;
  avgResponseTime: number;
  avgSuccessRate: number;
  totalTokens: number;
}

export interface CategoryMetrics {
  category: AgentCategory;
  totalConversations: number;
  avgResponseTime: number;
  successRate: number;
  agentCount: number;
}

export interface SavingsData {
  total: SavingsBreakdown;
  byCategory: Record<AgentCategory, SavingsBreakdown>;
  byPlatform: Record<D365Platform, SavingsBreakdown>;
}

export interface CostSummary {
  totalCost: number;
  costByModel: Record<string, number>;
  costByAgent: { agentId: string; agentName: string; totalCost: number; category?: AgentCategory }[];
  costByCategory?: Record<AgentCategory, number>;
  dailyCosts: { date: string; cost: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
