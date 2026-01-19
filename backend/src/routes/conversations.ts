import { Router } from 'express';
import { getConversations, getConversationById } from '../data/generators/conversations.js';

const router = Router();

// GET /api/conversations - List conversations
router.get('/', (req, res) => {
  const { page = '1', pageSize = '20', agentId, status, sentiment } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const conversations = getConversations({
    agentId: agentId as string | undefined,
    status: status as string | undefined,
    sentiment: sentiment as string | undefined
  });

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

// GET /api/conversations/:id - Get single conversation
router.get('/:id', (req, res) => {
  const conversation = getConversationById(req.params.id);

  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Conversation not found' }
    });
  }

  res.json({ success: true, data: conversation });
});

export default router;
