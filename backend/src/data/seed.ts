import { agents } from './generators/agents.js';
import { stores } from './generators/stores.js';
import { incidents } from './generators/incidents.js';
import { initConversations, conversations } from './generators/conversations.js';
import { initMetrics, dailyMetrics } from './generators/metrics.js';
import { initCosts, costRecords } from './generators/costs.js';
import { auditLogs, users } from './generators/audit.js';

export function seedAllData(): void {
  // Agents, stores, and incidents are generated on import

  // Initialize dependent data (order matters!)
  initConversations(); // Depends on agents, stores, incidents
  initMetrics();       // Depends on agents
  initCosts();         // Depends on agents, dailyMetrics

  // Audit logs and users are generated on import (depends on agents, stores, incidents)

  console.log('Data seeded:');
  console.log(`  - ${agents.length} agents (across 6 categories)`);
  console.log(`  - ${stores.length} stores`);
  console.log(`  - ${incidents.length} incidents`);
  console.log(`  - ${conversations.length} conversations`);
  console.log(`  - ${dailyMetrics.length} daily metrics`);
  console.log(`  - ${costRecords.length} cost records`);
  console.log(`  - ${auditLogs.length} audit logs`);
  console.log(`  - ${users.length} users`);
}

export {
  agents,
  stores,
  incidents,
  conversations,
  dailyMetrics,
  costRecords,
  auditLogs,
  users
};
