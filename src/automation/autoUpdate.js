import { setupLogger } from '../utils/logger.js';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const logger = setupLogger();
const configPath = path.join(__dirname, '../../data/config.json');

export function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      const defaults = {
        autoUpdate: false,
        updateSource: 'git',
        updateBranch: 'main'
      };
      fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2));
      return defaults;
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return { autoUpdate: false, updateSource: 'git', updateBranch: 'main' };
  }
}

export function saveConfig(newConfig) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  } catch (e) {
    logger.error(`Erro ao salvar configuração de auto-atualização: ${e.message}`);
  }
}

export function checkAndApplyUpdate() {
  const config = loadConfig();
  if (!config.autoUpdate) {
    logger.info('Auto-atualização desativada.');
    return;
  }

  logger.info(`Verificando atualizações na branch ${config.updateBranch}...`);

  exec(`git pull origin ${config.updateBranch}`, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Erro ao puxar atualizações: ${error.message}`);
      return;
    }
    if (stderr) {
      logger.warn(`Git stderr: ${stderr}`);
    }
    logger.info(`Git stdout: ${stdout}`);

    if (stdout.includes('Already up to date.')) {
      logger.info('Repositório já atualizado.');
    } else {
      logger.info('Atualizações encontradas e aplicadas. Reiniciando...');
      // Aqui você pode adicionar lógica para reiniciar o bot, se necessário
      // Por exemplo, process.exit(0) ou um mecanismo de reinício mais robusto
    }
  });
}