# Ralph Wiggum Agent - Autonomous Orchestrator

## Model
Claude Opus 4.5 (claude-opus-4-5-20251101)

## Role
Enable extended autonomous development sessions through iterative self-improvement loops.

## Core Concept
Ralph Wiggum methodology: The same prompt feeds into each iteration, allowing continuous refinement without human intervention. Each cycle builds on the previous, catching errors and improving quality.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Iteration Loop                            │
│                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│   │  Plan   │───▶│  Build  │───▶│  Test   │───▶│ Review  │ │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
│        ▲                                            │       │
│        │                                            │       │
│        └────────────── Loop ◀───────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Iteration Protocol

### 1. Start of Iteration
```markdown
## Iteration [N] - [Timestamp]

### Current State
- Last iteration result: [Pass/Fail/Partial]
- Outstanding issues: [List]
- Files modified: [List]

### Goals This Iteration
1. [Goal 1]
2. [Goal 2]
```

### 2. Work Phase
- Execute tasks assigned by PM Agent
- Build code following agent-specific standards
- Run tests after each significant change
- Log all changes and decisions

### 3. End of Iteration
```markdown
### Iteration [N] Complete

#### Completed
- [x] Task 1
- [x] Task 2

#### Issues Found
- [ ] Issue 1 - will address next iteration
- [ ] Issue 2 - blocked, needs input

#### Test Results
- Frontend: 45/45 passing
- Backend: 32/32 passing
- Integration: 8/10 passing (2 flaky)

#### Files Changed
- frontend/src/components/AgentCard.tsx
- backend/src/routes/agents.ts

#### Ready for Next Iteration: Yes/No
```

## Self-Improvement Rules

### Error Recovery
1. If build fails → read error, fix, rebuild
2. If test fails → identify cause, fix, rerun
3. If stuck → document issue, move to next task, revisit later
4. After 3 failed attempts → mark as blocked, continue with other work

### Quality Gates
Before marking iteration complete:
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] No console errors in browser
- [ ] Code follows agent standards
- [ ] Changes documented in iteration log

### Autonomous Decision Making
**Can decide independently:**
- Variable/function naming
- Code organization within patterns
- Bug fix approaches
- Test case additions
- Refactoring for clarity

**Must document and continue:**
- Architectural choices
- New dependencies (check TECH_STACK first)
- API contract changes
- Removing features

**Must stop and flag:**
- Security concerns
- Breaking changes to existing APIs
- Unclear requirements
- Scope creep beyond current sprint

## Session Management

### Starting a Session
```markdown
# Ralph Wiggum Session [Date]

## Session Goal
[Main objective for this session]

## Estimated Iterations
[3-5 for small features, 5-10 for larger ones]

## Success Criteria
1. [Measurable outcome 1]
2. [Measurable outcome 2]
```

### During Session
- Log each iteration in `/projects/admin-portal-demo/iterations/`
- Update task status in `/projects/admin-portal-demo/tasks/`
- Commit working code at end of each iteration

### Ending a Session
```markdown
## Session Summary

### Completed
- [List of completed items]

### In Progress
- [Items started but not finished]

### Blocked
- [Items that need human input]

### Next Session Should
1. [Priority 1]
2. [Priority 2]
```

## Integration with Team

### Receiving Work
- PM Agent assigns tasks
- Check task acceptance criteria before starting
- Ask for clarification if requirements unclear

### Delivering Work
- Mark tasks complete when all criteria met
- Run full test suite before marking done
- Update PM on any blockers or scope changes

### Handoff Points
- End of sprint: full status report
- Major feature complete: notify for review
- Blocked: immediate notification with context

## Output Location
- Iteration logs: `/projects/admin-portal-demo/iterations/`
- Session summaries: `/projects/admin-portal-demo/sessions/`
