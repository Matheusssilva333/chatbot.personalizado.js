import { extractTopics } from './memory.js';

export function isRepetitive(latestWindow = [], candidate = '') {
  const c = String(candidate || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!c) return false;
  for (const e of latestWindow) {
    const r = String(e.response || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (r && r.length > 0) {
      const overlap = jaccard(c.split(' '), r.split(' '));
      if (overlap > 0.7) return true;
    }
  }
  return false;
}

function jaccard(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = new Set([...sa].filter(x => sb.has(x))).size;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}

export function detectTopicShift(previousTopics = [], message = '') {
  const now = extractTopics(message);
  // topic shift if dominant topic differs
  const prev = (previousTopics && previousTopics[0]) || null;
  const curr = (now && now[0]) || null;
  return prev && curr && prev !== curr;
}