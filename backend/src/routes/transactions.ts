import { Router } from 'express';
import {
  getTransactionLogs,
  getTransactionById,
  getTransactionStats,
} from '../data/generators/transactions.js';
import type { D365Platform, TransactionOutcome } from '../types/index.js';

const router = Router();

// GET /api/transactions - List all transactions with filters
router.get('/', (req, res) => {
  const { page = '1', pageSize = '20', platform, outcome, agentId } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const transactions = getTransactionLogs({
    platform: platform as D365Platform | undefined,
    outcome: outcome as TransactionOutcome | undefined,
    agentId: agentId as string | undefined,
  });

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

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', (_req, res) => {
  const stats = getTransactionStats();

  res.json({
    success: true,
    data: stats,
  });
});

// GET /api/transactions/:id - Get single transaction with full explainability details
router.get('/:id', (req, res) => {
  const transaction = getTransactionById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Transaction not found' }
    });
  }

  res.json({ success: true, data: transaction });
});

export default router;
