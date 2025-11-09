import { getRelevantContext } from '../utils/learningSystem.js';
import { getUserProfile } from '../utils/personalizationEngine.js';
import { getRecentInteractions, getCurrentTopics } from './memory.js';
import { initThematicCohesion, getThematicPatterns } from '../utils/thematicCohesion.js';
import { analyzeSentiment } from './sentimentAnalyzer.js';
import { recognizeIntent } from './intentRecognizer.js';

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

export {
  buildContext,
};