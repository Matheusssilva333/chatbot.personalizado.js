const MAX_INTERACTIONS = 20;

// userId -> [{ timestamp, message, response, topics: string[], meta: {} }]
const memoryStore = new Map();

function extractTopics(text = '') {
  const t = String(text).toLowerCase();
  const topics = [];
  const dict = {
    minecraft: ['minecraft', 'servidor', 'seed', 'lag', 'fps'],
    moderacao: ['moderacao', 'moderação', 'timeout', 'limpar', 'ban'],
    xadrez: ['xadrez', 'chess', 'carlsen', 'tabuleiro'],
    filosofia: ['filosofia', 'hegel', 'kant', 'intelectual'],
    suporte: ['ajuda', 'erro', 'bug', 'falha']
  };
  for (const [topic, words] of Object.entries(dict)) {
    if (words.some(w => t.includes(w))) topics.push(topic);
  }
  return topics;
}

function rememberInteraction(userId, message, response, meta = {}) {
  const list = memoryStore.get(userId) || [];
  const entry = {
    timestamp: Date.now(),
    message: String(message || ''),
    response: String(response || ''),
    topics: meta.topics || extractTopics(message || '') || [],
    meta,
  };
  list.push(entry);
  while (list.length > MAX_INTERACTIONS) list.shift();
  memoryStore.set(userId, list);
  return entry;
}

function getRecentInteractions(userId, limit = 3) {
  const list = memoryStore.get(userId) || [];
  if (limit <= 0) return [];
  return list.slice(Math.max(0, list.length - limit));
}

function getCurrentTopics(userId) {
  const last = getRecentInteractions(userId, 3);
  const freq = new Map();
  for (const e of last) {
    for (const t of e.topics || []) {
      freq.set(t, (freq.get(t) || 0) + 1);
    }
  }
  return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export {
  rememberInteraction,
  getRecentInteractions,
  getCurrentTopics,
  extractTopics,
};