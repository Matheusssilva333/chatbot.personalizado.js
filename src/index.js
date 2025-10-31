// Bot Discord Luana - Assistente de IA com personalidade intelectual e reflexiva
// Arquivo principal (entrypoint): inicialização do cliente Discord, carregamento de comandos/eventos,
// configuração de módulos de IA, telemetria e robustez com tratamento de erros.
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');
const { setupLogger } = require('./utils/logger');
const { initLearningSystem } = require('./utils/learningSystem');
const { initExpressions } = require('./utils/contextualResponses');
const { initLinguisticVariety } = require('./utils/linguisticVariety');
const { initProblemSolver } = require('./utils/problemSolver');
const { initSelfCorrection } = require('./utils/selfCorrection');
const { initPerformanceReports, generateDailyReport } = require('./utils/performanceReports');
const { initNeedsAnticipation } = require('./utils/needsAnticipation');
const { initPersonalization, flushToDisk, getMetrics } = require('./utils/personalizationEngine');

// Configuração do ambiente
config();
const logger = setupLogger();

// Configuração do cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Configuração de comandos
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const eventPath = path.join(__dirname, 'events');

// Carregamento de comandos
try {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      logger.info(`Comando carregado: ${command.data.name}`);
    } else {
      logger.warn(`O comando em ${filePath} está faltando a propriedade "data" ou "execute" obrigatória`);
    }
  }
} catch (error) {
  logger.error(`Erro ao carregar comandos: ${error.message}`);
}

// Carregamento de eventos
try {
  const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventPath, file);
    const event = require(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    
    logger.info(`Evento carregado: ${event.name}`);
  }
} catch (error) {
  logger.error(`Erro ao carregar eventos: ${error.message}`);
}

// Evento de login
client.once(Events.ClientReady, () => {
  logger.info(`Bot Luana está online! Logado como ${client.user.tag}`);
  // Inicialização dos módulos de IA e telemetria
  initLearningSystem();
  initExpressions();
  initLinguisticVariety();
  initProblemSolver();
  initSelfCorrection();
  initPerformanceReports();
  initNeedsAnticipation();
  initPersonalization({ logsFilePath: path.join(__dirname, '../logs/combined.log') });
  logger.info('Módulos de aprendizado, respostas, variedade linguística, solução de problemas, auto-correção e relatórios inicializados.');

  // Agendar relatório diário básico
  setInterval(() => {
    try {
      const report = generateDailyReport();
      logger.info('Relatório diário de desempenho gerado.');
    } catch (e) {
      logger.warn('Falha ao gerar relatório diário.');
    }
  }, 24 * 60 * 60 * 1000);

  // Flush periódico das métricas de personalização (a cada 60 minutos)
  setInterval(() => {
    try {
      const ok = flushToDisk();
      if (ok) {
        const snapshot = getMetrics();
        logger.info(`Personalização: flush concluído. Perfis=${snapshot.profilesCount}, média RT=${snapshot.avgResponseTimeMs.toFixed(0)}ms`);
      }
    } catch {}
  }, 60 * 60 * 1000);
});

// Boas práticas: validar variáveis de ambiente e tratar exceções globais
function validateEnv() {
  const required = ['DISCORD_TOKEN'];
  const missing = required.filter(k => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length) {
    const msg = `Variáveis de ambiente ausentes: ${missing.join(', ')}`;
    logger.error(msg);
    throw new Error(msg);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason && reason.message ? reason.message : String(reason)}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

// Login do bot
try {
  validateEnv();
  client.login(process.env.DISCORD_TOKEN).catch(error => {
    logger.error(`Erro ao fazer login: ${error.message}`);
  });
} catch (e) {
  logger.error(`Falha na inicialização: ${e.message}`);
}