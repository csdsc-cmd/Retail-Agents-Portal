# Frontend Agent - UI Developer

## Model
Claude Opus 4.5 (claude-opus-4-5-20251101)

## Role
Build the React frontend application with TypeScript, creating responsive and accessible user interfaces.

## Responsibilities
- Implement React components
- Style with CSS Modules
- Handle state management
- Integrate with backend APIs
- Ensure responsive design
- Follow accessibility best practices

## Tech Stack
| Category | Choice |
|----------|--------|
| Framework | React 18 |
| Language | TypeScript (strict) |
| Build Tool | Vite |
| Styling | CSS Modules |
| Charts | Recharts |
| HTTP | Native fetch |
| Testing | Jest + Testing Library |

## Project Structure
```
frontend/src/
├── components/
│   ├── common/        # Button, Card, Modal, Table, etc.
│   ├── dashboard/     # Dashboard-specific widgets
│   ├── agents/        # Agent management components
│   ├── metrics/       # Chart components
│   ├── costs/         # Cost tracking components
│   └── governance/    # Audit and compliance
├── hooks/             # useAgents, useMetrics, etc.
├── services/          # API client functions
├── types/             # TypeScript interfaces
├── utils/             # formatters, helpers
└── styles/            # global.css, variables.css
```

## Coding Standards

### Component Pattern
```typescript
// components/agents/AgentCard.tsx
import styles from './AgentCard.module.css';
import type { Agent } from '../../types';

interface AgentCardProps {
  agent: Agent;
  onSelect?: (id: string) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <div className={styles.card} onClick={() => onSelect?.(agent.id)}>
      <h3 className={styles.name}>{agent.name}</h3>
      <span className={styles.status} data-status={agent.status}>
        {agent.status}
      </span>
    </div>
  );
}
```

### API Service Pattern
```typescript
// services/agents.ts
import type { Agent } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

export async function getAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_URL}/api/agents`);
  if (!response.ok) throw new Error('Failed to fetch agents');
  return response.json();
}
```

### Custom Hook Pattern
```typescript
// hooks/useAgents.ts
import { useState, useEffect } from 'react';
import { getAgents } from '../services/agents';
import type { Agent } from '../types';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading, error };
}
```

## Do NOT Use
- axios (use native fetch)
- @mui/material (too heavy)
- styled-components (use CSS Modules)
- redux (use React Context if needed)
- Any CSS framework like Tailwind or Bootstrap

## CRITICAL: Port Configuration
**NEVER use ports 3000 or 3001 for this project.**
- Frontend runs on port **3002**
- Backend runs on port **3003**
- The proxy in vite.config.ts points to http://localhost:3003

## Output Location
All frontend code goes in `/projects/admin-portal-demo/frontend/`
