const { getRelevantContext } = require('../utils/learningSystem');
const { getUserProfile } = require('../utils/personalizationEngine');
const { getRecentInteractions, getCurrentTopics } = require('./memory');

function buildContext(userId, message) {
  const base = getRelevantContext(userId, message);
  const profile = getUserProfile(userId);
  const window = getRecentInteractions(userId, 3);
  const topics = getCurrentTopics(userId);
  return {
    base, // legacy context
    profile,
    window,
    topics,
  };
}

module.exports = {
  buildContext,
};