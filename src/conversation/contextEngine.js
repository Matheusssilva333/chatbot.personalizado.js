const { getRelevantContext } = require('../utils/learningSystem');
const { getUserProfile } = require('../utils/personalizationEngine');
const { getRecentInteractions, getCurrentTopics } = require('./memory');
const { initThematicCohesion, getThematicPatterns } = require('../utils/thematicCohesion');
const { analyzeSentiment } = require('./sentimentAnalyzer');
const { recognizeIntent } = require('./intentRecognizer');

// Inicializar coesões temáticas ao carregar o módulo
initThematicCohesion();

function buildContext(userId, message) {
  const base = getRelevantContext(userId, message);
  const profile = getUserProfile(userId);
  const window = getRecentInteractions(userId, 3);
  const topics = getCurrentTopics(userId);
  const thematicPatterns = getThematicPatterns(topics);
  const sentiment = analyzeSentiment(message);
  const intent = recognizeIntent(message);

  return {
    base, // legacy context
    profile,
    window,
    topics,
    thematicPatterns,
    sentiment,
    intent,
  };
}

module.exports = {
  buildContext,
};