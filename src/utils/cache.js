class LRUCache {
  constructor(limit = 500) {
    this.limit = limit;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key);
    // refresh order
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  set(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.limit) {
      // delete oldest
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
  }
}

function normalizeText(text, maxLen = 200) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .slice(0, maxLen);
}

module.exports = { LRUCache, normalizeText };