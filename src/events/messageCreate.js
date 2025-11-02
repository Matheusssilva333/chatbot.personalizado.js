const { Events } = require('discord.js');
const { setupLogger } = require('../utils/logger');
const { getRelevantContext, learnFromInteraction } = require('../utils/learningSystem');
const { buildContext } = require('../conversation/contextEngine');
const { rememberInteraction } = require('../conversation/memory');
const { generateFormulations, computeDelayMs, applyTone } = require('../conversation/naturalness');
const { isRepetitive, detectTopicShift } = require('../conversation/contextVerifier');
const { runAutomations } = require('../automation/intelligentAutomation');
const { recordProblematicInteraction } = require('../automation/selfImprovement');
const { generateContextualResponse } = require('../utils/contextualResponses');
const { enrichText, varyStructure } = require('../utils/linguisticVariety');
const { identifyProblem, generateSolution } = require('../utils/problemSolver');
const { anticipateNeeds, executeAnticipatedAction } = require('../utils/needsAnticipation');
const { detectError, generateCorrection, logError } = require('../utils/selfCorrection');
const { logInteraction } = require('../utils/performanceReports');
const { getPersonalizationOptions, trackMessage, recordOutcome, recordContextData } = require('../utils/personalizationEngine');
const { extractEntities } = require('../conversation/entities');
const { autoRespondStandardCases, routeToModule, scoreIntent } = require('../automation/automationRouter');

const logger = setupLogger();

module.exports = {
  name: Events.MessageCreate,
  once: false,
  execute: async function (message) {
    // Ignorar mensagens de bots
    if (message.author.bot) return;

    const isMentioned = message.mentions.has(message.client.user.id);
    const conteudoLower = message.content.toLowerCase();
    const contemLuana = conteudoLower.includes('luana');

    // Responder automaticamente casos padrão mesmo sem menção, com ruído controlado
    try {
      const auto = await autoRespondStandardCases(message.content, message.author.id, message.channel);
      // Se já cuidamos com resposta automática e não houve menção, evitar duplicar
      if (auto && !(isMentioned || contemLuana)) {
        return;
      }
    } catch {}

    if (!(isMentioned || contemLuana)) return;

    const start = Date.now();
    try {
      // Obter contexto composto (memória + perfil + legado)
      const contextLegacy = getRelevantContext(message.author.id, message.content);
      const context = buildContext(message.author.id, message.content);

      // Capturar dados contextuais (nomes, locais, interesses) no perfil
      try {
        const entities = extractEntities(message.content);
        recordContextData(message.author.id, entities);
        trackMessage(message.author.id, message.content, Date.now());
      } catch {}

      // Gerar resposta contextualizada e enriquecer linguagem com personalização
      const pOpts = getPersonalizationOptions(message.author.id, message.content, context);
      let respostaBase = generateContextualResponse(message.content, contextLegacy, { estilo: pOpts.estilo || 'pratico' });
      respostaBase = enrichText(respostaBase, pOpts.complexidade || 0.5);
      respostaBase = varyStructure(respostaBase);
      let variantes = generateFormulations(respostaBase, { stylePreference: pOpts.estilo });
      // Evitar repetição: se muito parecido com últimas respostas, escolha outra variante
      if (isRepetitive(context.window, variantes[0])) {
        variantes = variantes.reverse();
      }
      let resposta = applyTone(variantes[0], { stylePreference: pOpts.estilo }, context);

      await message.channel.sendTyping();
      const delay = computeDelayMs(pOpts.complexidade || 0.5, resposta.length);
      await new Promise(r => setTimeout(r, delay));
      // Reply com fallback: se a referência da mensagem original for inválida (50035),
      // envia no canal sem referência para evitar erro DiscordAPIError[50035].
      try {
        await message.reply(resposta);
      } catch (err) {
        const isUnknownRef = err && (err.code === 50035 || String(err).includes('MESSAGE_REFERENCE_UNKNOWN_MESSAGE'));
        if (isUnknownRef) {
          logger.warn('Reply falhou por referência de mensagem desconhecida. Fazendo fallback para channel.send.');
          await message.channel.send(resposta);
        } else {
          throw err;
        }
      }

      // Aprender com a interação e atualizar preferência em memória
      learnFromInteraction(message.author.id, message.content, resposta, contextLegacy);
      rememberInteraction(message.author.id, message.content, resposta, { topics: context.topics });
      trackMessage(message.author.id, message.content, Date.now());

      // Antecipar necessidades e sugerir ação
      const anticipated = anticipateNeeds({ message: message.content, user: { id: message.author.id }, timestamp: Date.now(), channelId: message.channel.id });
      if (anticipated && anticipated.length > 0) {
        // Preferir oferecer ajuda quando aplicável; caso contrário, usar a primeira ação
        const chosen = anticipated.find(a => a.id === 'help_keywords') || anticipated[0];
        // Evitar excesso de mensagens: executar apenas 1 ação e registrar cooldown por canal
        await executeAnticipatedAction(chosen, message.channel, { channelId: message.channel.id });
      }

      // Tentar identificar problemas e sugerir solução
      const problema = identifyProblem(message.content);
      if (problema) {
        const sol = generateSolution(problema);
        if (sol && sol.response) {
          await message.channel.send(sol.response);
        }
      }

      // Automação inteligente baseada em triggers
      try {
        await runAutomations(message.content, message.author.id, message.channel, context);
      } catch {}
      // Roteamento automatizado para módulos apropriados (não invasivo)
      try {
        const { intent } = scoreIntent(message.content);
        const routed = routeToModule(intent, message.content, message.author.id, message.channel);
        if (routed && routed.actionsPerformed && routed.actionsPerformed.length > 0) {
          // Registrar apenas; evitar mensagens redundantes
          logger.info(`Automação aplicou ações: ${routed.actionsPerformed.join(', ')}`);
        }
      } catch {}

      // Detectar possíveis erros e oferecer correção quando o usuário indicar
      const erroDetectado = detectError(message.content, null);
      if (erroDetectado) {
        const correcao = generateCorrection(erroDetectado);
        logError(erroDetectado, message.content, resposta);
        await message.channel.send(correcao);
      }

      const responseTime = Date.now() - start;
      try {
        logInteraction({ type: 'conversation', responseTime, success: true });
        recordOutcome(message.author.id, { responseTimeMs: responseTime });
        // Auto-aprimoramento: registrar problemas
        if (responseTime > 2000) {
          recordProblematicInteraction({ userId: message.author.id, message: message.content, response: resposta, responseTimeMs: responseTime, reason: 'lento' });
        }
        if (detectTopicShift(context.topics, message.content)) {
          recordProblematicInteraction({ userId: message.author.id, message: message.content, response: resposta, responseTimeMs: responseTime, reason: 'mudanca_topico' });
        }
      } catch (e) {
        // Telemetria não deve quebrar fluxo de resposta
        logger.warn('Falha ao registrar interação de desempenho.');
      }
    } catch (error) {
      logger.error(`Erro ao responder mensagem: ${error}`);
      try {
        logInteraction({ type: 'conversation', responseTime: Date.now() - start, success: false });
      } catch {}
    }
  }
};