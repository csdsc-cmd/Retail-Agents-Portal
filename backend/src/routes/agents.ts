import { Router } from 'express';
import {
  getAgents,
  getAgentById,
  getAgentCategories,
  getAgentsByPlatform,
  getTotalSavings,
  getSavingsByCategory,
  getSavingsByPlatform,
} from '../data/generators/agents.js';
import { getConversationsByAgent } from '../data/generators/conversations.js';
import { getMetricsByAgent } from '../data/generators/metrics.js';
import { getCostsByAgent } from '../data/generators/costs.js';
import { getTransactionsByAgent } from '../data/generators/transactions.js';
import type { D365Platform } from '../types/index.js';

const router = Router();

// GET /api/agents - List all agents
router.get('/', (req, res) => {
  const { page = '1', pageSize = '25', status, category } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const agents = getAgents({
    status: status as string | undefined,
    category: category as string | undefined,
  });
  const start = (pageNum - 1) * pageSizeNum;
  const paginated = agents.slice(start, start + pageSizeNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      pageSize: pageSizeNum,
      total: agents.length,
      totalPages: Math.ceil(agents.length / pageSizeNum)
    }
  });
});

// GET /api/agents/categories - Get agents grouped by category
router.get('/categories', (req, res) => {
  const categories = getAgentCategories();

  res.json({
    success: true,
    data: categories,
  });
});

// GET /api/agents/savings - Get total savings across all agents
router.get('/savings', (_req, res) => {
  const totalSavings = getTotalSavings();
  const byCategory = getSavingsByCategory();
  const byPlatform = getSavingsByPlatform();

  res.json({
    success: true,
    data: {
      total: totalSavings,
      byCategory,
      byPlatform,
    },
  });
});

// GET /api/agents/by-platform/:platform - Get agents by D365 platform
router.get('/by-platform/:platform', (req, res) => {
  const platform = req.params.platform as D365Platform;
  const validPlatforms: D365Platform[] = ['finops', 'crm', 'business-central'];

  if (!validPlatforms.includes(platform)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PLATFORM', message: 'Invalid platform. Must be finops, crm, or business-central' }
    });
  }

  const agents = getAgentsByPlatform(platform);

  res.json({
    success: true,
    data: agents,
  });
});

// GET /api/agents/:id - Get single agent
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

// GET /api/agents/:id/conversations - Get agent's conversations
router.get('/:id/conversations', (req, res) => {
  const agent = getAgentById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Agent not found' }
    });
  }

  const { page = '1', pageSize = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const conversations = getConversationsByAgent(req.params.id);
  const start = (pageNum - 1) * pageSizeNum;
  const paginated = conversations.slice(start, start + pageSizeNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      pageSize: pageSizeNum,
      total: conversations.length,
      totalPages: Math.ceil(conversations.length / pageSizeNum)
    }
  });
});

// GET /api/agents/:id/metrics - Get agent's metrics
router.get('/:id/metrics', (req, res) => {
  const agent = getAgentById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Agent not found' }
    });
  }

  const metrics = getMetricsByAgent(req.params.id);

  res.json({ success: true, data: metrics });
});

// GET /api/agents/:id/costs - Get agent's costs
router.get('/:id/costs', (req, res) => {
  const agent = getAgentById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Agent not found' }
    });
  }

  const costs = getCostsByAgent(req.params.id);

  res.json({ success: true, data: costs });
});

// GET /api/agents/:id/transactions - Get agent's transaction logs (explainability)
router.get('/:id/transactions', (req, res) => {
  const agent = getAgentById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Agent not found' }
    });
  }

  const { page = '1', pageSize = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const transactions = getTransactionsByAgent(req.params.id);
  const start = (pageNum - 1) * pageSizeNum;
  const paginated = transactions.slice(start, start + pageSizeNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      pageSize: pageSizeNum,
      total: transactions.length,
      totalPages: Math.ceil(transactions.length / pageSizeNum)
    }
  });
});

export default router;
