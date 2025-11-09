import { setupLogger } from '../utils/logger.js';
import { recognizeIntent } from './intentRecognizer.js';
import { analyzeSentiment } from './sentimentAnalyzer.js';
import { getTransitionalPhrase } from './naturalness.js';
import { isRepetitive } from './contextVerifier.js';
import { evaluateTriggers } from '../automation/intelligentAutomation.js';

const logger = setupLogger();

export default class ResponseGenerator {
  constructor() {
    logger.info('ResponseGenerator inicializado.');
  }

  async generateResponse(userMessage, options = {}, conversationHistory = []) {
    const intent = recognizeIntent(userMessage);
    const sentiment = analyzeSentiment(userMessage);

    logger.info(`Mensagem: "${userMessage}" | Intenção: ${intent} | Sentimento: ${sentiment.comparative}`);

    const triggers = evaluateTriggers(userMessage, options.userId, options.channel, options.topics);
    const coletaInfoTrigger = triggers.find(t => t.type === 'coleta_info');

    let baseResponse;
    if (coletaInfoTrigger && coletaInfoTrigger.data) {
      baseResponse = coletaInfoTrigger.data.question;
    } else {
      // Gerar uma resposta base com base na intenção, sentimento e histórico
      baseResponse = this._getBaseResponse(intent, sentiment, userMessage, conversationHistory);
    }

    // Aplicar tom contextual
    baseResponse = applyTone(baseResponse, options, conversationHistory, sentiment.comparative);

    // Aplicar variações de naturalidade
    baseResponse = generateFormulations(baseResponse, options.stylePreference);

    // Adicionar frases de transição se houver histórico de conversação
    if (conversationHistory.length > 0) {
      const transitionalPhrase = getTransitionalPhrase();
      baseResponse = `${transitionalPhrase} ${baseResponse}`;
    }

    // Calcular delay de digitação
    const delay = computeDelayMs(baseResponse);

    return { response: baseResponse, delay, intent, sentiment };
  }

  _getBaseResponse(intent, sentiment, userMessage, conversationHistory) {
    // Lógica para gerar uma resposta base com base na intenção, sentimento e histórico
    // Isso será expandido para ser mais sofisticado
    const lastBotMessage = conversationHistory.findLast(msg => msg.author === 'bot');
    const lastUserMessage = conversationHistory.findLast(msg => msg.author !== 'bot');

    // Check for repeated intents in recent history
    const recentUserIntents = conversationHistory
      .filter(msg => msg.author !== 'bot')
      .slice(-3) // Look at the last 3 user messages
      .map(msg => recognizeIntent(msg.content));

    const isRepeatedIntent = recentUserIntents.filter(i => i === intent).length > 1;

    switch (intent) {
      case 'greeting':
        if (lastBotMessage && lastBotMessage.content.includes('Olá')) {
          return 'Olá novamente! Em que mais posso ajudar?';
        }
        return 'Olá! Como posso ajudar você hoje?';
      case 'help':
        if (isRepeatedIntent) {
          return 'Parece que você ainda precisa de ajuda com isso. Poderia reformular sua pergunta ou ser mais específico?';
        }
        return 'Eu sou um bot de IA projetado para ajudar com diversas tarefas. O que você gostaria de fazer?';
      case 'minecraft_query':
        if (isRepeatedIntent) {
          return 'Já falamos sobre Minecraft. Há algo mais específico que você queira saber sobre o jogo?';
        }
        return 'Minecraft é um jogo sandbox popular. Você tem alguma pergunta específica sobre ele?';
      case 'farewell':
        return 'Até mais! Se precisar de algo, é só chamar.';
      case 'programming_query':
        if (isRepeatedIntent) {
          return 'Já discutimos programação. Há algum outro aspecto que você gostaria de explorar ou uma nova pergunta?';
        }
        return 'Ah, programação! É um campo vasto. Qual linguagem ou conceito específico você gostaria de discutir?';
      case 'debugging_query':
        if (isRepeatedIntent) {
          return 'Ainda com problemas de depuração? Talvez possamos tentar uma abordagem diferente.';
        }
        return 'Depuração é essencial. Qual o problema que você está enfrentando ou qual ferramenta de depuração você usa?';
      case 'api_query':
        if (isRepeatedIntent) {
          return 'Sobre APIs novamente? Há algo mais que você gostaria de saber ou um novo desafio?';
        }
        return 'APIs são a espinha dorsal da integração. Você tem alguma API em mente ou quer saber sobre design de APIs?';
      case 'database_query':
        if (isRepeatedIntent) {
          return 'Voltando aos bancos de dados? Qual a sua dúvida específica agora?';
        }
        return 'Bancos de dados são cruciais para persistência. SQL, NoSQL? Qual o seu interesse?';
      case 'cloud_query':
        if (isRepeatedIntent) {
          return 'Mais sobre nuvem? Há algum serviço ou provedor específico que você queira explorar em detalhes?';
        }
        return 'Computação em nuvem é o futuro! AWS, Azure, GCP? Qual plataforma ou serviço te interessa mais?';
      default:
        if (sentiment.comparative > 0.5) {
          return 'Que ótimo! Fico feliz em saber disso. Conte-me mais detalhes! O que mais te interessa sobre isso?';
        } else if (sentiment.comparative > 0) {
          return 'Isso é interessante! Parece ser algo positivo. Quer aprofundar? Ou há algo mais que você gostaria de explorar?';
        } else if (sentiment.comparative < -0.5) {
          return 'Sinto muito por isso. Parece ser uma situação bem difícil. Posso ajudar de alguma forma? O que você gostaria de fazer a seguir?';
        } else if (sentiment.comparative < 0) {
          return 'Entendo. Parece que há um problema ou uma preocupação. Posso ajudar a resolver? O que você precisa que eu faça?';
        } else {
          return 'Certo. Sem grandes emoções por aqui. O que mais você gostaria de discutir? Há algo específico em mente?';
        }
    }
  }
}