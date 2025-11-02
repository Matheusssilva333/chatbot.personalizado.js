const { setupLogger } = require('../utils/logger');
const { getMetrics } = require('../utils/personalizationEngine');

const logger = setupLogger();

const issues = [];

function recordProblematicInteraction({ userId, message, response, responseTimeMs, reason }) {
  issues.push({ ts: Date.now(), userId, message, response, responseTimeMs, reason });
  // Simple auto-adjust placeholder: log metrics snapshot for offline analysis
  const m = getMetrics();
  logger.warn(`Auto-aprimoramento: interação problemática registrada (motivo=${reason}). Média RT=${m.avgResponseTimeMs.toFixed(0)}ms.`);
}

function getIssues(limit = 50) {
  return issues.slice(Math.max(0, issues.length - limit));
}

module.exports = {
  recordProblematicInteraction,
  getIssues,
};