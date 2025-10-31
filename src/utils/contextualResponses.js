const fs = require('fs');
const path = require('path');

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

// Gerar resposta contextualizada
function generateContextualResponse(message, context, personality = {}) {
  // Extrair informações do contexto
  const { patterns, history, preferences } = context;
  
  // Determinar o tipo de resposta baseado no conteúdo da mensagem
  const messageType = determineMessageType(message);
  
  // Selecionar expressão apropriada
  let response = selectExpression(messageType, personality);
  
  // Personalizar resposta com base no histórico e preferências
  response = personalizeResponse(response, history, preferences);
  
  // Adicionar contexto específico se disponível
  if (patterns && patterns.length > 0) {
    const relevantPattern = patterns[0];
    response = enrichResponseWithPattern(response, relevantPattern);
  }
  
  return response;
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
  if (preferences.name) {
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
      response += ` Continuando nossa conversa sobre "${recentInteraction.message.substring(0, 20)}..."`;
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

module.exports = {
  initExpressions,
  generateContextualResponse,
  addExpression
};