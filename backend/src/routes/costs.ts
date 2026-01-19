import { Router } from 'express';
import { getCostSummary } from '../data/generators/costs.js';

const router = Router();

// GET /api/costs/summary - Cost overview
router.get('/summary', (_req, res) => {
  const summary = getCostSummary();

  res.json({ success: true, data: summary });
});

// GET /api/costs/by-agent - Breakdown by agent
router.get('/by-agent', (_req, res) => {
  const summary = getCostSummary();

  res.json({ success: true, data: summary.costByAgent });
});

// GET /api/costs/by-model - Breakdown by model
router.get('/by-model', (_req, res) => {
  const summary = getCostSummary();

  res.json({ success: true, data: summary.costByModel });
});

// GET /api/costs/daily - Daily costs
router.get('/daily', (_req, res) => {
  const summary = getCostSummary();

  res.json({ success: true, data: summary.dailyCosts });
});

// GET /api/costs/by-category - Breakdown by category
router.get('/by-category', (_req, res) => {
  const summary = getCostSummary();

  // Transform the record to an array with agent counts
  const categories: Array<{ category: string; totalCost: number; agentCount: number }> = [];
  const agentCountByCategory: Record<string, number> = {};

  for (const agent of summary.costByAgent) {
    agentCountByCategory[agent.category] = (agentCountByCategory[agent.category] || 0) + 1;
  }

  for (const [category, totalCost] of Object.entries(summary.costByCategory)) {
    categories.push({
      category,
      totalCost,
      agentCount: agentCountByCategory[category] || 0,
    });
  }

  res.json({ success: true, data: categories });
});

export default router;
