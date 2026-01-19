# Fake Data Strategy

## Overview
All data in this demo is generated using `@faker-js/faker` with consistent seeds. This ensures:
- Reproducible data across restarts
- Realistic-looking values
- Consistent relationships between entities

## Seed Strategy
```typescript
import { faker } from '@faker-js/faker';
faker.seed(12345); // Master seed for all generators
```

## Data Volume

| Entity | Count | Notes |
|--------|-------|-------|
| Agents | 20 | Mix of active/inactive/error |
| Conversations | 500 | Spread over 30 days |
| Daily Metrics | 600 | 20 agents × 30 days |
| Cost Records | 600 | 20 agents × 30 days |
| Audit Logs | 200 | Various action types |
| Users | 10 | Different roles |

## Entity Definitions

### Agents
```typescript
const AGENT_NAMES = [
  'Customer Support Bot',
  'Sales Assistant',
  'HR Onboarding Helper',
  'IT Support Agent',
  'Knowledge Base Bot',
  'Lead Qualification Agent',
  'Document Analyzer',
  'Meeting Scheduler',
  'Expense Report Bot',
  'Training Assistant'
];

const MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];

// Status distribution (weighted)
// 70% active, 20% inactive, 10% error
```

### Conversations
```typescript
// Distribution over 30 days - more recent = more conversations
// Weekdays have 2x volume vs weekends
// Business hours (9am-5pm) have 3x volume

const SENTIMENT_WEIGHTS = {
  positive: 0.6,
  neutral: 0.3,
  negative: 0.1
};
```

### Metrics (Daily Aggregates)
```typescript
interface DailyMetrics {
  agentId: string;
  date: Date;
  conversations: number;      // 10-100 per day
  avgResponseTime: number;    // 800-3000ms
  successRate: number;        // 0.85-0.99
  totalTokensInput: number;   // Based on conversations
  totalTokensOutput: number;  // ~1.5x input
}
```

### Costs
```typescript
// Pricing (per 1K tokens)
const PRICING = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
};

// Daily cost = (inputTokens/1000 * inputPrice) + (outputTokens/1000 * outputPrice)
// Typical range: $0.50 - $50 per agent per day depending on model and volume
```

### Audit Logs
```typescript
const ACTION_TYPES = [
  'agent.created',
  'agent.updated',
  'agent.deleted',
  'agent.started',
  'agent.stopped',
  'config.changed',
  'user.login',
  'user.logout',
  'policy.updated',
  'export.requested'
];
```

### Users
```typescript
const ROLES = ['admin', 'operator', 'viewer'];

// 2 admins, 4 operators, 4 viewers
// Each has realistic name, email, avatar
```

## Realistic Patterns

### Time-Based Patterns
- **Daily**: More activity during business hours
- **Weekly**: Lower volume on weekends
- **Monthly**: Slight growth trend over 30 days

### Agent Performance Patterns
- Some agents are "star performers" (98%+ success)
- Some agents have occasional issues (85-90% success)
- One agent in error state with declining metrics

### Cost Patterns
- GPT-4o agents cost 10x more than gpt-4o-mini
- High-volume agents have proportionally higher costs
- Weekend costs are lower due to reduced volume

### Conversation Patterns
- Average 8-15 messages per conversation
- Customer support has longer conversations
- Simple queries resolve faster

## ID Generation
Using UUIDs for all IDs to look realistic:
```typescript
const id = faker.string.uuid(); // "550e8400-e29b-41d4-a716-446655440000"
```

## Date Generation
All dates are relative to "now" for freshness:
```typescript
// Past 30 days for historical data
const date = faker.date.recent({ days: 30 });

// Created dates go back up to 1 year
const createdAt = faker.date.past({ years: 1 });
```

## Relationships

```
User (10)
  └── creates → Agent (20)
  └── has → AuditLog (many)

Agent (20)
  └── has → Conversation (500 total)
  └── has → DailyMetrics (30 per agent)
  └── has → CostRecord (30 per agent)

Conversation
  └── belongs to → Agent
  └── initiated by → (anonymous user)
```

## Implementation Notes

1. **Generate once, cache in memory** - Don't regenerate on every request
2. **Use the same faker seed** - Ensures consistent IDs across entities
3. **Generate in order** - Agents first, then conversations referencing agent IDs
4. **Date consistency** - Conversation dates should fall within agent's active period

## Sample Output

```json
// Agent
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Customer Support Bot 42",
  "description": "Handles tier-1 customer inquiries and FAQs",
  "model": "gpt-4o-mini",
  "status": "active",
  "createdAt": "2024-08-15T10:30:00Z",
  "lastActiveAt": "2025-01-19T14:22:00Z",
  "config": {
    "temperature": 0.7,
    "maxTokens": 2048,
    "systemPrompt": "You are a helpful customer support agent..."
  },
  "metrics": {
    "totalConversations": 1247,
    "avgResponseTime": 1250,
    "successRate": 0.94
  }
}

// Cost Record
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "agentId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-01-18",
  "inputTokens": 45000,
  "outputTokens": 67500,
  "totalCost": 47.25,
  "model": "gpt-4o-mini"
}
```

---

*Last updated: 2025-01-19*
