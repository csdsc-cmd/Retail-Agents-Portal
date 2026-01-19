import { Router } from 'express';
import { stores, getStoreById, getStoresByRegion } from '../data/generators/stores.js';
import { getConversationsByStore } from '../data/generators/conversations.js';

const router = Router();

// GET /api/stores - List all stores
router.get('/', (req, res) => {
  const { region } = req.query;

  let result = stores;
  if (region) {
    result = getStoresByRegion(region as string);
  }

  res.json({
    success: true,
    data: result,
  });
});

// GET /api/stores/:id - Get single store
router.get('/:id', (req, res) => {
  const store = getStoreById(req.params.id);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Store not found' }
    });
  }

  res.json({ success: true, data: store });
});

// GET /api/stores/:id/conversations - Get conversations for a store
router.get('/:id/conversations', (req, res) => {
  const store = getStoreById(req.params.id);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Store not found' }
    });
  }

  const { page = '1', pageSize = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const conversations = getConversationsByStore(req.params.id);
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

export default router;
