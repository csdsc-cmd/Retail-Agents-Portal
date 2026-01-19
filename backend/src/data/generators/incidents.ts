import { faker } from '@faker-js/faker';
import type {
  Incident,
  IncidentTimelineEvent,
  EventSeverity,
  IncidentStatus,
  RetailEventType,
  AgentCategory,
} from '../../types/index.js';
import { stores } from './stores.js';
import { agents } from './agents.js';

// Seed for reproducible data
faker.seed(12349);

// Helper to get agents by category
function getAgentByCategory(category: AgentCategory) {
  return agents.find(a => a.category === category);
}

// Helper to get agent by name
function getAgentByName(name: string) {
  return agents.find(a => a.name === name);
}

// Incident 1: Supply Chain Disruption - Inventory Crisis
function createSupplyChainIncident(): Incident {
  const incidentId = 'INC-2024-001';
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - 18);

  const affectedStores = stores.filter(s => s.region === 'Auckland' || s.region === 'Wellington');

  const stockMonitor = getAgentByName('Stock Level Monitor')!;
  const demandForecaster = getAgentByName('Demand Forecaster')!;
  const warehouseSync = getAgentByName('Warehouse Sync Agent')!;
  const priceOptimization = getAgentByName('Price Optimization Engine')!;
  const customerInquiry = getAgentByName('Customer Inquiry Handler')!;
  const strategicAlert = getAgentByName('Strategic Alert Coordinator')!;
  const dailySummary = getAgentByName('Daily Business Summary')!;

  const timeline: IncidentTimelineEvent[] = [
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime()),
      agentId: stockMonitor.id,
      agentName: stockMonitor.name,
      agentCategory: 'inventory-intelligence',
      eventType: 'stockout-alert',
      description: 'Critical stock alert: Multiple high-demand SKUs falling below 10% of par level across North Island stores. 45 SKUs affected in Electronics and Appliances categories.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 2 * 60 * 60 * 1000),
      agentId: demandForecaster.id,
      agentName: demandForecaster.name,
      agentCategory: 'inventory-intelligence',
      eventType: 'demand-forecast',
      description: 'Demand forecast shows 60% higher than normal demand due to upcoming holiday weekend. Current inventory will be depleted within 48 hours at current sell-through rate.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 4 * 60 * 60 * 1000),
      agentId: warehouseSync.id,
      agentName: warehouseSync.name,
      agentCategory: 'inventory-intelligence',
      eventType: 'inventory-discrepancy',
      description: 'Warehouse sync confirms supplier delay: Key shipment delayed 5 days due to port congestion. Initiated emergency cross-dock from South Island distribution center.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 6 * 60 * 60 * 1000),
      agentId: priceOptimization.id,
      agentName: priceOptimization.name,
      agentCategory: 'pricing-promotions',
      eventType: 'margin-optimization',
      description: 'Recommended temporary price adjustment for scarce items to manage demand. Projected to extend stock availability by 35% while maintaining margin targets.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 10 * 60 * 60 * 1000),
      agentId: customerInquiry.id,
      agentName: customerInquiry.name,
      agentCategory: 'customer-service-returns',
      eventType: 'customer-complaint',
      description: 'Spike in customer inquiries about product availability. Automated responses providing accurate stock status and alternative product suggestions. 340 inquiries handled.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 14 * 60 * 60 * 1000),
      agentId: strategicAlert.id,
      agentName: strategicAlert.name,
      agentCategory: 'executive-insights',
      eventType: 'executive-escalation',
      description: 'ESCALATION: Supply chain crisis requires executive decision. Options presented: expedited air freight ($45K), alternative supplier activation, or demand management strategy.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 16 * 60 * 60 * 1000),
      agentId: dailySummary.id,
      agentName: dailySummary.name,
      agentCategory: 'executive-insights',
      eventType: 'routine-operation',
      description: 'Executive briefing prepared: Estimated revenue at risk: $180K. Cross-dock transfer in progress. Customer communication strategy activated. Monitoring continues.',
    },
  ];

  return {
    id: incidentId,
    title: 'Supply Chain Disruption - North Island',
    description: 'Critical inventory shortage developing across North Island stores due to supplier delays and higher than forecast demand. Multi-agent response coordinating inventory reallocation and customer communication.',
    severity: 'critical',
    status: 'investigating',
    startedAt: startDate,
    affectedStores,
    relatedAgentIds: timeline.map(t => t.agentId),
    timeline,
    financialImpact: 180000,
  };
}

// Incident 2: Promotion Optimization Success
function createPromotionIncident(): Incident {
  const incidentId = 'INC-2024-002';
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 3);

  const promoTracker = getAgentByName('Promotion Performance Tracker')!;
  const priceOptimization = getAgentByName('Price Optimization Engine')!;
  const markdownAdvisor = getAgentByName('Markdown Advisor')!;
  const financialMonitor = getAgentByName('Financial Health Monitor')!;
  const crossStore = getAgentByName('Cross-Store Performance Comparator')!;

  const timeline: IncidentTimelineEvent[] = [
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime()),
      agentId: promoTracker.id,
      agentName: promoTracker.name,
      agentCategory: 'pricing-promotions',
      eventType: 'promotion-performance',
      description: 'Winter clearance promotion showing negative ROI in first 24 hours. Cannibalization of full-price items detected at 35%, exceeding 20% threshold.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 6 * 60 * 60 * 1000),
      agentId: priceOptimization.id,
      agentName: priceOptimization.name,
      agentCategory: 'pricing-promotions',
      eventType: 'price-override',
      description: 'Price optimization analysis complete. Recommendation: Adjust discount structure from flat 40% to tiered (20%/30%/40%) based on inventory age. Projected margin recovery: $28K.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 12 * 60 * 60 * 1000),
      agentId: markdownAdvisor.id,
      agentName: markdownAdvisor.name,
      agentCategory: 'pricing-promotions',
      eventType: 'margin-optimization',
      description: 'Markdown strategy implemented. Old inventory (60+ days) at 40%, mid-age (30-60 days) at 30%, recent (under 30 days) at 20%. Expected to clear 85% of target inventory.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 48 * 60 * 60 * 1000),
      agentId: crossStore.id,
      agentName: crossStore.name,
      agentCategory: 'executive-insights',
      eventType: 'routine-operation',
      description: 'Cross-store analysis shows tiered approach outperforming flat discount by 22%. Auckland CBD leading with 94% sell-through. Recommend standardizing approach.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 72 * 60 * 60 * 1000),
      agentId: financialMonitor.id,
      agentName: financialMonitor.name,
      agentCategory: 'executive-insights',
      eventType: 'routine-operation',
      description: 'Promotion concluded. Final ROI: +12% (improved from initial -8%). Total margin protected: $52K. Inventory clearance: 89%. Incident resolved successfully.',
    },
  ];

  return {
    id: incidentId,
    title: 'Promotion Margin Recovery - Winter Clearance',
    description: 'AI agents detected underperforming promotion and automatically optimized pricing strategy, recovering projected margin loss and exceeding clearance targets.',
    severity: 'medium',
    status: 'resolved',
    startedAt: startDate,
    resolvedAt: new Date(startDate.getTime() + 72 * 60 * 60 * 1000),
    affectedStores: stores,
    relatedAgentIds: timeline.map(t => t.agentId),
    timeline,
    financialImpact: 52000,
  };
}

// Incident 3: Customer Service Excellence
function createCustomerServiceIncident(): Incident {
  const incidentId = 'INC-2024-003';
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);

  const feedbackAnalyzer = getAgentByName('Customer Feedback Analyzer')!;
  const inquiryHandler = getAgentByName('Customer Inquiry Handler')!;
  const returnsAgent = getAgentByName('Returns Processing Agent')!;
  const loyaltyManager = getAgentByName('Loyalty Program Manager')!;
  const staffScheduler = getAgentByName('Staff Scheduling Optimizer')!;

  const timeline: IncidentTimelineEvent[] = [
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime()),
      agentId: feedbackAnalyzer.id,
      agentName: feedbackAnalyzer.name,
      agentCategory: 'customer-service-returns',
      eventType: 'customer-complaint',
      description: 'Detected surge in negative feedback related to long wait times at Auckland CBD flagship. NPS dropped 15 points in past 6 hours. 45 complaints logged.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 1 * 60 * 60 * 1000),
      agentId: inquiryHandler.id,
      agentName: inquiryHandler.name,
      agentCategory: 'customer-service-returns',
      eventType: 'customer-resolution',
      description: 'Automated customer outreach initiated for affected customers. Personalized apology messages with 15% discount codes sent to 45 customers. 38 acknowledged within 2 hours.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 2 * 60 * 60 * 1000),
      agentId: staffScheduler.id,
      agentName: staffScheduler.name,
      agentCategory: 'store-operations',
      eventType: 'staff-scheduling',
      description: 'Identified root cause: staffing 25% below requirement during peak hours due to scheduling error. Activated on-call staff pool. 4 additional team members deployed within 90 minutes.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 4 * 60 * 60 * 1000),
      agentId: returnsAgent.id,
      agentName: returnsAgent.name,
      agentCategory: 'customer-service-returns',
      eventType: 'return-spike',
      description: 'Returns queue cleared. Average wait time reduced from 22 minutes to 6 minutes. Express returns lane activated for loyalty members.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 8 * 60 * 60 * 1000),
      agentId: loyaltyManager.id,
      agentName: loyaltyManager.name,
      agentCategory: 'customer-service-returns',
      eventType: 'customer-resolution',
      description: 'Follow-up campaign complete. 42 of 45 affected customers redeemed compensation offer. 3 escalated to VIP recovery program. Customer retention projected at 95%.',
    },
  ];

  return {
    id: incidentId,
    title: 'Customer Service Recovery - Auckland CBD',
    description: 'AI agents detected customer satisfaction drop, identified root cause, coordinated immediate staffing response, and executed customer recovery campaign.',
    severity: 'high',
    status: 'resolved',
    startedAt: startDate,
    resolvedAt: new Date(startDate.getTime() + 10 * 60 * 60 * 1000),
    affectedStores: stores.filter(s => s.name.includes('Auckland CBD')),
    relatedAgentIds: timeline.map(t => t.agentId),
    timeline,
    financialImpact: 8500,
  };
}

// Incident 4: Demand Forecast Success
function createDemandForecastIncident(): Incident {
  const incidentId = 'INC-2024-004';
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 5);

  const demandForecaster = getAgentByName('Demand Forecaster')!;
  const stockMonitor = getAgentByName('Stock Level Monitor')!;
  const warehouseSync = getAgentByName('Warehouse Sync Agent')!;
  const competitorMonitor = getAgentByName('Competitor Price Monitor')!;

  const timeline: IncidentTimelineEvent[] = [
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime()),
      agentId: demandForecaster.id,
      agentName: demandForecaster.name,
      agentCategory: 'inventory-intelligence',
      eventType: 'demand-forecast',
      description: 'Predicted 85% surge in outdoor furniture demand based on weather forecast (extended warm spell) and social media trend analysis. Confidence: 92%.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 4 * 60 * 60 * 1000),
      agentId: competitorMonitor.id,
      agentName: competitorMonitor.name,
      agentCategory: 'pricing-promotions',
      eventType: 'promotion-performance',
      description: 'Competitor analysis confirms opportunity: Major competitors showing low inventory on outdoor category. Window for market share capture: 72 hours.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 8 * 60 * 60 * 1000),
      agentId: warehouseSync.id,
      agentName: warehouseSync.name,
      agentCategory: 'inventory-intelligence',
      eventType: 'routine-operation',
      description: 'Proactive inventory positioning complete. 450 units of outdoor furniture redistributed to high-demand stores. All stores above 200% safety stock.',
    },
    {
      id: faker.string.uuid(),
      timestamp: new Date(startDate.getTime() + 72 * 60 * 60 * 1000),
      agentId: stockMonitor.id,
      agentName: stockMonitor.name,
      agentCategory: 'inventory-intelligence',
      eventType: 'routine-operation',
      description: 'Demand surge materialized as predicted (actual: 82% vs forecast 85%). Zero stockouts achieved. Captured estimated $95K in sales that would have gone to competitors.',
    },
  ];

  return {
    id: incidentId,
    title: 'Proactive Demand Response - Outdoor Category',
    description: 'AI-driven demand forecasting successfully predicted and prepared for seasonal surge, capturing significant market share while competitors experienced stockouts.',
    severity: 'info',
    status: 'resolved',
    startedAt: startDate,
    resolvedAt: new Date(startDate.getTime() + 96 * 60 * 60 * 1000),
    affectedStores: stores,
    relatedAgentIds: timeline.map(t => t.agentId),
    timeline,
    financialImpact: 95000,
  };
}

// Generate all incidents
const incidents: Incident[] = [
  createSupplyChainIncident(),
  createPromotionIncident(),
  createCustomerServiceIncident(),
  createDemandForecastIncident(),
];

export function getIncidents(filters?: { status?: IncidentStatus; severity?: EventSeverity }): Incident[] {
  let filtered = incidents;

  if (filters?.status) {
    filtered = filtered.filter(i => i.status === filters.status);
  }

  if (filters?.severity) {
    filtered = filtered.filter(i => i.severity === filters.severity);
  }

  return filtered;
}

export function getIncidentById(id: string): Incident | undefined {
  return incidents.find(i => i.id === id);
}

export function getActiveIncidents(): Incident[] {
  return incidents.filter(i => i.status !== 'resolved');
}

export function getIncidentsByAgent(agentId: string): Incident[] {
  return incidents.filter(i => i.relatedAgentIds.includes(agentId));
}

export function getIncidentTimeline(incidentId: string): IncidentTimelineEvent[] {
  const incident = getIncidentById(incidentId);
  return incident?.timeline || [];
}

export { incidents };
