import { setupLogger } from '../utils/logger.js';
import { getMetrics } from '../utils/personalizationEngine.js';

const logger = setupLogger();

const issues = [];

export function recordProblematicInteraction({ userId, message, response, responseTimeMs, reason }) {
  issues.push({ ts: Date.now(), userId, message, response, responseTimeMs, reason });
  // Simple auto-adjust placeholder: log metrics snapshot for offline analysis
  const m = getMetrics();
  logger.warn(`Auto-aprimoramento: interação problemática registrada (motivo=${reason}). Média RT=${m.avgResponseTimeMs.toFixed(0)}ms.`);
}

export function getIssues(limit = 50) {
  return issues.slice(Math.max(0, issues.length - limit));
}