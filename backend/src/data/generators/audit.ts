import { faker } from '@faker-js/faker';
import type { AuditLog, User, UserRole } from '../../types/index.js';
import { agents } from './agents.js';
import { incidents } from './incidents.js';
import { stores } from './stores.js';

faker.seed(12350); // Different seed to avoid collision with incidents

// Retail-specific action types
const ACTION_TYPES = [
  // Agent actions
  'agent.created',
  'agent.updated',
  'agent.deleted',
  'agent.started',
  'agent.stopped',
  'agent.config.changed',
  // Incident actions
  'incident.detected',
  'incident.escalated',
  'incident.assigned',
  'incident.resolved',
  'incident.commented',
  // Alert actions
  'alert.triggered',
  'alert.acknowledged',
  'alert.dismissed',
  // Store actions
  'store.flagged',
  'store.cleared',
  // Report actions
  'report.generated',
  'report.exported',
  'report.scheduled',
  // User actions
  'user.login',
  'user.logout',
  // Policy actions
  'policy.updated',
  'policy.approved',
  // Threshold actions
  'threshold.adjusted',
  'threshold.breached',
];

// Generate users with retail-focused roles
const users: User[] = [
  // Admins (Loss Prevention Manager, IT Admin)
  {
    id: faker.string.uuid(),
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@retailco.co.nz',
    role: 'admin' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 1 })
  },
  {
    id: faker.string.uuid(),
    name: 'James Chen',
    email: 'james.chen@retailco.co.nz',
    role: 'admin' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 1 })
  },
  // Operators (Regional Managers, Store Supervisors)
  {
    id: faker.string.uuid(),
    name: 'Emma Thompson',
    email: 'emma.thompson@retailco.co.nz',
    role: 'operator' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 3 })
  },
  {
    id: faker.string.uuid(),
    name: 'Michael Roberts',
    email: 'michael.roberts@retailco.co.nz',
    role: 'operator' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 2 })
  },
  {
    id: faker.string.uuid(),
    name: 'Lisa Wang',
    email: 'lisa.wang@retailco.co.nz',
    role: 'operator' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 4 })
  },
  {
    id: faker.string.uuid(),
    name: 'David Patel',
    email: 'david.patel@retailco.co.nz',
    role: 'operator' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 1 })
  },
  // Viewers (Store Associates, Analysts)
  {
    id: faker.string.uuid(),
    name: 'Sophie Brown',
    email: 'sophie.brown@retailco.co.nz',
    role: 'viewer' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 5 })
  },
  {
    id: faker.string.uuid(),
    name: 'Ryan Cooper',
    email: 'ryan.cooper@retailco.co.nz',
    role: 'viewer' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 7 })
  },
  {
    id: faker.string.uuid(),
    name: 'Olivia Kim',
    email: 'olivia.kim@retailco.co.nz',
    role: 'viewer' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 3 })
  },
  {
    id: faker.string.uuid(),
    name: 'Thomas Wilson',
    email: 'thomas.wilson@retailco.co.nz',
    role: 'viewer' as UserRole,
    avatar: faker.image.avatar(),
    lastLoginAt: faker.date.recent({ days: 10 })
  },
];

function generateAuditLog(): AuditLog {
  const user = faker.helpers.arrayElement(users);
  const action = faker.helpers.arrayElement(ACTION_TYPES);

  let resource = 'system';
  let resourceId = '';
  let details: Record<string, unknown> = {};

  if (action.startsWith('agent.')) {
    const agent = faker.helpers.arrayElement(agents);
    resource = 'agent';
    resourceId = agent.id;
    details = {
      agentName: agent.name,
      category: agent.category,
    };

    if (action === 'agent.updated' || action === 'agent.config.changed') {
      details.changes = {
        field: faker.helpers.arrayElement(['temperature', 'maxTokens', 'systemPrompt', 'threshold']),
        oldValue: faker.lorem.word(),
        newValue: faker.lorem.word()
      };
    }
  } else if (action.startsWith('incident.')) {
    const incident = faker.helpers.arrayElement(incidents);
    resource = 'incident';
    resourceId = incident.id;
    details = {
      incidentTitle: incident.title,
      severity: incident.severity,
      status: incident.status,
    };

    if (action === 'incident.escalated') {
      details.escalatedTo = faker.helpers.arrayElement(['Regional Manager', 'Loss Prevention', 'Executive Team']);
    }
    if (action === 'incident.commented') {
      details.comment = faker.lorem.sentence();
    }
    if (action === 'incident.assigned') {
      const assignee = faker.helpers.arrayElement(users);
      details.assignedTo = assignee.name;
    }
  } else if (action.startsWith('alert.')) {
    const agent = faker.helpers.arrayElement(agents);
    resource = 'alert';
    resourceId = faker.string.uuid();
    details = {
      alertType: faker.helpers.arrayElement(['threshold_breach', 'anomaly_detected', 'pattern_match', 'critical_event']),
      agentName: agent.name,
      severity: faker.helpers.arrayElement(['critical', 'high', 'medium', 'low']),
    };
  } else if (action.startsWith('store.')) {
    const store = faker.helpers.arrayElement(stores);
    resource = 'store';
    resourceId = store.id;
    details = {
      storeName: store.name,
      region: store.region,
      reason: faker.helpers.arrayElement(['shrinkage_threshold', 'compliance_issue', 'performance_alert', 'security_concern']),
    };
  } else if (action.startsWith('report.')) {
    resource = 'report';
    resourceId = faker.string.uuid();
    details = {
      reportType: faker.helpers.arrayElement(['daily_summary', 'incident_report', 'performance_analysis', 'cost_breakdown', 'shrinkage_report']),
      format: faker.helpers.arrayElement(['pdf', 'xlsx', 'csv']),
      scope: faker.helpers.arrayElement(['all_stores', 'region', 'single_store']),
    };
  } else if (action.startsWith('user.')) {
    resource = 'user';
    resourceId = user.id;
    details = {
      ip: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      location: faker.helpers.arrayElement(['Auckland', 'Wellington', 'Christchurch', 'Hamilton']),
    };
  } else if (action.startsWith('policy.')) {
    resource = 'policy';
    resourceId = faker.string.uuid();
    details = {
      policyName: faker.helpers.arrayElement(['return-policy', 'discount-threshold', 'void-limit', 'shrinkage-tolerance', 'escalation-rules']),
      change: faker.lorem.sentence(),
    };
  } else if (action.startsWith('threshold.')) {
    const agent = faker.helpers.arrayElement(agents);
    resource = 'threshold';
    resourceId = faker.string.uuid();
    details = {
      thresholdType: faker.helpers.arrayElement(['shrinkage_limit', 'return_rate', 'void_frequency', 'discount_depth']),
      agentName: agent.name,
      oldValue: faker.number.int({ min: 1, max: 10 }),
      newValue: faker.number.int({ min: 1, max: 10 }),
    };
  }

  return {
    id: faker.string.uuid(),
    timestamp: faker.date.recent({ days: 30 }),
    userId: user.id,
    userName: user.name,
    action,
    resource,
    resourceId,
    details
  };
}

// Generate audit logs
const auditLogs: AuditLog[] = Array.from({ length: 200 }, generateAuditLog)
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

export function getAuditLogs(filters?: {
  action?: string;
  resource?: string;
  userId?: string;
}): AuditLog[] {
  let result = auditLogs;

  if (filters?.action) {
    result = result.filter(l => l.action === filters.action);
  }
  if (filters?.resource) {
    result = result.filter(l => l.resource === filters.resource);
  }
  if (filters?.userId) {
    result = result.filter(l => l.userId === filters.userId);
  }

  return result;
}

export function getUsers(): User[] {
  return users;
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export { auditLogs, users };
