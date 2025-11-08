const { setupLogger } = require('../utils/logger');
const { logInteraction } = require('../utils/performanceReports');
const { getUserProfile } = require('../utils/personalizationEngine');
const { question } = require('../conversation/naturalness.cjs');

const logger = setupLogger();

// Simple FAQ dataset (can be expanded or learned)
const FAQ = [
  { id: 'faq_minecraft_servidor', keywords: ['minecraft', 'servidor'], replies: [
    'Para criar servidor, baixe o software oficial, configure server.properties e faça port forwarding (25565).',
    'Servidor Minecraft: escolha Java/Bedrock, aloque 2GB RAM, configure portas.',
    'Dica: use endereço IP direto e verifique firewall para conexões.'
  ]},
  { id: 'faq_comandos', keywords: ['comando', 'slash', 'discord'], replies: [
    'Use `/minecraft`, `/xadrez`, `/filosofia` e `/moderacao` após registrar comandos.',
    'Os comandos estão disponíveis globalmente; aguarde propagação e tente novamente.',
    'Se um comando falhar, verifique permissões do bot e reinicie.'
  ]},
  { id: 'faq_xadrez_dicas', keywords: ['xadrez', 'dicas'], replies: [
    'Controle o centro, desenvolva peças e roque cedo para segurança.',
    'Pratique táticas diariamente e estude finais básicos.',
    'Equilibre intuição e cálculo; revise partidas com espírito crítico.'
  ]},
];

function matchScore(content, keywords) {
  const c = String(content || '').toLowerCase();
  let s = 0; for (const k of keywords) { if (c.includes(k)) s += 1; }
  return s / Math.max(1, keywords.length); // 0..1
}

function identifyFAQ(content) {
  let best = null; let bestScore = 0;
  for (const f of FAQ) {
    const s = matchScore(content, f.keywords);
    if (s > bestScore) { best = f; bestScore = s; }
  }
  return bestScore >= 0.95 ? { faq: best, confidence: bestScore } : null; // target 95%
}

function evaluateTriggers(content, profile, contextWindow, topics) {
  const triggers = [];
  const faq = identifyFAQ(content);
  if (faq) { triggers.push({ type: 'faq', data: faq }); }

  // Standard orders (placeholder): detect "pedido" keyword
  if (String(content).toLowerCase().includes('pedido')) {
    triggers.push({ type: 'pedido_padrao' });
  }

  // Routing to specialized sectors by topics
  if (Array.isArray(topics) && topics.includes('moderacao')) {
    triggers.push({ type: 'roteamento', target: 'moderacao' });
  }

  // Info collection when missing nouns: ask basic info
  if (String(content).length < 15 && (!topics || topics.length === 0)) {
    triggers.push({ type: 'coleta_info', data: { question: question('Poderia me dar mais detalhes?') } });
  }

  // Action confirmation keyword
  if (/confirm(a|ar)/i.test(content)) {
    triggers.push({ type: 'confirmacao' });
  }

  return triggers;
}

async function runAutomations(content, userId, channel, context) {
  const profile = getUserProfile(userId);
  const triggers = evaluateTriggers(content, profile, context.window, context.topics);
  const performed = [];

  for (const t of triggers) {
    try {
      switch (t.type) {
        case 'faq': {
          const replies = t.data.faq.replies;
          const variant = replies[performed.length % replies.length];
          await channel.sendTyping();
          await new Promise(r => setTimeout(r, 500));
          await channel.send(variant);
          performed.push('faq');
          break;
        }
        case 'pedido_padrao': {
          await channel.send('Recebi seu pedido. Pode detalhar o tipo e prioridade?');
          performed.push('pedido');
          break;
        }
        case 'roteamento': {
          await channel.send('Vou encaminhar para o módulo adequado (moderação).');
          performed.push('roteamento');
          break;
        }
        case 'coleta_info': {
          await channel.send('Você pode compartilhar mais detalhes para eu ajudar melhor?');
          performed.push('coleta');
          break;
        }
        case 'confirmacao': {
          await channel.send('Confirmado. Deseja prosseguir com esta ação?');
          performed.push('confirmacao');
          break;
        }
      }
    } catch (e) {
      logger.warn('Falha em automação; continuando com fluxo principal.');
    }
  }

  if (performed.length > 0) {
    logInteraction({ type: 'automation', responseTime: 500, success: true });
  }
  return performed;
}

module.exports = {
  evaluateTriggers,
  runAutomations,
};