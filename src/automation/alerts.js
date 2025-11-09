import { setupLogger } from '../utils/logger.js';
import { summarize } from '../utils/performanceReports.js';

const logger = setupLogger();

export function checkAndAlert(client) {
  try {
    const summary = summarize();
    const { successRatePercent, responseTimeMs } = summary.averages;
    const failures = summary.totals.failures;
    const conversations = summary.totals.conversations;

    // Regras simples de alerta
    const alerts = [];
    if (successRatePercent < 70 && conversations > 10) {
      alerts.push(`Taxa de sucesso baixa (${successRatePercent}%).`);
    }
    if (responseTimeMs > 2000 && conversations > 10) {
      alerts.push(`Tempo médio de resposta elevado (${responseTimeMs}ms).`);
    }
    if (failures > 5) {
      alerts.push(`Falhas acumuladas acima do normal (${failures}).`);
    }

    if (alerts.length > 0) {
      logger.warn(`Alertas automáticos: ${alerts.join(' ')}`);
      const channelId = process.env.ALERT_CHANNEL_ID;
      if (channelId && client && client.channels && client.channels.cache.has(channelId)) {
        const channel = client.channels.cache.get(channelId);
        channel.send(`⚠️ Monitoramento: ${alerts.join(' ')}`).catch(() => {
          // Fallback seguro: apenas logar
        });
      }
    }
  } catch (e) {
    logger.warn('Falha ao gerar alertas automáticos.');
  }
}