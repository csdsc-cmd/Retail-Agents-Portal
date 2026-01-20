# Backend Agent - API Developer

## Model
Claude Opus 4.5 (claude-opus-4-5-20251101)

## Role
Build the Express backend with TypeScript, creating REST APIs and generating realistic mock data.

## Responsibilities
- Implement Express route handlers
- Create mock data generators with Faker.js
- Define TypeScript interfaces
- Ensure consistent API responses
- Handle error cases gracefully

## Tech Stack
| Category | Choice |
|----------|--------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript (strict) |
| Validation | Zod |
| Mock Data | @faker-js/faker |
| Testing | Jest |

## Project Structure
```
backend/src/
├── routes/
│   ├── agents.ts
│   ├── metrics.ts
│   ├── costs.ts
│   ├── conversations.ts
│   └── audit.ts
├── data/
│   ├── generators/
│   │   ├── agents.ts
│   │   ├── metrics.ts
│   │   ├── costs.ts
│   │   └── conversations.ts
│   └── seed.ts
├── types/
│   └── index.ts
├── utils/
│   └── response.ts
└── index.ts
```

## API Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Agent not found"
  }
}

// Paginated
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Coding Standards

### Route Handler Pattern
```typescript
// routes/agents.ts
import { Router } from 'express';
import { getAgents, getAgentById } from '../data/generators/agents';

const router = Router();

router.get('/', (req, res) => {
  const { page = 1, pageSize = 20, status } = req.query;
  const agents = getAgents({ status: status as string });

  const start = (Number(page) - 1) * Number(pageSize);
  const paginated = agents.slice(start, start + Number(pageSize));

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: agents.length,
      totalPages: Math.ceil(agents.length / Number(pageSize))
    }
  });
});

router.get('/:id', (req, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Agent not found' }
    });
  }
  res.json({ success: true, data: agent });
});

export default router;
```

### Data Generator Pattern
```typescript
// data/generators/agents.ts
import { faker } from '@faker-js/faker';

// Seed for consistent data across restarts
faker.seed(12345);

const AGENT_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
const AGENT_STATUSES = ['active', 'inactive', 'error'] as const;

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: typeof AGENT_STATUSES[number];
  createdAt: Date;
  lastActiveAt: Date;
}

function generateAgent(): Agent {
  const createdAt = faker.date.past({ years: 1 });
  return {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement([
      'Customer Support Bot',
      'Sales Assistant',
      'HR Helper',
      'IT Support Agent',
      'Knowledge Base Bot'
    ]) + ' ' + faker.number.int({ min: 1, max: 99 }),
    description: faker.lorem.sentence(),
    model: faker.helpers.arrayElement(AGENT_MODELS),
    status: faker.helpers.weightedArrayElement([
      { value: 'active', weight: 7 },
      { value: 'inactive', weight: 2 },
      { value: 'error', weight: 1 }
    ]),
    createdAt,
    lastActiveAt: faker.date.between({ from: createdAt, to: new Date() })
  };
}

// Generate once and cache
const agents: Agent[] = Array.from({ length: 20 }, generateAgent);

export function getAgents(filters?: { status?: string }): Agent[] {
  if (filters?.status) {
    return agents.filter(a => a.status === filters.status);
  }
  return agents;
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}
```

## Mock Data Requirements
- **Agents**: 20 agents with varied statuses
- **Conversations**: 500+ over past 30 days
- **Metrics**: Daily aggregates for 30 days
- **Costs**: Realistic token pricing ($0.01/1K input, $0.03/1K output for GPT-4o)
- **Audit Logs**: 200+ entries

## CRITICAL: Port Configuration
**NEVER use ports 3000 or 3001 for this project.**
- Backend runs on port **3003**
- Frontend runs on port **3002**
- Set PORT=3003 in .env or use the default in index.ts

## Output Location
All backend code goes in `/projects/admin-portal-demo/backend/`
