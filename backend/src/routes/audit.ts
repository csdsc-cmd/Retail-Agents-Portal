import { Router } from 'express';
import { getAuditLogs, getUsers, getUserById } from '../data/generators/audit.js';

const router = Router();

// GET /api/audit/logs - Audit trail
router.get('/logs', (req, res) => {
  const { page = '1', pageSize = '50', action, resource, userId } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const logs = getAuditLogs({
    action: action as string | undefined,
    resource: resource as string | undefined,
    userId: userId as string | undefined
  });

  const start = (pageNum - 1) * pageSizeNum;
  const paginated = logs.slice(start, start + pageSizeNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      pageSize: pageSizeNum,
      total: logs.length,
      totalPages: Math.ceil(logs.length / pageSizeNum)
    }
  });
});

// GET /api/audit/users - List users
router.get('/users', (_req, res) => {
  const users = getUsers();
  res.json({ success: true, data: users });
});

// GET /api/audit/users/:id - Get single user
router.get('/users/:id', (req, res) => {
  const user = getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' }
    });
  }

  res.json({ success: true, data: user });
});

export default router;
