const fs = require('fs');
const path = require('path');
const { setupLogger } = require('../utils/logger');
const { summarize } = require('../utils/performanceReports');
const { addExpression } = require('../utils/contextualResponses');
const { setCooldown } = require('../utils/needsAnticipation');

const logger = setupLogger();
const configPath = path.join(__dirname, '../../data/automation.json');

let config = {
  anticipationCooldownMs: 5 * 60 * 1000,
  maxResponseTimeTargetMs: 1500,
  minSuccessRatePercent: 80
};

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  } catch (e) {
    logger.warn('Falha ao carregar config de automação, usando defaults.');
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (e) {
    logger.warn('Falha ao salvar config de automação.');
  }
}

function optimizeParameters() {
  loadConfig();
  const s = summarize();
  const { successRatePercent, responseTimeMs } = s.averages;

  // Ajuste suave de cooldown de antecipação
  if (successRatePercent >= config.minSuccessRatePercent && responseTimeMs <= config.maxResponseTimeTargetMs) {
    // aumentar levemente a proatividade (reduzir cooldown) com limite inferior
    config.anticipationCooldownMs = Math.max(60 * 1000, config.anticipationCooldownMs - 60 * 1000);
  } else {
    // reduzir proatividade (aumentar cooldown) com limite superior
    config.anticipationCooldownMs = Math.min(20 * 60 * 1000, config.anticipationCooldownMs + 60 * 1000);
  }

  saveConfig();
  logger.info(`Auto-otimização: cooldown antecipação ajustado para ${config.anticipationCooldownMs}ms.`);
  try { setCooldown(config.anticipationCooldownMs); } catch {}

  // Atualização incremental de banco de expressões (conhecimento)
  try {
    // Exemplo simples: adicionar uma variação de saudação baseada no sucesso recente
    if (successRatePercent > 85) {
      addExpression('greetings', 'Olá! Posso cuidar disso de forma automática para você.');
    }
  } catch (e) {
    // Não bloquear em caso de falha
  }
}

module.exports = { optimizeParameters };