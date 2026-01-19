import { Router } from 'express';
import {
  getAggregateMetrics,
  getTimeSeriesMetrics,
  getAggregateMetricsByCategory,
  getTimeSeriesMetricsByCategory,
} from '../data/generators/metrics.js';
import { getAgents, getAgentCategories } from '../data/generators/agents.js';
import { getActiveIncidents } from '../data/generators/incidents.js';
import type { AgentCategory } from '../types/index.js';

const router = Router();

// GET /api/metrics/overview - Dashboard summary
router.get('/overview', (_req, res) => {
  const aggregate = getAggregateMetrics();
  const agents = getAgents();
  const categories = getAgentCategories();
  const activeIncidents = getActiveIncidents();

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const errorAgents = agents.filter(a => a.status === 'error').length;

  res.json({
    success: true,
    data: {
      totalAgents: agents.length,
      activeAgents,
      errorAgents,
      totalConversations: aggregate.totalConversations,
      avgResponseTime: aggregate.avgResponseTime,
      avgSuccessRate: aggregate.avgSuccessRate,
      totalTokens: aggregate.totalTokens,
      categoryCounts: categories.map(c => ({
        category: c.category,
        count: c.count,
      })),
      activeIncidentCount: activeIncidents.length,
    }
  });
});

// GET /api/metrics/by-category - Metrics grouped by category
router.get('/by-category', (_req, res) => {
  const metricsByCategory = getAggregateMetricsByCategory();

  res.json({
    success: true,
    data: metricsByCategory,
  });
});

// GET /api/metrics/timeseries - Historical data
router.get('/timeseries', (req, res) => {
  const { days = '30', category } = req.query;
  const daysNum = parseInt(days as string, 10);

  let timeseries;
  if (category) {
    timeseries = getTimeSeriesMetricsByCategory(category as AgentCategory, daysNum);
  } else {
    timeseries = getTimeSeriesMetrics(daysNum);
  }

  res.json({ success: true, data: timeseries });
});

export default router;
