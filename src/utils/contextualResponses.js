import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Banco de dados de expressões linguísticas
const expressionsPath = path.join(__dirname, '../../data/expressions.json');
let expressionsDB = {
  greetings: [
    "Olá! Como posso ajudar você hoje?",
    "Saudações! Em que posso ser útil?",
    "Olá! Estou aqui para auxiliar em suas questões.",
    "Bem-vindo! Como posso contribuir para sua experiência?",
    "Olá! Estou à disposição para ajudar com suas dúvidas."
  ],
  farewells: [
    "Até logo! Foi um prazer ajudar.",
    "Até a próxima! Estarei aqui quando precisar.",
    "Adeus! Espero ter sido útil.",
    "Até mais! Não hesite em voltar se precisar de mais ajuda.",
    "Tchau! Foi ótimo conversar com você."
  ],
  thinking: [
    "Estou analisando essa questão...",
    "Deixe-me refletir sobre isso por um momento...",
    "Interessante, estou processando essa informação...",
    "Estou elaborando uma resposta adequada...",
    "Permita-me considerar todos os aspectos dessa questão..."
  ],
  minecraft: [
    "Como entusiasta de Minecraft, posso dizer que...",
    "Falando sobre Minecraft, uma perspectiva interessante é...",
    "No universo de Minecraft, é importante considerar que...",
    "Minha experiência com servidores de Minecraft me ensinou que...",
    "Quando se trata de Minecraft, sempre recomendo..."
  ],
  philosophy: [
    "De uma perspectiva filosófica, poderíamos analisar isso como...",
    "Essa questão me lembra o pensamento de Hegel sobre...",
    "Refletindo criticamente sobre esse tema...",
    "Considerando as implicações filosóficas mais profundas...",
    "Isso nos leva a questionar fundamentalmente..."
  ],
  chess: [
    "No xadrez, assim como na vida, é importante pensar estrategicamente...",
    "Essa situação me lembra uma posição de xadrez onde...",
    "Analisando isso como uma partida de xadrez...",
    "Magnus Carlsen abordaria essa situação considerando...",
    "A estratégia no xadrez nos ensina que..."
  ],
  moderation: [
    "Para manter um ambiente saudável, sugiro...",
    "Como moderadora, recomendaria...",
    "Baseando-me em boas práticas de moderação...",
    "Para resolver esse conflito, uma abordagem eficaz seria...",
    "Na minha experiência com moderação de comunidades..."
  ],
  error: [
    "Parece que houve um equívoco na minha interpretação. Permita-me corrigir.",
    "Preciso reconsiderar minha resposta anterior.",
    "Detectei uma imprecisão no que disse. Vamos esclarecer.",
    "Peço desculpas pela confusão. Deixe-me reformular minha resposta.",
    "Identifiquei um erro no meu raciocínio. Vamos retificar."
  ]
};

// Inicializar o sistema de expressões
function initExpressions() {
  try {
    // Criar diretório de dados se não existir
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Carregar expressões existentes ou criar novo arquivo
    if (fs.existsSync(expressionsPath)) {
      expressionsDB = JSON.parse(fs.readFileSync(expressionsPath, 'utf8'));
    } else {
      fs.writeFileSync(expressionsPath, JSON.stringify(expressionsDB, null, 2));
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de expressões:', error);
  }
}

// Garantir coerência com o propósito do bot (comandos core: filosofia, minecraft, moderação, xadrez)
function ensureCoherence(response, context) {
  const coreTopics = ['filosofia', 'minecraft', 'moderação', 'xadrez'];
  const responseLower = response.toLowerCase();
  const hasCoreReference = coreTopics.some(topic => responseLower.includes(topic));
  const hasContextCoreTopic = context.topics && context.topics.some(topic => coreTopics.includes(topic.toLowerCase()));

  // Se a resposta não mencionar tópicos core e o contexto não tiver tópicos core, redirecionar
  if (!hasCoreReference && !hasContextCoreTopic) {
    const redirects = [
      "Posso ajudar com questões de filosofia, Minecraft, moderação ou xadrez. Qual desses temas te interessaria?",
      "Meu foco é em filosofia, Minecraft, moderação e xadrez. Que tal explorar um desses temas?"
    ];
    return redirects[Math.floor(Math.random() * redirects.length)];
  }

  return response;
}

// Garantir relevância com o tópico discutido
function ensureRelevance(response, context) {
  if (!context.topics || context.topics.length === 0) return response;

  const currentTopic = context.topics[0].toLowerCase();
  const responseLower = response.toLowerCase();

  // Se a resposta não for relevante para o tópico atual, ajustar
  if (!responseLower.includes(currentTopic) && Math.random() < 0.6) {
    return `${response} Vamos voltar ao tema de ${currentTopic}? Há algo mais que você gostaria de saber sobre isso?`;
  }

  return response;
}

// Gerar resposta contextualizada
function generateContextualResponse(message, context, personality = {}) {
  // Extrair informações do contexto
  const { window, topics, thematicPatterns, sentiment, intent } = context;
  const { history, preferences } = context.profile; // Assumindo que history e preferences estão dentro de profile

  // Determinar o tipo de resposta baseado no conteúdo da mensagem
  const messageType = determineMessageType(message);

  // Selecionar expressão apropriada
  let response = selectExpression(messageType, personality);

  // Personalizar resposta com base no histórico e preferências
  response = personalizeResponse(response, history, preferences);

  // Adicionar contexto específico se disponível
  if (thematicPatterns && thematicPatterns.length > 0) {
    const relevantPattern = thematicPatterns[0]; // Usar o primeiro padrão temático como exemplo
    response = enrichResponseWithPattern(response, relevantPattern);
  }

  // Adaptar a resposta com base no sentimento e intenção
  response = adaptResponseToContext(response, sentiment, intent, personality.estilo);

  // Garantir coerência e relevância
  response = ensureCoherence(response, context);
  response = ensureRelevance(response, context);

  // Gerar uma camada adicional de profundidade (pergunta de acompanhamento ou mais informações)
  const followUp = generateFollowUp(message, context, personality);

  return { response, followUp };
}

// Adaptar a resposta com base no sentimento, intenção e estilo do usuário
function adaptResponseToContext(response, sentiment, intent, userStyle) {
  let adaptedResponse = response;

  // Ajustar tom com base no sentimento
  if (sentiment && sentiment.overall === 'negative') {
    adaptedResponse = `Entendo que você está chateado. ${adaptedResponse}`;
  } else if (sentiment && sentiment.overall === 'positive') {
    adaptedResponse = `Que bom! ${adaptedResponse}`;
  }

  // Ajustar estilo com base na intenção
  if (intent === 'help') {
    adaptedResponse = `Claro, estou aqui para ajudar! ${adaptedResponse}`;
  } else if (intent === 'greeting') {
    adaptedResponse = `Olá! ${adaptedResponse}`;
  } else if (intent === 'farewell') {
    adaptedResponse = `Até mais! ${adaptedResponse}`;
  }

  // Ajustar estilo com base na preferência do usuário
  if (userStyle === 'intelectual') {
    adaptedResponse = `De uma perspectiva mais aprofundada, ${adaptedResponse}`;
  } else if (userStyle === 'pratico') {
    adaptedResponse = `Direto ao ponto: ${adaptedResponse}`;
  }

  return adaptedResponse;
}

// Determinar o tipo de mensagem
function determineMessageType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.match(/^(oi|olá|hey|e aí)/)) {
    return 'greetings';
  }
  
  if (lowerMessage.includes('tchau') || lowerMessage.includes('adeus') || lowerMessage.includes('até logo')) {
    return 'farewells';
  }
  
  if (lowerMessage.includes('minecraft') || lowerMessage.includes('servidor') || lowerMessage.includes('jogo')) {
    return 'minecraft';
  }
  
  if (lowerMessage.includes('filosofia') || lowerMessage.includes('pensar') || lowerMessage.includes('hegel')) {
    return 'philosophy';
  }
  
  if (lowerMessage.includes('xadrez') || lowerMessage.includes('carlsen') || lowerMessage.includes('estratégia')) {
    return 'chess';
  }
  
  if (lowerMessage.includes('moderação') || lowerMessage.includes('regras') || lowerMessage.includes('comunidade')) {
    return 'moderation';
  }
  
  // Tipo padrão para mensagens que não se encaixam em categorias específicas
  return 'thinking';
}

// Selecionar expressão apropriada
function selectExpression(type, personality) {
  // Verificar se o tipo existe no banco de expressões
  if (!expressionsDB[type]) {
    type = 'thinking'; // Fallback para tipo padrão
  }
  
  // Selecionar aleatoriamente uma expressão do tipo apropriado
  const expressions = expressionsDB[type];
  const index = Math.floor(Math.random() * expressions.length);
  
  return expressions[index];
}

// Personalizar resposta com base no histórico e preferências
function personalizeResponse(response, history, preferences) {
  // Adicionar nome do usuário se disponível nas preferências
  if (preferences && preferences.name) {
    // 30% de chance de usar o nome na resposta
    if (Math.random() < 0.3) {
      response = response.replace(/\.$/, `, ${preferences.name}.`);
      if (!response.includes(preferences.name)) {
        response = `${preferences.name}, ${response.charAt(0).toLowerCase()}${response.slice(1)}`;
      }
    }
  }

  // Adicionar referência a interações anteriores se houver histórico
  if (history && history.length > 0) {
    const recentInteraction = history[history.length - 1];

    // 20% de chance de referenciar interação anterior
    if (Math.random() < 0.2 && recentInteraction) {
      response += ` Continuando nossa conversa sobre \"${recentInteraction.message.substring(0, 20)}...\"`;
    }
  }

  // Incorporar dados contextuais se disponíveis
  if (preferences && preferences.contextualData && Object.keys(preferences.contextualData).length > 0) {
    // Exemplo: se o usuário frequentemente fala sobre um tópico específico, o bot pode fazer uma menção
    const topics = Object.keys(preferences.contextualData);
    if (topics.length > 0 && Math.random() < 0.15) { // 15% de chance de mencionar um tópico contextual
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      response += ` A propósito, você mencionou ${randomTopic} recentemente.`;
    }
  }

  // Incorporar preferências implícitas
  if (preferences && preferences.preferencesImplicit && preferences.preferencesImplicit.length > 0) {
    // Exemplo: se o usuário tem uma preferência implícita por um estilo de resposta, o bot pode ajustar
    if (Math.random() < 0.1) { // 10% de chance de ajustar com base em preferência implícita
      const implicitPref = preferences.preferencesImplicit[0]; // Pegar a preferência mais forte
      response += ` Pelo que percebo, você prefere uma abordagem ${implicitPref}.`;
    }
  }

  // Referenciar comandos favoritos
  if (preferences && preferences.favoriteCommands && preferences.favoriteCommands.length > 0) {
    if (Math.random() < 0.1) { // 10% de chance de mencionar um comando favorito
      const randomCommand = preferences.favoriteCommands[Math.floor(Math.random() * preferences.favoriteCommands.length)];
      response += ` Lembrei que você gosta de usar o comando ${randomCommand}.`;
    }
  }

  return response;
}

// Enriquecer resposta com padrões relevantes
function enrichResponseWithPattern(response, pattern) {
  if (pattern && pattern.message) {
    // 25% de chance de incorporar informações do padrão
    if (Math.random() < 0.25) {
      response += ` Lembro que conversamos sobre algo similar anteriormente.`;
    }
  }
  
  return response;
}

// Adicionar nova expressão ao banco de dados
function addExpression(type, expression) {
  if (!expressionsDB[type]) {
    expressionsDB[type] = [];
  }
  
  // Verificar se a expressão já existe
  if (!expressionsDB[type].includes(expression)) {
    expressionsDB[type].push(expression);
    
    // Salvar no arquivo
    try {
      fs.writeFileSync(expressionsPath, JSON.stringify(expressionsDB, null, 2));
      return true;
    } catch (error) {
      console.error('Erro ao salvar nova expressão:', error);
      return false;
    }
  }
  
  return false;
}

// Gerar pergunta de acompanhamento ou camada adicional de profundidade
function generateFollowUp(message, context, personality = {}) {
  const { sentiment, intent, topics } = context;
  const random = Math.random();

  // Se o sentimento for positivo e o tópico for interessante, fazer uma pergunta aberta
  if (sentiment && sentiment.overall === 'positive' && topics && topics.length > 0 && random < 0.4) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    return `O que mais você gostaria de explorar sobre ${topic}?`;
  }

  // Se a intenção for de ajuda, oferecer mais detalhes
  if (intent === 'help' && random < 0.3) {
    return "Precisa de mais detalhes ou posso ajudar com algo específico?";
  }

  // Se a conversa estiver em um tópico específico, aprofundar
  if (context.currentTopic && random < 0.2) {
    return `Podemos aprofundar mais sobre ${context.currentTopic}?`;
  }

  // Perguntas abertas gerais para engajar
  if (random < 0.15) {
    const openQuestions = [
      "O que você pensa sobre isso?",
      "Qual a sua perspectiva?",
      "Há algo mais que te intriga?"
    ];
    return openQuestions[Math.floor(Math.random() * openQuestions.length)];
  }

  return null; // Nenhuma camada adicional por padrão
}

export {
  initExpressions,
  generateContextualResponse,
  addExpression,
  generateFollowUp,
  ensureCoherence,
  ensureRelevance
};