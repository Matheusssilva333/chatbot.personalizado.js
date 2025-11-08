const os = require('os');
const { setupLogger } = require('../utils/logger');
const { summarize } = require('../utils/performanceReports');

const logger = setupLogger();

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
}

function notifyStatus(client) {
  try {
    const sum = summarize();
    const mem = process.memoryUsage();
    const rss = formatBytes(mem.rss);
    const heapUsed = formatBytes(mem.heapUsed);
    const uptime = Math.floor(process.uptime());
    const msg = `Status: uptime=${uptime}s, mem(rss)=${rss}, heap=${heapUsed}, successRate=${sum.averages.successRatePercent}%, rt=${sum.averages.responseTimeMs}ms, conversations=${sum.totals.conversations}, commands=${sum.totals.commands}`;
    logger.info(msg);
    const channelId = process.env.STATUS_CHANNEL_ID;
    if (channelId && client?.channels?.cache?.has(channelId)) {
      client.channels.cache.get(channelId).send(`📊 ${msg}`).catch(() => {});
    }
  } catch (e) {
    logger.warn('Falha ao notificar status.');
  }
}

module.exports = { notifyStatus };