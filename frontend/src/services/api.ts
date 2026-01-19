import type {
  Agent,
  AgentCategory,
  Conversation,
  DailyMetrics,
  CostRecord,
  AuditLog,
  User,
  DashboardOverview,
  CostSummary,
  CategoryMetrics,
  Incident,
  Store,
  ApiResponse,
  PaginatedResponse,
  SavingsData,
  AgentTransactionLog,
  TransactionStats,
  D365Platform,
  TransactionOutcome,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const json = await response.json() as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message || 'Unknown error');
  }
  return json.data as T;
}

async function fetchPaginated<T>(endpoint: string): Promise<PaginatedResponse<T>> {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Agents
export async function getAgents(page = 1, pageSize = 20, status?: string, category?: AgentCategory) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  return fetchPaginated<Agent>(`/api/agents?${params}`);
}

export async function getAgent(id: string) {
  return fetchApi<Agent>(`/api/agents/${id}`);
}

export async function getAgentCategories() {
  return fetchApi<{ category: AgentCategory; count: number; agents: Agent[] }[]>('/api/agents/categories');
}

export async function getAgentsByCategory(category: AgentCategory) {
  return fetchApi<Agent[]>(`/api/agents/by-category/${category}`);
}

export async function getAgentsByPlatform(platform: D365Platform) {
  return fetchApi<Agent[]>(`/api/agents/by-platform/${platform}`);
}

export async function getAgentConversations(id: string, page = 1, pageSize = 20) {
  return fetchPaginated<Conversation>(`/api/agents/${id}/conversations?page=${page}&pageSize=${pageSize}`);
}

export async function getAgentMetrics(id: string) {
  return fetchApi<DailyMetrics[]>(`/api/agents/${id}/metrics`);
}

export async function getAgentCosts(id: string) {
  return fetchApi<CostRecord[]>(`/api/agents/${id}/costs`);
}

export async function getAgentTransactions(id: string, page = 1, pageSize = 20) {
  return fetchPaginated<AgentTransactionLog>(`/api/agents/${id}/transactions?page=${page}&pageSize=${pageSize}`);
}

// Savings
export async function getSavings() {
  return fetchApi<SavingsData>('/api/agents/savings');
}

// Stores
export async function getStores() {
  return fetchApi<Store[]>('/api/stores');
}

export async function getStore(id: string) {
  return fetchApi<Store>(`/api/stores/${id}`);
}

// Incidents
export async function getIncidents(status?: string) {
  const params = status ? `?status=${status}` : '';
  return fetchApi<Incident[]>(`/api/incidents${params}`);
}

export async function getIncident(id: string) {
  return fetchApi<Incident>(`/api/incidents/${id}`);
}

export async function getActiveIncidents() {
  return fetchApi<Incident[]>('/api/incidents?status=active');
}

// Transactions (Explainability)
export async function getTransactions(
  page = 1,
  pageSize = 20,
  filters?: { platform?: D365Platform; outcome?: TransactionOutcome; agentId?: string }
) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters?.platform) params.append('platform', filters.platform);
  if (filters?.outcome) params.append('outcome', filters.outcome);
  if (filters?.agentId) params.append('agentId', filters.agentId);
  return fetchPaginated<AgentTransactionLog>(`/api/transactions?${params}`);
}

export async function getTransaction(id: string) {
  return fetchApi<AgentTransactionLog>(`/api/transactions/${id}`);
}

export async function getTransactionStats() {
  return fetchApi<TransactionStats>('/api/transactions/stats');
}

// Metrics
export async function getDashboardOverview() {
  return fetchApi<DashboardOverview>('/api/metrics/overview');
}

export async function getTimeseriesMetrics(days = 30) {
  return fetchApi<{ date: string; conversations: number; avgResponseTime: number; successRate: number }[]>(
    `/api/metrics/timeseries?days=${days}`
  );
}

export async function getMetricsByCategory(): Promise<CategoryMetrics[]> {
  // API returns object keyed by category, transform to array
  const data = await fetchApi<Record<string, {
    totalConversations: number;
    avgResponseTime: number;
    avgSuccessRate: number;
    agentCount: number;
  }>>('/api/metrics/by-category');

  return Object.entries(data).map(([category, metrics]) => ({
    category: category as AgentCategory,
    totalConversations: metrics.totalConversations,
    avgResponseTime: metrics.avgResponseTime,
    successRate: metrics.avgSuccessRate,
    agentCount: metrics.agentCount,
  }));
}

// Costs
export async function getCostSummary() {
  return fetchApi<CostSummary>('/api/costs/summary');
}

export async function getCostsByAgent() {
  return fetchApi<{ agentId: string; agentName: string; totalCost: number }[]>('/api/costs/by-agent');
}

export async function getCostsByCategory() {
  return fetchApi<{ category: AgentCategory; totalCost: number; agentCount: number }[]>('/api/costs/by-category');
}

export async function getDailyCosts() {
  return fetchApi<{ date: string; cost: number }[]>('/api/costs/daily');
}

// Conversations
export async function getConversations(page = 1, pageSize = 20, filters?: { agentId?: string; status?: string; sentiment?: string }) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters?.agentId) params.append('agentId', filters.agentId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.sentiment) params.append('sentiment', filters.sentiment);
  return fetchPaginated<Conversation>(`/api/conversations?${params}`);
}

export async function getConversation(id: string) {
  return fetchApi<Conversation>(`/api/conversations/${id}`);
}

// Audit
export async function getAuditLogs(page = 1, pageSize = 50, filters?: { action?: string; resource?: string }) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters?.action) params.append('action', filters.action);
  if (filters?.resource) params.append('resource', filters.resource);
  return fetchPaginated<AuditLog>(`/api/audit/logs?${params}`);
}

export async function getUsers() {
  return fetchApi<User[]>('/api/audit/users');
}
