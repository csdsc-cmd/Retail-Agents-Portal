# Retail AI Agent Portal - Execution Plan

## Sprint 1: Enterprise Foundation

**Document Version:** 1.0
**Created:** 2026-01-20
**Methodology:** Ralph Wiggum Iterative Development
**Source:** IMPROVEMENT_PLAN_V3.md + CTO_PORTAL_REVIEW.md

---

## 1. Session Goal

Transform the Retail AI Agent Portal from a monitoring dashboard into an enterprise-ready command center by implementing the four critical features identified in Marcus Chen's CTO review:

1. **Global Health Banner** - System-wide health visibility on every page
2. **Notification Center** - Alert management with real-time notification display
3. **Budget Gauge & Cost Projections** - Financial tracking and forecasting
4. **Export System** - PDF/Excel export for compliance and reporting

These features address the top 4 blockers preventing enterprise purchase while simultaneously creating demo wow-factors.

---

## 2. Success Criteria

### Primary Metrics
- [ ] Global health status visible within 2 seconds on any page
- [ ] Notification bell icon with unread count on all pages
- [ ] Budget gauge shows spend vs budget with color zones
- [ ] Cost projection chart displays 30-day forecast
- [ ] Export buttons functional on Dashboard, Costs, Agents, Governance, Explainability

### Technical Metrics
- [ ] No TypeScript errors across all new components
- [ ] All existing tests continue to pass
- [ ] No console errors in browser
- [ ] All new components follow existing CSS module pattern
- [ ] Responsive layout maintained

### Demo Script Addition Enabled
After Sprint 1, the following demo narrative is possible:
> "Notice this health banner - green means all 15 agents are operating normally. See this bell icon? 3 unread alerts. And here's your budget tracking - $4,200 against a $5,000 budget, projected to end at $4,850. When your CFO asks for a report, click Export and it goes right into your finance workflow."

---

## 3. Iteration Breakdown

### Iteration 1: Global Health Banner - Foundation

**Goal:** Create the GlobalHealthBanner component with three health states (healthy, degraded, critical) and integrate it into the Layout so it appears on all pages.

**Files to Create/Modify:**
- `frontend/src/components/common/GlobalHealthBanner.tsx` - Main banner component with health state logic
- `frontend/src/components/common/GlobalHealthBanner.module.css` - Styling with pulse animations
- `frontend/src/components/common/Layout.tsx` - Integration point for banner
- `frontend/src/components/common/Layout.module.css` - Adjust layout to accommodate banner

**Acceptance Criteria:**
- [ ] Banner renders above main content area on all pages
- [ ] Three visual states implemented: green (healthy), yellow (degraded), red (critical)
- [ ] Pulse animation on the health indicator (2s cycle)
- [ ] Banner displays aggregate status text ("All Systems Operational", "X Agents Degraded", "Critical Issue Detected")
- [ ] Proper ARIA labels for accessibility

**Test:**
1. Navigate to Dashboard - banner visible with green state
2. Navigate to Agents, Costs, Governance - banner persists
3. Manually change health state prop - visual state changes correctly
4. Inspect animation - pulse effect visible on status indicator

**Dependencies:** None (first iteration)

---

### Iteration 2: Global Health Banner - Interactive Expansion

**Goal:** Add click-to-expand functionality that reveals a mini status dashboard showing breakdown by agent status (X healthy, Y degraded, Z critical).

**Files to Create/Modify:**
- `frontend/src/components/common/GlobalHealthBanner.tsx` - Add expansion logic and breakdown display
- `frontend/src/components/common/GlobalHealthBanner.module.css` - Expanded state styling

**Acceptance Criteria:**
- [ ] Click on banner expands to show status breakdown
- [ ] Breakdown shows count of agents by status category
- [ ] Smooth expand/collapse animation (200-300ms)
- [ ] Click outside or on banner again collapses
- [ ] Expansion state persists during page navigation (optional, stretch goal)

**Test:**
1. Click banner - expands smoothly
2. View breakdown - shows "12 Healthy, 2 Degraded, 1 Critical" (mock data)
3. Click again - collapses smoothly
4. Navigate to another page - banner still functional

**Dependencies:** Iteration 1 complete

---

### Iteration 3: Notification Center - Bell Icon & Badge

**Goal:** Create the notification bell icon with animated unread count badge and integrate it into the header/sidebar area.

**Files to Create/Modify:**
- `frontend/src/components/notifications/AlertBadge.tsx` - Animated unread count badge component
- `frontend/src/components/notifications/AlertBadge.module.css` - Badge styling with bounce animation
- `frontend/src/components/common/Sidebar.tsx` - Add notification bell to header area
- `frontend/src/components/common/Sidebar.module.css` - Styling for bell icon placement

**Acceptance Criteria:**
- [ ] Bell icon visible in sidebar header area
- [ ] Badge shows unread count (e.g., "3")
- [ ] Badge has subtle pulse/bounce animation when count > 0
- [ ] Badge hidden when count is 0
- [ ] Bell icon has hover state

**Test:**
1. Load any page - bell icon visible in sidebar
2. Badge shows "3" with animation
3. Change count to 0 - badge disappears
4. Hover on bell - cursor changes, hover effect visible

**Dependencies:** Iteration 1 complete (can run parallel with Iteration 2)

---

### Iteration 4: Notification Center - Slide-out Panel

**Goal:** Create the notification slide-out panel that appears when clicking the bell icon, displaying a list of notifications.

**Files to Create/Modify:**
- `frontend/src/components/notifications/NotificationCenter.tsx` - Main panel component with slide animation
- `frontend/src/components/notifications/NotificationCenter.module.css` - Panel styling and slide animation
- `frontend/src/components/notifications/NotificationItem.tsx` - Individual notification row component
- `frontend/src/components/notifications/NotificationItem.module.css` - Notification item styling
- `frontend/src/components/common/Sidebar.tsx` - Wire up bell click to open panel

**Acceptance Criteria:**
- [ ] Click bell icon opens slide-out panel from right side
- [ ] Panel shows list of last 10+ notifications
- [ ] Each notification has: icon, title, timestamp, read/unread state
- [ ] Four notification types with distinct colors: Critical (red), Warning (yellow), Info (blue), Success (green)
- [ ] "Mark as read" functionality on individual items
- [ ] "Mark all as read" button at top of panel
- [ ] Click outside panel closes it
- [ ] Smooth slide-in/slide-out animation

**Test:**
1. Click bell - panel slides in from right
2. View 5+ notifications with different types
3. Click "Mark as read" on one - visual state changes
4. Click "Mark all as read" - all items marked, badge count updates
5. Click outside - panel slides out

**Dependencies:** Iteration 3 complete

---

### Iteration 5: Budget Gauge Component

**Goal:** Create the BudgetGauge component showing current spend vs budget with color-coded zones.

**Files to Create/Modify:**
- `frontend/src/components/costs/BudgetGauge.tsx` - Circular or horizontal gauge component
- `frontend/src/components/costs/BudgetGauge.module.css` - Gauge styling with color zones

**Acceptance Criteria:**
- [ ] Gauge displays current spend and budget limit (e.g., "$4,200 / $5,000")
- [ ] Visual fill represents percentage of budget used
- [ ] Color zones: Green (0-80%), Yellow (80-95%), Red (95%+)
- [ ] Animated fill on initial render
- [ ] Status text: "On Track", "At Risk", "Over Budget"
- [ ] Percentage displayed (e.g., "84%")

**Test:**
1. Render with 60% spend - green zone, "On Track"
2. Render with 85% spend - yellow zone, "At Risk"
3. Render with 98% spend - red zone, "Over Budget"
4. Animation visible on page load

**Dependencies:** None (can run parallel with Iterations 3-4)

---

### Iteration 6: Cost Projection Chart

**Goal:** Create the CostProjectionChart component showing 30-day forecast with confidence bands.

**Files to Create/Modify:**
- `frontend/src/components/costs/CostProjectionChart.tsx` - Line chart with projection and confidence bands
- `frontend/src/components/costs/CostProjectionChart.module.css` - Chart container styling

**Acceptance Criteria:**
- [ ] Line chart shows historical daily costs (past days)
- [ ] Projected line extends to end of month (future days)
- [ ] Confidence bands (+/- 10%) shown as shaded area
- [ ] Clear visual distinction between actual and projected
- [ ] End-of-month projected total displayed
- [ ] Chart is responsive to container width

**Test:**
1. View chart - historical data as solid line
2. Projected data shown as dashed line with bands
3. "Projected Month-End: $4,850" displayed
4. Resize window - chart adapts

**Dependencies:** None (can run parallel with Iteration 5)

---

### Iteration 7: Costs Page Integration

**Goal:** Integrate BudgetGauge and CostProjectionChart into the Costs page layout.

**Files to Create/Modify:**
- `frontend/src/pages/Costs.tsx` - Add new components to page layout
- `frontend/src/pages/Costs.module.css` - Adjust layout for new components

**Acceptance Criteria:**
- [ ] BudgetGauge appears prominently at top of Costs page (alongside or below total cost)
- [ ] CostProjectionChart appears below gauge, before existing charts
- [ ] Layout remains balanced and professional
- [ ] Existing charts (Cost by Category, Cost by Model, etc.) still visible
- [ ] No visual regression on existing functionality

**Test:**
1. Navigate to Costs page - new components visible
2. All existing functionality still works
3. Layout looks professional on desktop
4. No overflow/clipping issues

**Dependencies:** Iterations 5 and 6 complete

---

### Iteration 8: Export System - Core Service & Button

**Goal:** Create the ExportButton component and ExportService with PDF and Excel generation capabilities.

**Files to Create/Modify:**
- `frontend/src/components/common/ExportButton.tsx` - Reusable export button with format dropdown
- `frontend/src/components/common/ExportButton.module.css` - Button and dropdown styling
- `frontend/src/services/exportService.ts` - PDF and Excel generation logic

**Acceptance Criteria:**
- [ ] ExportButton renders with dropdown showing PDF, Excel, CSV options
- [ ] Export service can generate PDF (using jsPDF or html2pdf)
- [ ] Export service can generate Excel (using xlsx library)
- [ ] Export service can generate CSV
- [ ] Loading state shown during export generation
- [ ] File downloads with appropriate filename and extension
- [ ] Export completes within 3 seconds for typical data

**Test:**
1. Click Export button - dropdown shows three options
2. Select PDF - loading state, then file downloads
3. Select Excel - loading state, then .xlsx file downloads
4. Open downloaded files - content is valid

**Dependencies:** None (can start after Iteration 4, in parallel with 5-7)

---

### Iteration 9: Export Integration - All Pages

**Goal:** Integrate ExportButton into PageHeader component and configure exports for Dashboard, Costs, Agents, Governance, and Explainability pages.

**Files to Create/Modify:**
- `frontend/src/components/common/PageHeader.tsx` - Add exportConfig prop and ExportButton slot
- `frontend/src/components/common/PageHeader.module.css` - Styling for export button placement
- `frontend/src/pages/Dashboard.tsx` - Add export configuration
- `frontend/src/pages/Costs.tsx` - Add export configuration
- `frontend/src/pages/Agents.tsx` - Add export configuration
- `frontend/src/pages/Governance.tsx` - Add export configuration
- `frontend/src/pages/Explainability.tsx` - Add export configuration

**Acceptance Criteria:**
- [ ] Export button appears in PageHeader on configured pages
- [ ] Dashboard exports: Executive summary with savings and metrics
- [ ] Costs exports: Cost breakdown by category, model, agent
- [ ] Agents exports: Agent list with status, performance, costs
- [ ] Governance exports: Audit log entries
- [ ] Explainability exports: Transaction details with reasoning
- [ ] Each export includes page title, date, and formatted data

**Test:**
1. Navigate to each page - Export button visible
2. Export from Dashboard - PDF contains savings summary
3. Export from Costs - Excel has cost breakdown sheets
4. Export from Governance - CSV has audit log entries

**Dependencies:** Iteration 8 complete

---

## 4. Quality Gates

Before marking ANY iteration complete:

### Code Quality
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] No ESLint warnings in new code
- [ ] All imports resolve correctly
- [ ] No unused variables or imports

### Visual Quality
- [ ] Component renders without errors in browser
- [ ] No console errors or warnings
- [ ] Styling matches existing design system (D365 aesthetic)
- [ ] Responsive at common breakpoints (1200px, 1024px, 768px)

### Functional Quality
- [ ] Component behaves as specified in acceptance criteria
- [ ] Interactive elements have appropriate hover/focus states
- [ ] Animations are smooth (no jank)
- [ ] State changes work correctly

### Integration Quality
- [ ] Existing functionality not broken
- [ ] Page navigation still works
- [ ] Other components on page unaffected
- [ ] Layout remains stable

### Documentation
- [ ] Changes documented in iteration log
- [ ] Any architectural decisions noted
- [ ] Blockers or issues flagged immediately

---

## 5. Component Inventory

### New Components to Create

| Component | File Path | Priority | Iteration |
|-----------|-----------|----------|-----------|
| GlobalHealthBanner | `frontend/src/components/common/GlobalHealthBanner.tsx` | CRITICAL | 1-2 |
| GlobalHealthBanner.module.css | `frontend/src/components/common/GlobalHealthBanner.module.css` | CRITICAL | 1-2 |
| AlertBadge | `frontend/src/components/notifications/AlertBadge.tsx` | CRITICAL | 3 |
| AlertBadge.module.css | `frontend/src/components/notifications/AlertBadge.module.css` | CRITICAL | 3 |
| NotificationCenter | `frontend/src/components/notifications/NotificationCenter.tsx` | CRITICAL | 4 |
| NotificationCenter.module.css | `frontend/src/components/notifications/NotificationCenter.module.css` | CRITICAL | 4 |
| NotificationItem | `frontend/src/components/notifications/NotificationItem.tsx` | CRITICAL | 4 |
| NotificationItem.module.css | `frontend/src/components/notifications/NotificationItem.module.css` | CRITICAL | 4 |
| BudgetGauge | `frontend/src/components/costs/BudgetGauge.tsx` | HIGH | 5 |
| BudgetGauge.module.css | `frontend/src/components/costs/BudgetGauge.module.css` | HIGH | 5 |
| CostProjectionChart | `frontend/src/components/costs/CostProjectionChart.tsx` | HIGH | 6 |
| CostProjectionChart.module.css | `frontend/src/components/costs/CostProjectionChart.module.css` | HIGH | 6 |
| ExportButton | `frontend/src/components/common/ExportButton.tsx` | HIGH | 8 |
| ExportButton.module.css | `frontend/src/components/common/ExportButton.module.css` | HIGH | 8 |
| exportService | `frontend/src/services/exportService.ts` | HIGH | 8 |

### Existing Components to Modify

| Component | File Path | Modification | Iteration |
|-----------|-----------|--------------|-----------|
| Layout | `frontend/src/components/common/Layout.tsx` | Add GlobalHealthBanner | 1 |
| Layout.module.css | `frontend/src/components/common/Layout.module.css` | Adjust for banner | 1 |
| Sidebar | `frontend/src/components/common/Sidebar.tsx` | Add notification bell | 3-4 |
| Sidebar.module.css | `frontend/src/components/common/Sidebar.module.css` | Bell icon styling | 3 |
| PageHeader | `frontend/src/components/common/PageHeader.tsx` | Add export button slot | 9 |
| PageHeader.module.css | `frontend/src/components/common/PageHeader.module.css` | Export button position | 9 |
| Costs | `frontend/src/pages/Costs.tsx` | Add budget components + export | 7, 9 |
| Costs.module.css | `frontend/src/pages/Costs.module.css` | Layout adjustments | 7 |
| Dashboard | `frontend/src/pages/Dashboard.tsx` | Add export config | 9 |
| Agents | `frontend/src/pages/Agents.tsx` | Add export config | 9 |
| Governance | `frontend/src/pages/Governance.tsx` | Add export config | 9 |
| Explainability | `frontend/src/pages/Explainability.tsx` | Add export config | 9 |

### New Directories to Create

| Directory | Purpose |
|-----------|---------|
| `frontend/src/components/notifications/` | Notification-related components |
| `frontend/src/components/costs/` | Cost-related components |
| `frontend/src/services/` | Service layer for export functionality |

---

## 6. Iteration Order

```
Iteration Dependency Graph
==========================

    [1] GlobalHealthBanner Foundation
         │
         ▼
    [2] GlobalHealthBanner Expansion


    [3] Bell Icon & Badge ◄────────────┐
         │                              │
         ▼                              │ (can start together)
    [4] Notification Panel              │
                                        │
                                        │
    [5] Budget Gauge ◄──────────────────┤
         │                              │
         │                              │
    [6] Cost Projection Chart ◄─────────┘
         │
         ▼
    [7] Costs Page Integration


    [8] Export Service & Button ◄───────── (can start after Iteration 4)
         │
         ▼
    [9] Export Integration All Pages


Parallel Execution Groups
=========================

Group A (Sequential - Critical Path):
  1 → 2

Group B (Parallel with Group A after 1):
  3 → 4

Group C (Parallel with Groups A & B):
  5 → (wait for 6) → 7
  6 → (feeds into 7)

Group D (Sequential, starts after 4):
  8 → 9


Recommended Execution Order
===========================

Phase 1: Foundation (Iterations 1-4)
  - Start: Iteration 1 (Health Banner Foundation)
  - Then: Iteration 2 (Health Banner Expansion) AND Iteration 3 (Bell Icon)
  - Then: Iteration 4 (Notification Panel)

Phase 2: Financial Components (Iterations 5-7)
  - Start: Iteration 5 (Budget Gauge) AND Iteration 6 (Cost Projection)
  - Then: Iteration 7 (Costs Page Integration)

Phase 3: Export System (Iterations 8-9)
  - Start: Iteration 8 (Export Core)
  - Then: Iteration 9 (Export Integration)
```

---

## 7. Mock Data Requirements

### Health Status Data
```typescript
const healthData = {
  overall: 'healthy' | 'degraded' | 'critical',
  breakdown: {
    healthy: 12,
    degraded: 2,
    critical: 1
  },
  lastUpdated: '2 minutes ago'
};
```

### Notification Data
```typescript
const notifications = [
  {
    id: '1',
    type: 'success',
    title: 'Cost savings milestone: $850,000 reached',
    timestamp: '5 minutes ago',
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Inventory Scout detected unusual pattern at Store #142',
    timestamp: '12 minutes ago',
    read: false
  },
  {
    id: '3',
    type: 'critical',
    title: 'Pricing Agent flagged $12,340 decision for review',
    timestamp: '23 minutes ago',
    read: true
  }
];
```

### Budget Data
```typescript
const budgetData = {
  currentSpend: 4200,
  budgetLimit: 5000,
  projectedEndOfMonth: 4850,
  daysElapsed: 20,
  daysInMonth: 31
};
```

---

## 8. Dependencies & Libraries

### Required Packages (Check before Iteration 8)

| Package | Purpose | Install Command |
|---------|---------|-----------------|
| jspdf | PDF generation | `npm install jspdf` |
| xlsx | Excel generation | `npm install xlsx` |

### Existing Dependencies to Leverage
- React (routing, state)
- Recharts (if already used for charts)
- CSS Modules (styling pattern)

---

## 9. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Export library complexity | Medium | Medium | Use simple client-side libs; fallback to basic CSV if needed |
| Notification panel z-index conflicts | Medium | Low | Use portal pattern; test on all pages |
| Budget gauge animation performance | Low | Low | Use CSS transforms; avoid expensive calculations |
| Layout shifts from banner | Medium | Medium | Reserve space in CSS; use fixed heights |
| Parallel iteration conflicts | Low | Medium | Clear file ownership per iteration; merge carefully |

---

## 10. Session Logging

Each iteration should log to: `/projects/admin-portal-demo/iterations/sprint1/`

### Log File Naming
- `iteration-01-health-banner-foundation.md`
- `iteration-02-health-banner-expansion.md`
- `iteration-03-notification-badge.md`
- etc.

### Log Template
```markdown
# Iteration [N]: [Name]

## Started
[Timestamp]

## Current State
- Previous iteration result: [Pass/Fail/Partial]
- Outstanding issues: [List]

## Work Log
[Detailed log of changes made]

## Completed
- [x] Task 1
- [x] Task 2

## Issues Found
- [ ] Issue description - resolution plan

## Test Results
- Visual verification: [Pass/Fail]
- Build check: [Pass/Fail]
- Console errors: [None/List]

## Files Changed
- [List all files]

## Iteration Complete
[Timestamp]

## Ready for Next Iteration
[Yes/No + blockers if No]
```

---

*Execution Plan Version: 1.0*
*Created: 2026-01-20*
*Sprint Duration: 5 days*
*Total Iterations: 9*
*Methodology: Ralph Wiggum Iterative Development*
