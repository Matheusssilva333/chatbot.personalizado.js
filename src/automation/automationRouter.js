const { setupLogger } = require('../utils/logger');
const { generateContextualResponse } = require('../utils/contextualResponses');
const { identifyProblem, generateSolution } = require('../utils/problemSolver');
const { getRelevantContext } = require('../utils/learningSystem');
const { logInteraction } = require('../utils/performanceReports');

const logger = setupLogger();

// Palavras-chave simples para classificação inicial
const INTENT_KEYWORDS = {
  minecraft: ['minecraft', 'servidor', 'seed', 'craft', 'lag', 'fps'],
  moderacao: ['moderação', 'moderacao', 'ban', 'timeout', 'limpar', 'regras'],
  xadrez: ['xadrez', 'chess', 'carlsen', 'tabuleiro', 'estratégia'],
  filosofia: ['filosofia', 'hegel', 'kant', 'intelectual', 'pensamento'],
  ajuda: ['ajuda', 'help', 'socorro'],
  erro: ['erro', 'bug', 'falha', 'quebrou'],
  saudacao: ['oi', 'olá', 'ola', 'hey', 'e aí'],
  despedida: ['tchau', 'adeus', 'até logo']
};

function scoreIntent(message) {
  const content = String(message || '').toLowerCase();
  let best = { intent: 'desconhecido', score: 0 };
  for (const [intent, words] of Object.entries(INTENT_KEYWORDS)) {
    let s = 0;
    for (const w of words) {
      if (content.includes(w)) s += 1;
    }
    if (s > best.score) best = { intent, score: s };
  }
  // Pequenas heurísticas
  if (best.intent === 'desconhecido' && /\?$/.test(content)) {
    best = { intent: 'ajuda', score: 1 };
  }
  return best;
}

function routeToModule(intent, message, userId, channel) {
  const context = getRelevantContext(userId, message);
  const actions = { handled: false, response: null, actionsPerformed: [] };

  try {
    switch (intent) {
      case 'saudacao': {
        actions.response = generateContextualResponse('oi', context);
        actions.handled = true;
        break;
      }
      case 'despedida': {
        actions.response = generateContextualResponse('tchau', context);
        actions.handled = true;
        break;
      }
      case 'ajuda': {
        actions.response =
          'Posso ajudar com comandos e dúvidas padrão: use `/minecraft`, `/xadrez`, `/filosofia` ou `/moderacao`. Diga “Luana” e sua pergunta.';
        actions.handled = true;
        break;
      }
      case 'minecraft': {
        const p = identifyProblem(message);
        if (p) {
          const sol = generateSolution(p);
          if (sol && sol.response) {
            actions.response = sol.response;
            actions.actionsPerformed.push(`solution:${p}`);
            actions.handled = true;
          }
        }
        if (!actions.response) {
          actions.response = generateContextualResponse('minecraft', context);
          actions.handled = true;
        }
        break;
      }
      case 'filosofia': {
        actions.response = generateContextualResponse('filosofia', context);
        actions.handled = true;
        break;
      }
      case 'xadrez': {
        actions.response = generateContextualResponse('xadrez', context);
        actions.handled = true;
        break;
      }
      case 'moderacao': {
        actions.response = 'Para moderar, utilize `/moderacao timeout` ou `/moderacao limpar`. Posso orientar sem executar ações automaticamente.';
        actions.handled = true;
        break;
      }
      case 'erro': {
        actions.response = 'Detectei possível erro. Se puder, descreva o problema que ocorreu para que eu sugira correções ou passos.';
        actions.handled = true;
        break;
      }
      default: {
        // fallback seguro
        actions.response = generateContextualResponse(message, context);
        actions.handled = false;
      }
    }
  } catch (e) {
    logger.warn(`Falha no roteamento de automação: ${e && e.message ? e.message : e}`);
  }

  return actions;
}

async function autoRespondStandardCases(message, userId, channel) {
  const { intent, score } = scoreIntent(message);
  if (score <= 0) return null;
  const routed = routeToModule(intent, message, userId, channel);
  // Evita ruído: responder apenas para intent com confiança mínima
  if (routed && routed.response && score >= 1) {
    try {
      await channel.sendTyping();
      await new Promise(r => setTimeout(r, 600));
      await channel.send(routed.response);
      logInteraction({ type: 'conversation', responseTime: 600, success: true });
    } catch (e) {
      logger.warn('Falha ao enviar resposta automática, mantendo fallback silencioso.');
    }
    return routed.response;
  }
  return null;
}

module.exports = {
  scoreIntent,
  routeToModule,
  autoRespondStandardCases
};