const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const startupLog = path.join(logDir, 'startup.log');

function log(line) {
  const ts = new Date().toISOString();
  fs.appendFileSync(startupLog, `[${ts}] ${line}\n`);
}

let restartCount = 0;
let backoffMs = 1000; // 1s inicial

function startBot() {
  log('Iniciando bot via wrapper.');
  const child = spawn(process.execPath, [path.join(__dirname, '../src/index.cjs')], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    log(`Processo do bot saiu. code=${code} signal=${signal}. Reiniciando em ${backoffMs}ms.`);
    restartCount += 1;
    setTimeout(startBot, backoffMs);
    // backoff exponencial com teto
    backoffMs = Math.min(backoffMs * 2, 60 * 1000);
  });

  child.on('error', (err) => {
    log(`Erro ao iniciar processo do bot: ${err.message}`);
    setTimeout(startBot, backoffMs);
    backoffMs = Math.min(backoffMs * 2, 60 * 1000);
  });
}

startBot();