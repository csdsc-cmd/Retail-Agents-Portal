# Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Dashboard  │ │   Agents    │ │   Metrics   │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │    Costs    │ │ Governance  │ │    Logs     │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express API)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    REST Endpoints                    │    │
│  │  /api/agents    /api/metrics    /api/costs          │    │
│  │  /api/conversations    /api/audit    /api/users     │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Mock Data Layer (Faker.js)              │    │
│  │  Seeded generators for consistent fake data          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
admin-portal-demo/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Shared components
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   ├── agents/          # Agent management
│   │   │   ├── metrics/         # Charts and graphs
│   │   │   ├── costs/           # Cost tracking
│   │   │   └── governance/      # Audit and compliance
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client functions
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Helper functions
│   │   └── styles/              # Global styles
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/              # Express route handlers
│   │   ├── data/                # Mock data generators
│   │   ├── types/               # Shared type definitions
│   │   └── utils/               # Helper functions
│   └── package.json
│
├── agents/                      # Agent prompt definitions
│   ├── pm-agent.md
│   ├── frontend-agent.md
│   ├── backend-agent.md
│   ├── design-agent.md
│   ├── qa-agent.md
│   └── ralph-wiggum.md
│
├── design/                      # Design assets
│   ├── wireframes/
│   └── component-specs/
│
├── tests/                       # Test suites
│   ├── frontend/
│   └── backend/
│
└── docs/                        # Documentation
    ├── TECH_ARCHITECTURE.md
    └── API_SPEC.md
```

## API Endpoints

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/agents | List all agents |
| GET | /api/agents/:id | Get agent details |
| POST | /api/agents | Create agent (mock) |
| PUT | /api/agents/:id | Update agent (mock) |
| DELETE | /api/agents/:id | Delete agent (mock) |

### Metrics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/metrics/overview | Dashboard summary |
| GET | /api/metrics/agents/:id | Agent-specific metrics |
| GET | /api/metrics/timeseries | Historical data |

### Costs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/costs/summary | Cost overview |
| GET | /api/costs/by-agent | Breakdown by agent |
| GET | /api/costs/by-period | Daily/weekly/monthly |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/conversations | List conversations |
| GET | /api/conversations/:id | Conversation detail |

### Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/audit/logs | Audit trail |
| GET | /api/audit/policies | Policy compliance |

## Data Models

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  lastActiveAt: Date;
  config: {
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
  metrics: {
    totalConversations: number;
    avgResponseTime: number;
    successRate: number;
  };
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  messageCount: number;
  totalTokens: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'active' | 'completed' | 'failed';
}
```

### CostRecord
```typescript
interface CostRecord {
  id: string;
  agentId: string;
  date: Date;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  model: string;
}
```

### AuditLog
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
}
```

## Frontend Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   │   └── NavItem[]
│   └── Header
│       ├── SearchBar
│       └── UserMenu
│
├── DashboardPage
│   ├── MetricCard[] (4x)
│   ├── ActivityFeed
│   ├── AgentStatusGrid
│   └── CostChart
│
├── AgentsPage
│   ├── AgentList
│   │   └── AgentCard[]
│   └── AgentDetail
│       ├── AgentHeader
│       ├── AgentConfig
│       ├── AgentMetrics
│       └── AgentLogs
│
├── MetricsPage
│   ├── TimeRangeSelector
│   ├── ResponseTimeChart
│   ├── TokenUsageChart
│   └── SuccessRateChart
│
├── CostsPage
│   ├── CostSummary
│   ├── CostByAgentTable
│   └── CostTrendChart
│
└── GovernancePage
    ├── AuditLogTable
    ├── PolicyStatusGrid
    └── AccessMatrix
```

## Mock Data Generation

Using Faker.js with consistent seeds:

```typescript
// Seed for reproducible data
faker.seed(12345);

// Generate 20 agents
const agents = Array.from({ length: 20 }, generateAgent);

// Generate 30 days of metrics per agent
const metrics = agents.flatMap(agent =>
  generateDailyMetrics(agent.id, 30)
);

// Generate 500 conversations
const conversations = Array.from({ length: 500 }, () =>
  generateConversation(faker.helpers.arrayElement(agents).id)
);
```

---

*Last updated: 2025-01-19*
