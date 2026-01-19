# Sprint 2 Execution Plan - Watchtower Dashboard

## User Feedback Summary

### User (Portal Operator) Feedback:
> "This isn't a portal I want to spend a lot of time in. I don't control things in here, I just use it as a watchtower. Given I have 20+ agents in my environment, the dashboard should be a **tabular view** where I can see all information on a **single screen**."

**Requested single-screen metrics per agent:**
- Agent name
- Health status
- Transactions (count/volume)
- Cost savings
- Human escalations
- Connected systems (D365 integrations)
- Integration health

**Core Insight:** Current dashboard is "occasional use or deep dive data" - needs to be a real-time operations table.

### CTO (Marcus Chen) Remaining Concerns:
1. Notification backend needs real-time integration
2. Budget limits hardcoded at $5,000 - should be configurable
3. No export rate limiting
4. Notification persistence unclear

---

## Sprint 2 Goal

Transform the dashboard from a "summary + charts" view into a **Watchtower Operations Table** - a single-screen tabular view showing all 20+ agents with key metrics at a glance.

---

## Iteration Plan

### Iteration 1: AgentWatchtowerTable Component
**Acceptance Criteria:**
- [ ] Sortable table with all agents in single view
- [ ] Columns: Agent | Status | Platform | Transactions (24h) | Savings (24h) | Escalations | Response Time
- [ ] Color-coded status indicators (green/yellow/red)
- [ ] Inline sparkline trends for transactions
- [ ] Row click navigates to agent detail

**Files to Create/Modify:**
- `frontend/src/components/dashboard/AgentWatchtowerTable.tsx`
- `frontend/src/components/dashboard/AgentWatchtowerTable.module.css`

---

### Iteration 2: Integration Health Status
**Acceptance Criteria:**
- [ ] Show which D365 systems each agent connects to
- [ ] Integration health indicator per system (connected/degraded/disconnected)
- [ ] Platform icons (FinOps, CRM, Business Central)
- [ ] Last sync timestamp per integration

**Files to Create/Modify:**
- `frontend/src/components/dashboard/IntegrationStatus.tsx`
- `frontend/src/components/dashboard/IntegrationStatus.module.css`
- `backend/src/routes/integrations.ts` - new endpoint for integration health

---

### Iteration 3: Dashboard Redesign - Watchtower Mode
**Acceptance Criteria:**
- [ ] Replace current chart-heavy dashboard with table-first layout
- [ ] Keep summary metrics row at top (compressed)
- [ ] Main content = AgentWatchtowerTable (full width, scrollable)
- [ ] Secondary section = Integration Health overview
- [ ] Toggle option: "Watchtower View" vs "Analytics View"

**Files to Modify:**
- `frontend/src/pages/Dashboard.tsx` - major redesign
- `frontend/src/pages/Dashboard.module.css` - new layout styles

---

### Iteration 4: Configurable Budget Limits
**Acceptance Criteria:**
- [ ] Budget limit editable via UI (not hardcoded)
- [ ] Store in localStorage for demo persistence
- [ ] Budget settings modal accessible from Costs page
- [ ] BudgetGauge and CostProjectionChart use configured value

**Files to Create/Modify:**
- `frontend/src/components/costs/BudgetSettings.tsx`
- `frontend/src/components/costs/BudgetSettings.module.css`
- `frontend/src/pages/Costs.tsx` - add settings button
- `frontend/src/hooks/useBudgetSettings.ts` - localStorage hook

---

### Iteration 5: Real-time Data Refresh
**Acceptance Criteria:**
- [ ] Auto-refresh interval selector (30s, 1m, 5m, manual)
- [ ] Visual refresh indicator in header
- [ ] "Last updated X seconds ago" timestamp
- [ ] Smooth data transition animations (no jarring reloads)

**Files to Create/Modify:**
- `frontend/src/components/common/RefreshControl.tsx`
- `frontend/src/components/common/RefreshControl.module.css`
- `frontend/src/hooks/useAutoRefresh.ts`

---

## Ralph Wiggum Methodology

For each iteration:
1. **Plan** - Review acceptance criteria
2. **Build** - Create components
3. **Test** - Verify build compiles, visual check
4. **Review** - Self-assess against criteria
5. **Loop** - Fix issues before moving to next iteration

---

## Success Metrics

After Sprint 2, the dashboard should answer these questions at a glance:
- Which agents need attention right now? (status column)
- How much value is each agent generating? (savings column)
- Are there any escalations I need to handle? (escalations column)
- Are my D365 integrations healthy? (integration status)
- How am I tracking against budget? (gauge, now configurable)

---

## Wireframe: New Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [GlobalHealthBanner - All Systems Healthy | 23 agents active]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ $847K    │ │ 12,456   │ │ 99.2%    │ │ 0.8%     │ │ 23/25    │  │
│  │ Savings  │ │ Trans.   │ │ Success  │ │ Escalate │ │ Healthy  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                      │
│  [Watchtower View] [Analytics View]        [Refresh: 30s ▾] [Export]│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Agent             │Status│Platform│Trans│Savings│Escal│Trend   ││
│  ├───────────────────┼──────┼────────┼─────┼───────┼─────┼────────┤│
│  │ Stock Level Mon.  │ ● OK │FinOps  │1.2K │$12.4K │  0  │ ▁▂▃▅▇  ││
│  │ Price Optimizer   │ ● OK │ CRM    │ 890 │$8.2K  │  2  │ ▂▃▄▅▆  ││
│  │ Demand Forecaster │ ⚠ DEG│FinOps  │ 445 │$4.1K  │  5  │ ▅▄▃▂▁  ││
│  │ Return Processor  │ ● OK │ BC     │2.1K │$19.8K │  1  │ ▃▄▅▆▇  ││
│  │ Queue Manager     │ ✗ ERR│FinOps  │  0  │ $0    │ 12  │ ▁▁▁▁▁  ││
│  │ ...               │      │        │     │       │     │        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  Integration Health                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │
│  │ D365 FinOps     │ │ D365 CRM        │ │ Business Central│       │
│  │ ● Connected     │ │ ● Connected     │ │ ⚠ Degraded      │       │
│  │ 15 agents       │ │ 5 agents        │ │ 3 agents        │       │
│  │ Last: 2s ago    │ │ Last: 5s ago    │ │ Last: 45s ago   │       │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Sprint 2 Execution Plan*
*Created: 2026-01-20*
*Methodology: Ralph Wiggum Iterative Development*
