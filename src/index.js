// Bot Discord Luana - Assistente de IA com personalidade intelectual e reflexiva
// Arquivo principal (entrypoint): inicialização do cliente Discord, carregamento de comandos/eventos,
// configuração de módulos de IA, telemetria e robustez com tratamento de erros.
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { setupLogger } from './utils/logger.js';
import { initLearningSystem } from './utils/learningSystem.js';
import { initExpressions } from './utils/contextualResponses.js';
import { initLinguisticVariety } from './utils/linguisticVariety.js';
import { initProblemSolver } from './utils/problemSolver.js';
import { initSelfCorrection } from './utils/selfCorrection.js';
import { initPerformanceReports as initPerformanceReportsUtil } from './utils/performanceReports.js';
import { generatePerformanceReport } from './monitoring/performanceReports.js';
import { initNeedsAnticipation } from './utils/needsAnticipation.js';
import { initPersonalization, flushToDisk, getMetrics } from './utils/personalizationEngine.js';
import { initScheduler } from './automation/scheduler.js';
import ResponseGenerator from './conversation/responseGenerator.js';

// Configuração do ambiente
config();
const logger = setupLogger();
const responseGenerator = new ResponseGenerator();

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
  
  (async () => {
    for (const file of commandFiles) {
      const filePath = `file://${path.join(commandsPath, file)}`;
      const command = await import(filePath);
      
      if (command.default && 'data' in command.default && 'execute' in command.default) {
        client.commands.set(command.default.data.name, command.default);
        logger.info(`Comando carregado: ${command.default.data.name}`);
      } else {
        logger.warn(`O comando em ${filePath} está faltando a propriedade "data" ou "execute" obrigatória, ou o default export está ausente.`);
      }
    }
  })();
} catch (error) {
  logger.error(`Erro ao carregar comandos: ${error.message}`);
}

// Carregamento de eventos
try {
  const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
  
  (async () => {
    for (const file of eventFiles) {
      const filePath = `file://${path.join(eventPath, file)}`;
      const event = await import(filePath);
      
      if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args, responseGenerator));
      } else {
        client.on(event.default.name, (...args) => event.default.execute(...args, responseGenerator));
      }
      
      logger.info(`Evento carregado: ${event.default.name}`);
    }
  })();
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
  initPerformanceReportsUtil();
  initNeedsAnticipation();
  initPersonalization({ logsFilePath: path.join(__dirname, '../logs/combined.log') });
  logger.info('Módulos de aprendizado, respostas, variedade linguística, solução de problemas, auto-correção e relatórios inicializados.');

  // Scheduler centralizado para automações recorrentes
  initScheduler(client);

  // Agendar relatório diário básico
  setInterval(() => {
    try {
      const report = generatePerformanceReport();
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