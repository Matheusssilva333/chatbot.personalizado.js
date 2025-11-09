import { setupLogger } from '../utils/logger.js';
import { generateDailyReport, generateWeeklyReport } from '../utils/performanceReports.js';
import { optimizeParameters } from './selfOptimizer.js';
import { checkAndAlert } from './alerts.js';
import { notifyStatus } from './statusNotifier.js';
import { monitorResources } from './processMonitor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = setupLogger();

function initScheduler(client) {
  // Relatório diário
  setInterval(() => {
    try {
      const report = generateDailyReport();
      logger.info(`Relatório diário gerado: sucesso=${report.totals.successes} falhas=${report.totals.failures}`);
    } catch (e) {
      logger.warn('Falha ao gerar relatório diário no scheduler.');
    }
  }, 24 * 60 * 60 * 1000);

  // Relatório semanal
  setInterval(() => {
    try {
      const report = generateWeeklyReport();
      logger.info(`Relatório semanal gerado: conversations=${report.totals.conversations} commands=${report.totals.commands}`);
    } catch (e) {
      logger.warn('Falha ao gerar relatório semanal no scheduler.');
    }
  }, 7 * 24 * 60 * 60 * 1000);

  // Otimização horária de parâmetros operacionais
  setInterval(() => {
    try {
      optimizeParameters();
    } catch (e) {
      logger.warn('Falha ao otimizar parâmetros automaticamente.');
    }
  }, 60 * 60 * 1000);

  // Verificação de alertas a cada 15 minutos
  setInterval(() => {
    try {
      checkAndAlert(client);
    } catch (e) {
      logger.warn('Falha ao verificar alertas automáticos.');
    }
  }, 15 * 60 * 1000);

  // Notificação de status a cada 30 minutos
  setInterval(() => {
    try {
      notifyStatus(client);
    } catch (e) {
      logger.warn('Falha ao enviar notificação de status.');
    }
  }, 30 * 60 * 1000);

  // Monitor de recursos a cada 1 minuto
  setInterval(() => {
    try {
      const cfgPath = path.join(__dirname, '../../data/config.json');
      let memLimit = 100;
      if (fs.existsSync(cfgPath)) {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        if (cfg && typeof cfg.memoryLimitMB === 'number') memLimit = cfg.memoryLimitMB;
      }
      monitorResources({ memoryLimitMB: memLimit });
    } catch (e) {
      logger.warn('Falha ao monitorar recursos automaticamente.');
    }
  }, 60 * 1000);
}

export { initScheduler };