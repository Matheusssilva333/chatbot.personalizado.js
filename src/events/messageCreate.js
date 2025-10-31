const { Events } = require('discord.js');
const { setupLogger } = require('../utils/logger');
const { getRelevantContext, learnFromInteraction } = require('../utils/learningSystem');
const { generateContextualResponse } = require('../utils/contextualResponses');
const { enrichText, varyStructure } = require('../utils/linguisticVariety');
const { identifyProblem, generateSolution } = require('../utils/problemSolver');
const { anticipateNeeds, executeAnticipatedAction } = require('../utils/needsAnticipation');
const { detectError, generateCorrection, logError } = require('../utils/selfCorrection');
const { logInteraction } = require('../utils/performanceReports');
const { getPersonalizationOptions, trackMessage, recordOutcome } = require('../utils/personalizationEngine');

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

    if (!(isMentioned || contemLuana)) return;

    const start = Date.now();
    try {
      // Obter contexto relevante do sistema de aprendizado
      const context = getRelevantContext(message.author.id, message.content);

      // Gerar resposta contextualizada e enriquecer linguagem com personalização
      const pOpts = getPersonalizationOptions(message.author.id, message.content, context);
      let resposta = generateContextualResponse(message.content, context, { estilo: pOpts.estilo || 'pratico' });
      resposta = enrichText(resposta, pOpts.complexidade || 0.5);
      resposta = varyStructure(resposta);

      await message.channel.sendTyping();
      await new Promise(r => setTimeout(r, 1200));
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
      learnFromInteraction(message.author.id, message.content, resposta, context);
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