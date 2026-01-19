import { Router } from 'express';
import {
  getIncidents,
  getIncidentById,
  getActiveIncidents,
  getIncidentsByAgent,
  getIncidentTimeline,
} from '../data/generators/incidents.js';
import { getConversationsByIncident } from '../data/generators/conversations.js';
import { getAgents } from '../data/generators/agents.js';
import type { IncidentStatus, EventSeverity, Incident, AgentCategory } from '../types/index.js';

const router = Router();

// Transform incident data for frontend consumption
function transformIncident(incident: Incident) {
  const agents = getAgents();

  // Extract unique categories from related agents
  const relatedAgents = agents.filter(a => incident.relatedAgentIds.includes(a.id));
  const affectedCategories = [...new Set(relatedAgents.map(a => a.category))] as AgentCategory[];

  return {
    ...incident,
    affectedStores: incident.affectedStores.map(s => s.name),
    affectedCategories,
    timeline: incident.timeline.map(t => ({
      id: t.id,
      timestamp: t.timestamp,
      title: t.eventType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: t.description,
      agentId: t.agentId,
      agentName: t.agentName,
      category: t.agentCategory,
      severity: incident.severity,
    })),
    estimatedImpact: incident.financialImpact ? {
      financialLoss: incident.financialImpact,
      affectedTransactions: Math.floor(incident.financialImpact / 150),
    } : undefined,
  };
}

// GET /api/incidents - List all incidents
router.get('/', (req, res) => {
  const { status, severity } = req.query;

  const incidents = getIncidents({
    status: status as IncidentStatus | undefined,
    severity: severity as EventSeverity | undefined,
  });

  res.json({
    success: true,
    data: incidents.map(transformIncident),
  });
});

// GET /api/incidents/active - Get active incidents
router.get('/active', (req, res) => {
  const activeIncidents = getActiveIncidents();

  res.json({
    success: true,
    data: activeIncidents.map(transformIncident),
  });
});

// GET /api/incidents/:id - Get single incident
router.get('/:id', (req, res) => {
  const incident = getIncidentById(req.params.id);

  if (!incident) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Incident not found' }
    });
  }

  res.json({ success: true, data: transformIncident(incident) });
});

// GET /api/incidents/:id/timeline - Get incident timeline
router.get('/:id/timeline', (req, res) => {
  const incident = getIncidentById(req.params.id);

  if (!incident) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Incident not found' }
    });
  }

  const timeline = getIncidentTimeline(req.params.id);

  res.json({ success: true, data: timeline });
});

// GET /api/incidents/:id/conversations - Get conversations related to incident
router.get('/:id/conversations', (req, res) => {
  const incident = getIncidentById(req.params.id);

  if (!incident) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Incident not found' }
    });
  }

  const { page = '1', pageSize = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);

  const conversations = getConversationsByIncident(req.params.id);
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

// GET /api/incidents/by-agent/:agentId - Get incidents involving an agent
router.get('/by-agent/:agentId', (req, res) => {
  const incidents = getIncidentsByAgent(req.params.agentId);

  res.json({
    success: true,
    data: incidents.map(transformIncident),
  });
});

export default router;
