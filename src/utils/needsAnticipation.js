import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
const patternsFile = path.join(dataDir, 'anticipation.json');

const HELP_KEYWORDS = ['ajuda','como','não consigo','erro','problema','lag','status','servidor','online','conexão'];
const SERVER_KEYWORDS = ['status','servidor','lag','jogadores','online','conexão'];
let COOLDOWN_MS = 30 * 60 * 1000; // 30 minutos por canal/padrão (ajustável)

// Controle simples de cooldown em memória
let lastTriggered = {};

let patternsDB = [
  {
    id: 'peak_hours',
    description: 'Horários de pico à noite (somente se o usuário falar de servidor/status)',
    match: (ctx) => {
      const hour = new Date(ctx.timestamp || Date.now()).getHours();
      const msg = (ctx.message || '').toLowerCase();
      const mentionsServer = SERVER_KEYWORDS.some(k => msg.includes(k));
      return hour >= 18 && hour <= 23 && mentionsServer;
    },
    action: { type: 'server_status_check', message: 'Estamos em horário de pico. Deseja que eu verifique o status do servidor?' }
  },
  {
    id: 'help_keywords',
    description: 'Detecta intenção de pedir ajuda',
    match: (ctx) => {
      const m = (ctx.message || '').toLowerCase();
      return HELP_KEYWORDS.some(k => m.includes(k));
    },
    action: { type: 'offer_help', message: 'Posso ajudar com instruções ou automatizações. Quer tentar uma solução agora?' }
  }
];

function initNeedsAnticipation() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(patternsFile)) {
      const fileData = JSON.parse(fs.readFileSync(patternsFile, 'utf8'));
      if (Array.isArray(fileData)) patternsDB = fileData;
    } else {
      fs.writeFileSync(patternsFile, JSON.stringify(patternsDB, null, 2));
    }
    // Integrar ajuste automático se existir data/automation.json
    const automationConfigPath = path.join(dataDir, 'automation.json');
    if (fs.existsSync(automationConfigPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(automationConfigPath, 'utf8'));
        if (cfg && typeof cfg.anticipationCooldownMs === 'number' && cfg.anticipationCooldownMs > 0) {
          COOLDOWN_MS = cfg.anticipationCooldownMs;
        }
      } catch {}
    }
  } catch (error) {
    console.error('Erro ao inicializar padrões de antecipação:', error);
  }
}

function canTrigger(patternId, context) {
  const key = `${patternId}:${context.channelId || 'global'}`;
  const last = lastTriggered[key] || 0;
  return Date.now() - last >= COOLDOWN_MS;
}

function anticipateNeeds(context) {
  const actions = [];
  for (const p of patternsDB) {
    try {
      if (typeof p.match === 'function' && p.match(context) && canTrigger(p.id, context)) {
        actions.push({ id: p.id, action: p.action });
      }
    } catch {}
  }
  return actions;
}

async function executeAnticipatedAction(item, channel, context = {}) {
  // Implementação simplificada: enviar mensagem com sugestão
  if (!item || !channel) return false;
  const content = item.action?.message || 'Posso ajudar com isso. Quer que eu execute algo?';
  try {
    await channel.send(content);
    const key = `${item.id}:${context.channelId || 'global'}`;
    lastTriggered[key] = Date.now();
    return true;
  } catch (error) {
    console.error('Erro ao executar ação antecipada:', error);
    return false;
  }
}

function addPattern(pattern) {
  if (!pattern || !pattern.id) return false;
  if (patternsDB.some(p => p.id === pattern.id)) return false;
  patternsDB.push(pattern);
  try {
    fs.writeFileSync(patternsFile, JSON.stringify(patternsDB, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar novo padrão de antecipação:', error);
    return false;
  }
}

function setCooldown(ms) {
  if (typeof ms === 'number' && ms > 0) COOLDOWN_MS = ms;
}

export {
  initNeedsAnticipation,
  anticipateNeeds,
  executeAnticipatedAction,
  addPattern,
  setCooldown
};