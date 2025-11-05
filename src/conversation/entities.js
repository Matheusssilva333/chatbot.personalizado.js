import { extractTopics } from './memory.js';

function uniquePush(arr, items) {
  const set = new Set(arr);
  for (const it of items || []) {
    const v = String(it || '').trim();
    if (v && !set.has(v)) { arr.push(v); set.add(v); }
  }
  return arr;
}

function extractNames(text = '') {
  const names = [];
  const re = /\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+){0,2})\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const candidate = m[1];
    // Avoid capturing sentence-start common words
    if (!/^(Olá|Oi|Bom|Boa|Luana|Discord|Minecraft)$/i.test(candidate)) {
      names.push(candidate);
    }
  }
  return Array.from(new Set(names)).slice(0, 5);
}

function extractLocations(text = '') {
  const t = String(text).toLowerCase();
  const known = ['são paulo','rio de janeiro','lisboa','porto','curitiba','bh','belo horizonte','fortaleza'];
  const hits = known.filter(k => t.includes(k));
  // Generic cues
  if (/\bcidade\b/.test(t)) hits.push('cidade');
  if (/\bservidor\b/.test(t)) hits.push('servidor');
  return Array.from(new Set(hits)).slice(0, 5);
}

function extractInterests(text = '') {
  const topics = extractTopics(text);
  const t = String(text).toLowerCase();
  const extra = [];
  if (t.includes('xadrez') || t.includes('chess')) extra.push('xadrez');
  if (t.includes('filosofia') || t.includes('hegel') || t.includes('kant')) extra.push('filosofia');
  if (t.includes('moderação') || t.includes('moderacao')) extra.push('moderacao');
  return Array.from(new Set([...(topics || []), ...extra])).slice(0, 10);
}

function extractEntities(text = '') {
  return {
    names: extractNames(text),
    locations: extractLocations(text),
    interests: extractInterests(text),
  };
}

export {
  extractEntities,
  extractNames,
  extractLocations,
  extractInterests,
  uniquePush,
};