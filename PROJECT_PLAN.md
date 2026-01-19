# Admin Portal Demo - AI Agent Monitoring Dashboard

> A demo admin portal showcasing AI agent monitoring, performance metrics, cost tracking, and governance.

## Project Overview

This is a **demo application** with realistic fake data that demonstrates what an enterprise AI agent management portal could look like. No actual Azure AI Foundry integration - purely frontend/backend with mock data.

## Agent Team

| Agent | Role | Responsibility |
|-------|------|----------------|
| **PM Agent** | Project Manager | Task coordination, sprint planning, blockers |
| **Frontend Agent** | UI Developer | React components, styling, user experience |
| **Backend Agent** | API Developer | Express APIs, data models, mock data generation |
| **Design Agent** | UX/UI Designer | Wireframes, component specs, visual consistency |
| **QA Agent** | Quality Assurance | Test cases, bug tracking, acceptance criteria |
| **Ralph Wiggum** | Orchestrator | Autonomous iteration, self-improvement loops |

## Features

### Dashboard
- [ ] Overview metrics (active agents, total conversations, costs)
- [ ] Real-time activity feed
- [ ] Quick action buttons

### Agent Management
- [ ] List all agents with status indicators
- [ ] Agent detail view (config, performance, logs)
- [ ] Create/Edit/Delete agents (mock)
- [ ] Agent health monitoring

### Performance Metrics
- [ ] Response time charts
- [ ] Token usage graphs
- [ ] Success/failure rates
- [ ] Cost per agent breakdown

### Cost Tracking
- [ ] Daily/weekly/monthly cost views
- [ ] Cost by agent, by model, by department
- [ ] Budget alerts and thresholds
- [ ] Cost forecasting

### Governance
- [ ] Audit logs
- [ ] Access control matrix
- [ ] Policy compliance status
- [ ] Data retention settings

### Conversations
- [ ] Conversation history browser
- [ ] Search and filter
- [ ] Conversation replay
- [ ] Sentiment analysis indicators

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 18 + TypeScript | Vite build |
| Styling | CSS Modules | Clean, no heavy frameworks |
| Charts | Recharts | Lightweight charting |
| Backend | Express + TypeScript | REST API |
| Mock Data | Faker.js | Realistic fake data |
| Testing | Jest + Testing Library | Unit + integration |

## Fake Data Strategy

All data will be generated using Faker.js with seeds for consistency:
- **Agents**: 15-20 realistic agent configurations
- **Conversations**: 500+ mock conversations
- **Metrics**: 30 days of historical data
- **Users**: 10 admin users with different roles
- **Costs**: Realistic token/API cost structures

## Sprint Plan

### Sprint 1: Foundation
- Project setup and scaffolding
- Basic routing and navigation
- Mock data generators
- Dashboard skeleton

### Sprint 2: Core Features
- Agent list and detail views
- Basic metrics charts
- Cost summary views

### Sprint 3: Polish
- Search and filtering
- Responsive design
- Loading states and error handling
- Final styling pass

---

*Created: 2025-01-19*
