import { Events } from 'discord.js';
import { setupLogger } from '../utils/logger.js';
import { getRelevantContext, learnFromInteraction } from '../utils/learningSystem.js';
import { buildContext } from '../conversation/contextEngine.js';
import { rememberInteraction } from '../conversation/memory.js';
import { isRepetitive, detectTopicShift } from '../conversation/contextVerifier.js';
import { runAutomations } from '../automation/intelligentAutomation.js';
import { recordProblematicInteraction } from '../automation/selfImprovement.js';
import { enrichText, varyStructure, addCreativeFlair } from '../utils/linguisticVariety.js';
import { recordInteraction } from '../monitoring/performanceReports.js';
import { identifyProblem, generateSolution } from '../utils/problemSolver.js';
import { anticipateNeeds, executeAnticipatedAction } from '../utils/needsAnticipation.js';
import { detectError, generateCorrection, logError } from '../utils/selfCorrection.js';
import { logInteraction } from '../utils/performanceReports.js';
import { getPersonalizationOptions, trackMessage, recordOutcome, recordContextData } from '../utils/personalizationEngine.js';
import { extractEntities } from '../conversation/entities.js';
import { autoRespondStandardCases, routeToModule, scoreIntent } from '../automation/automationRouter.js';

const logger = setupLogger();

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(message, responseGenerator) {
    if (message.author.bot) {
      return;
    }

    let isMentioned, conteudoLower, contemLuana;
    try {
      isMentioned = message.mentions.has(message.client.user.id);
      conteudoLower = message.content.toLowerCase();
      contemLuana = conteudoLower.includes('luana');
    } catch (e) {
      logger.error(`Erro ao calcular isMentioned, conteudoLower ou contemLuana: ${e}`);
      return;
    }

    // Responder automaticamente casos padrão mesmo sem menção, com ruído controlado
    try {
      const auto = await autoRespondStandardCases(message.content, message.author.id, message.channel);
      // Se já cuidamos com resposta automática e não houve menção, evitar duplicar
      const contemLuana = message.content.toLowerCase().includes('luana');
    
      if (auto && !(isMentioned || contemLuana)) {
        return;
      }
    } catch (e) {
      logger.error(`Erro ao chamar autoRespondStandardCases: ${e}`);
    }



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
      const pOpts = getPersonalizationOptions(message.author.id, message.content, context, context.sentiment, context.intent);
      
      const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
      const conversationHistory = fetchedMessages.map(msg => ({ author: msg.author.id, content: msg.content })).reverse();

      const { response: resposta, delay, intent, sentiment: overallSentiment } = await responseGenerator.generateResponse(
        message.content,
        context,
        message.author.id,
        message.guild.id
      );

      // Analisar o tom da mensagem do usuário e adaptar a resposta
      // const userTone = analyzeTone(message.content, context.profile.preferences);
      // const respostaComTom = adaptTone(resposta, userTone);
      const respostaComTom = resposta; // Temporariamente, até que a lógica de tom seja integrada ao responseGenerator

      // Aplicar funções de variedade linguística
      respostaComTom = enrichText(respostaComTom, overallSentiment, intent);
      respostaComTom = varyStructure(respostaComTom, overallSentiment, intent);
      respostaComTom = addCreativeFlair(respostaComTom, overallSentiment, intent);

      await message.channel.sendTyping();
      await new Promise(r => setTimeout(r, delay));
      // Reply com fallback: se a referência da mensagem original for inválida (50035),
      // envia no canal sem referência para evitar erro DiscordAPIError[50035].
      try {
        await message.reply(respostaComTom);
      } catch (err) {
        const isUnknownRef = err && (err.code === 50035 || String(err).includes('MESSAGE_REFERENCE_UNKNOWN_MESSAGE'));
        if (isUnknownRef) {
          logger.warn('Reply falhou por referência de mensagem desconhecida. Fazendo fallback para channel.send.');
          await message.channel.send(respostaComTom);
        } else {
          throw err;
        }
      }

      // Registrar a interação para métricas
    recordInteraction({
      userId: message.author.id,
      userMessage: message.content,
      botResponse: respostaComTom,
      followUpUsed: false,
      sentiment: overallSentiment,
      intent: intent
    });

      // Aprender com a interação e atualizar preferência em memória
      learnFromInteraction(message.author.id, message.content, respostaComTom, { topics: context.topics });
      rememberInteraction(message.author.id, message.content, respostaComTom, { topics: context.topics });
      trackMessage(message.author.id, message.content, Date.now());

      // Antecipar necessidades e sugerir ação
      // const anticipated = anticipateNeeds({ message: message.content, user: { id: message.author.id }, timestamp: Date.now(), channelId: message.channel.id });
      // if (anticipated && anticipated.length > 0) {
      //   // Preferir oferecer ajuda quando aplicável; caso contrário, usar a primeira ação
      //   const chosen = anticipated.find(a => a.id === 'help_keywords') || anticipated[0];
      //   // Evitar excesso de mensagens: executar apenas 1 ação e registrar cooldown por canal
      //   await executeAnticipatedAction(chosen, message.channel, { channelId: message.channel.id });
      // }

      // Tentar identificar problemas e sugerir solução
      // const problema = identifyProblem(message.content);
      // if (problema) {
      //   const sol = generateSolution(problema);
      //   if (sol && sol.response) {
      //     await message.channel.send(sol.response);
      //   }
      // }

      // Automação inteligente baseada em triggers
      try {
        await runAutomations(message.content, message.author.id, message.channel, context);
      } catch {}
      // Roteamento automatizado para módulos apropriados (não invasivo)
      try {
        const { intent: scoredIntent } = scoreIntent(message.content, context);
        const routed = routeToModule(message.content, message.author.id, message.channel);
        if (routed && routed.actionsPerformed && routed.actionsPerformed.length > 0) {
          // Registrar apenas; evitar mensagens redundantes
          logger.info(`Automação aplicou ações: ${routed.actionsPerformed.join(', ')}`);
        }
      } catch {}

      // Detectar possíveis erros e oferecer correção quando o usuário indicar
      // const erroDetectado = detectError(message.content, null);
      // if (erroDetectado) {
      //   const correcao = generateCorrection(erroDetectado);
      //   logError(erroDetectado, message.content, respostaComTom);
      //   await message.channel.send(correcao);
      // }

      const responseTime = Date.now() - start;
      try {
        logInteraction({ type: 'conversation', responseTime, success: true });
        recordOutcome(message.author.id, { responseTimeMs: responseTime });
        // Auto-aprimoramento: registrar problemas
        if (responseTime > 2000) {
          recordProblematicInteraction({ userId: message.author.id, message: message.content, response: respostaComTom, responseTimeMs: responseTime, reason: 'lento' });
        }
        if (detectTopicShift(context.topics, message.content)) {
          recordProblematicInteraction({ userId: message.author.id, message: message.content, response: respostaComTom, responseTimeMs: responseTime, reason: 'mudanca_topico' });
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