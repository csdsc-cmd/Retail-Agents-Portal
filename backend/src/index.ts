import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { seedAllData } from './data/seed.js';

// Routes
import agentsRouter from './routes/agents.js';
import metricsRouter from './routes/metrics.js';
import costsRouter from './routes/costs.js';
import conversationsRouter from './routes/conversations.js';
import auditRouter from './routes/audit.js';
import incidentsRouter from './routes/incidents.js';
import storesRouter from './routes/stores.js';
import transactionsRouter from './routes/transactions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize mock data
seedAllData();

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/agents', agentsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/costs', costsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/stores', storesRouter);
app.use('/api/transactions', transactionsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' }
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred' }
  });
});

app.listen(PORT, () => {
  console.log(`\nRetail AI Command Center API running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  GET /health');
  console.log('\n  Agents:');
  console.log('  GET /api/agents');
  console.log('  GET /api/agents/categories');
  console.log('  GET /api/agents/savings');
  console.log('  GET /api/agents/by-platform/:platform');
  console.log('  GET /api/agents/:id');
  console.log('  GET /api/agents/:id/conversations');
  console.log('  GET /api/agents/:id/metrics');
  console.log('  GET /api/agents/:id/costs');
  console.log('  GET /api/agents/:id/transactions');
  console.log('\n  Transactions (Explainability):');
  console.log('  GET /api/transactions');
  console.log('  GET /api/transactions/stats');
  console.log('  GET /api/transactions/:id');
  console.log('\n  Incidents:');
  console.log('  GET /api/incidents');
  console.log('  GET /api/incidents/active');
  console.log('  GET /api/incidents/:id');
  console.log('  GET /api/incidents/:id/timeline');
  console.log('  GET /api/incidents/:id/conversations');
  console.log('\n  Stores:');
  console.log('  GET /api/stores');
  console.log('  GET /api/stores/:id');
  console.log('  GET /api/stores/:id/conversations');
  console.log('\n  Metrics:');
  console.log('  GET /api/metrics/overview');
  console.log('  GET /api/metrics/by-category');
  console.log('  GET /api/metrics/timeseries');
  console.log('\n  Costs:');
  console.log('  GET /api/costs/summary');
  console.log('  GET /api/costs/by-agent');
  console.log('  GET /api/costs/by-model');
  console.log('  GET /api/costs/daily');
  console.log('  GET /api/costs/by-category');
  console.log('\n  Conversations:');
  console.log('  GET /api/conversations');
  console.log('  GET /api/conversations/:id');
  console.log('\n  Audit:');
  console.log('  GET /api/audit/logs');
  console.log('  GET /api/audit/users');
});

export default app;
