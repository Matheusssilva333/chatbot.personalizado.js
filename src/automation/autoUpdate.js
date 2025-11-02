const { setupLogger } = require('../utils/logger');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const logger = setupLogger();
const configPath = path.join(__dirname, '../../data/config.json');

function loadConfig() {
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

function checkForUpdates(cb) {
  const cfg = loadConfig();
  if (!cfg.autoUpdate) return cb && cb(null, { enabled: false });
  if (cfg.updateSource === 'git' && fs.existsSync(path.join(process.cwd(), '.git'))) {
    exec('git fetch --all', { cwd: process.cwd() }, (err) => {
      if (err) {
        logger.warn('Falha ao buscar atualizações git.');
        return cb && cb(err);
      }
      exec('git rev-parse HEAD', { cwd: process.cwd() }, (err2, head) => {
        exec(`git rev-parse origin/${cfg.updateBranch}`, { cwd: process.cwd() }, (err3, remoteHead) => {
          if (err2 || err3) return cb && cb(err2 || err3);
          const changed = String(head).trim() !== String(remoteHead).trim();
          cb && cb(null, { enabled: true, changed });
        });
      });
    });
  } else {
    cb && cb(null, { enabled: false });
  }
}

function performUpdate(cb) {
  const cfg = loadConfig();
  if (!(cfg.autoUpdate && cfg.updateSource === 'git')) return cb && cb(null, false);
  exec(`git pull origin ${cfg.updateBranch}`, { cwd: process.cwd() }, (err, stdout, stderr) => {
    if (err) {
      logger.warn('Falha ao aplicar atualização git.');
      return cb && cb(err);
    }
    // opcional: instalar dependências
    exec('npm install --silent', { cwd: process.cwd() }, (err2) => {
      if (err2) {
        logger.warn('Falha ao atualizar dependências após pull.');
      }
      cb && cb(null, true);
    });
  });
}

module.exports = { loadConfig, checkForUpdates, performUpdate };