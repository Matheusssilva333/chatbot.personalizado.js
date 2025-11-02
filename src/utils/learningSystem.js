const fs = require('fs');
const path = require('path');
const { LRUCache, normalizeText } = require('./cache');

// Estrutura para armazenar dados de aprendizado
let conversationPatterns = {};
let userPreferences = {};
let interactionHistory = {};
const ctxCache = new LRUCache(500);

// Caminho para o arquivo de dados
const dataPath = path.join(__dirname, '../../data');
const patternsFile = path.join(dataPath, 'patterns.json');
const preferencesFile = path.join(dataPath, 'preferences.json');
const historyFile = path.join(dataPath, 'history.json');

// Inicialização do sistema de aprendizado
function initLearningSystem() {
  // Criar diretório de dados se não existir
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  // Carregar dados existentes
  try {
    if (fs.existsSync(patternsFile)) {
      conversationPatterns = JSON.parse(fs.readFileSync(patternsFile, 'utf8'));
    }
    if (fs.existsSync(preferencesFile)) {
      userPreferences = JSON.parse(fs.readFileSync(preferencesFile, 'utf8'));
    }
    if (fs.existsSync(historyFile)) {
      interactionHistory = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
  } catch (error) {
    console.error('Erro ao carregar dados de aprendizado:', error);
  }

  return {
    conversationPatterns,
    userPreferences,
    interactionHistory
  };
}

// Analisar e aprender com uma nova interação
function learnFromInteraction(userId, message, response, context = {}) {
  // Registrar interação no histórico
  if (!interactionHistory[userId]) {
    interactionHistory[userId] = [];
  }
  
  interactionHistory[userId].push({
    timestamp: Date.now(),
    message: message,
    response: response,
    context: context
  });

  // Limitar o histórico a 100 interações por usuário
  if (interactionHistory[userId].length > 100) {
    interactionHistory[userId].shift();
  }

  // Identificar padrões de conversação
  const keywords = extractKeywords(message);
  keywords.forEach(keyword => {
    if (!conversationPatterns[keyword]) {
      conversationPatterns[keyword] = { count: 0, contexts: [] };
    }
    
    conversationPatterns[keyword].count++;
    
    // Armazenar contexto associado a esta palavra-chave
    if (conversationPatterns[keyword].contexts.length < 10) {
      conversationPatterns[keyword].contexts.push({
        message: message,
        response: response
      });
    }
  });

  // Salvar dados atualizados
  saveData();
}

// Extrair palavras-chave de uma mensagem
function extractKeywords(message) {
  // Implementação simples - dividir por espaços e filtrar palavras comuns
  const commonWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'e', 'ou', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'para', 'por', 'com'];
  return message.toLowerCase()
    .replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));
}

// Salvar dados em arquivos
function saveData() {
  try {
    fs.writeFileSync(patternsFile, JSON.stringify(conversationPatterns, null, 2));
    fs.writeFileSync(preferencesFile, JSON.stringify(userPreferences, null, 2));
    fs.writeFileSync(historyFile, JSON.stringify(interactionHistory, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados de aprendizado:', error);
  }
}

// Obter contexto relevante para uma nova mensagem
function getRelevantContext(userId, message) {
  const cacheKey = `${userId}|${normalizeText(message)}`;
  const cached = ctxCache.get(cacheKey);
  if (cached) return cached;

  const keywords = extractKeywords(message);
  const relevantPatterns = [];

  // Buscar padrões relevantes baseados nas palavras-chave
  keywords.forEach(keyword => {
    if (conversationPatterns[keyword]) {
      relevantPatterns.push(...conversationPatterns[keyword].contexts);
    }
  });

  // Obter histórico recente do usuário
  const userHistory = interactionHistory[userId] || [];
  const recentHistory = userHistory.slice(-5);

  const result = {
    patterns: relevantPatterns.slice(0, 3), // Limitar a 3 padrões mais relevantes
    history: recentHistory,
    preferences: userPreferences[userId] || {}
  };
  ctxCache.set(cacheKey, result);
  return result;
}

// Atualizar preferências do usuário
function updateUserPreference(userId, key, value) {
  if (!userPreferences[userId]) {
    userPreferences[userId] = {};
  }
  
  userPreferences[userId][key] = value;
  saveData();
}

// Gerar relatório de aprendizado
function generateLearningReport() {
  const totalPatterns = Object.keys(conversationPatterns).length;
  const totalUsers = Object.keys(interactionHistory).length;
  
  const userInteractions = {};
  Object.keys(interactionHistory).forEach(userId => {
    userInteractions[userId] = interactionHistory[userId].length;
  });
  
  const topPatterns = Object.entries(conversationPatterns)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([keyword, data]) => ({ keyword, count: data.count }));
  
  return {
    timestamp: Date.now(),
    totalPatterns,
    totalUsers,
    userInteractions,
    topPatterns
  };
}

module.exports = {
  initLearningSystem,
  learnFromInteraction,
  getRelevantContext,
  updateUserPreference,
  generateLearningReport
};