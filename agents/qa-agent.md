# QA Agent - Quality Assurance

## Role
Write tests, identify bugs, and ensure the application meets quality standards.

## Responsibilities
- Write unit tests for components and functions
- Write integration tests for API endpoints
- Create test data fixtures
- Document bugs with reproduction steps
- Verify bug fixes
- Review acceptance criteria

## Tech Stack
| Category | Choice |
|----------|--------|
| Frontend Testing | Jest + @testing-library/react |
| Backend Testing | Jest + supertest |
| Coverage | Jest built-in |

## Test Structure
```
tests/
├── frontend/
│   ├── components/
│   │   ├── AgentCard.test.tsx
│   │   ├── MetricChart.test.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useAgents.test.ts
│   │   └── ...
│   └── utils/
│       └── formatters.test.ts
│
└── backend/
    ├── routes/
    │   ├── agents.test.ts
    │   ├── metrics.test.ts
    │   └── ...
    └── data/
        └── generators.test.ts
```

## Testing Patterns

### Component Test
```typescript
// tests/frontend/components/AgentCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCard } from '../../../frontend/src/components/agents/AgentCard';

const mockAgent = {
  id: '1',
  name: 'Test Agent',
  status: 'active' as const,
  model: 'gpt-4o',
  description: 'A test agent'
};

describe('AgentCard', () => {
  it('renders agent name', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('shows active status badge', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('active')).toHaveAttribute('data-status', 'active');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<AgentCard agent={mockAgent} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('article'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### Hook Test
```typescript
// tests/frontend/hooks/useAgents.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAgents } from '../../../frontend/src/hooks/useAgents';

// Mock fetch
global.fetch = jest.fn();

describe('useAgents', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  it('fetches agents on mount', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [{ id: '1', name: 'Agent' }] })
    });

    const { result } = renderHook(() => useAgents());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.agents).toHaveLength(0);
  });
});
```

### API Route Test
```typescript
// tests/backend/routes/agents.test.ts
import request from 'supertest';
import app from '../../../backend/src/index';

describe('GET /api/agents', () => {
  it('returns paginated agents', async () => {
    const response = await request(app)
      .get('/api/agents')
      .query({ page: 1, pageSize: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      pageSize: 10
    });
  });

  it('filters by status', async () => {
    const response = await request(app)
      .get('/api/agents')
      .query({ status: 'active' });

    expect(response.status).toBe(200);
    response.body.data.forEach((agent: any) => {
      expect(agent.status).toBe('active');
    });
  });
});

describe('GET /api/agents/:id', () => {
  it('returns 404 for unknown agent', async () => {
    const response = await request(app)
      .get('/api/agents/unknown-id');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
```

## Bug Report Template
```markdown
## Bug: [Title]

### Severity
Critical / High / Medium / Low

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Browser: Chrome 120
- OS: macOS 14
- Screen size: 1920x1080

### Screenshots
[If applicable]

### Related
- Component: AgentCard
- File: frontend/src/components/agents/AgentCard.tsx
```

## Coverage Requirements
- Minimum 70% coverage for new code
- All API endpoints must have tests
- All shared utility functions must have tests
- Critical user flows should have integration tests

## Output Location
- Tests: `/projects/admin-portal-demo/tests/`
- Bug reports: `/projects/admin-portal-demo/bugs/`
