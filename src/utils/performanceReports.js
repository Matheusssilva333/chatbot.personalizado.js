const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const reportsDir = path.join(dataDir, 'reports');
const statsFile = path.join(dataDir, 'performance.json');

let stats = {
  interactions: { conversation: 0, command: 0 },
  successes: 0,
  failures: 0,
  responseTimes: [],
  lastReset: Date.now()
};

function initPerformanceReports() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    if (fs.existsSync(statsFile)) {
      stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    } else {
      fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
    }
  } catch (error) {
    console.error('Erro ao inicializar relatórios de desempenho:', error);
  }
}

function logInteraction({ type, command = null, responseTime = 0, success = true }) {
  if (type === 'conversation') stats.interactions.conversation += 1;
  if (type === 'command') stats.interactions.command += 1;
  if (success) stats.successes += 1; else stats.failures += 1;
  if (Number.isFinite(responseTime)) stats.responseTimes.push(responseTime);
  // Limitar histórico para evitar crescimento infinito
  if (stats.responseTimes.length > 1000) stats.responseTimes.splice(0, stats.responseTimes.length - 1000);
  try {
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Erro ao registrar interação de desempenho:', error);
  }
}

function summarize() {
  const total = stats.successes + stats.failures;
  const avgResponse = stats.responseTimes.length > 0
    ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
    : 0;
  const successRate = total > 0 ? Math.round((stats.successes / total) * 100) : 0;
  return {
    timestamp: Date.now(),
    totals: {
      conversations: stats.interactions.conversation,
      commands: stats.interactions.command,
      successes: stats.successes,
      failures: stats.failures
    },
    averages: {
      responseTimeMs: avgResponse,
      successRatePercent: successRate
    }
  };
}

function generateDailyReport() {
  const report = summarize();
  const file = path.join(reportsDir, `daily-${new Date().toISOString().slice(0,10)}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('Erro ao salvar relatório diário:', error);
  }
  return report;
}

function generateWeeklyReport() {
  const report = summarize();
  const weekId = `${new Date().getFullYear()}-W${Math.ceil((new Date().getDate())/7)}`;
  const file = path.join(reportsDir, `weekly-${weekId}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('Erro ao salvar relatório semanal:', error);
  }
  return report;
}

function resetStatistics() {
  stats = {
    interactions: { conversation: 0, command: 0 },
    successes: 0,
    failures: 0,
    responseTimes: [],
    lastReset: Date.now()
  };
  try {
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Erro ao reiniciar estatísticas de desempenho:', error);
  }
}

module.exports = {
  initPerformanceReports,
  logInteraction,
  generateDailyReport,
  generateWeeklyReport,
  resetStatistics
};