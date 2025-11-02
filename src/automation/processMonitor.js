const { setupLogger } = require('../utils/logger');
const logger = setupLogger();

function getMemoryMB() {
  const rss = process.memoryUsage().rss; // Resident Set Size
  return rss / (1024 * 1024);
}

function monitorResources({ memoryLimitMB = 100 } = {}) {
  try {
    const mem = getMemoryMB();
    if (mem > memoryLimitMB) {
      logger.warn(`Memória acima do limite: ${mem.toFixed(1)}MB > ${memoryLimitMB}MB.`);
    }
  } catch (e) {
    logger.warn('Falha ao monitorar recursos.');
  }
}

module.exports = { monitorResources };