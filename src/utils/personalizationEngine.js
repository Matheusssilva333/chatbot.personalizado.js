const fs = require('fs');
const path = require('path');

// In-memory stores
const profiles = new Map(); // userId -> profile
const metrics = {
  personalizedCount: 0,
  avgResponseTimeMs: 0,
  samples: 0,
  cacheEvictions: 0,
  lastFlush: 0,
};

const SERVER_KEYWORDS = ['status','servidor','lag','jogadores','online','conexão'];
const INTELLECTUAL_KEYWORDS = ['filosofia','hegel','intelectual','reflexão'];
const MAX_PROFILES = 200;
const PROFILE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

let globalActivityByHour = Array(24).fill(0);
let logsFilePath = null;

function initPersonalization(options = {}) {
  try {
    logsFilePath = options.logsFilePath || path.join(__dirname, '../../logs/combined.log');
    analyzeLogsOnce();
  } catch (e) {
    // Silent fail: logs might not exist yet
  }
}

function analyzeLogsOnce() {
  if (!logsFilePath) return;
  try {
    const content = fs.readFileSync(logsFilePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/"timestamp":"([^"]+)"/);
      if (m) {
        const ts = m[1];
        const d = new Date(ts.replace(' ', 'T'));
        const h = isNaN(d.getHours()) ? null : d.getHours();
        if (h !== null) globalActivityByHour[h] = (globalActivityByHour[h] || 0) + 1;
      }
    }
  } catch {}
}

function ensureProfile(userId) {
  const now = Date.now();
  let p = profiles.get(userId);
  if (!p) {
    if (profiles.size >= MAX_PROFILES) {
      // Evict least recently updated
      let oldestKey = null;
      let oldestTime = Infinity;
      for (const [k, v] of profiles) {
        if (v.lastUpdated < oldestTime) { oldestTime = v.lastUpdated; oldestKey = k; }
      }
      if (oldestKey) { profiles.delete(oldestKey); metrics.cacheEvictions++; }
    }
    p = {
      userId,
      favoriteCommands: {},
      avgMessageLength: 0,
      messageCount: 0,
      serverInterest: 0,
      stylePreference: 'pratico',
      lastUpdated: now,
      lastSeen: now,
      activeHours: Array(24).fill(0),
    };
    profiles.set(userId, p);
  } else {
    // TTL check
    if (now - p.lastUpdated > PROFILE_TTL_MS) {
      p.favoriteCommands = {};
      p.avgMessageLength = 0;
      p.messageCount = 0;
      p.serverInterest = 0;
      p.activeHours = Array(24).fill(0);
      p.lastUpdated = now;
    }
  }
  p.lastSeen = now;
  return p;
}

function trackMessage(userId, content, timestamp = Date.now()) {
  const p = ensureProfile(userId);
  const len = (content || '').length;
  p.messageCount += 1;
  p.avgMessageLength = p.avgMessageLength === 0 ? len : (p.avgMessageLength * 0.9 + len * 0.1);
  const hour = new Date(timestamp).getHours();
  if (!isNaN(hour)) p.activeHours[hour] = (p.activeHours[hour] || 0) + 1;
  const msgLower = (content || '').toLowerCase();
  if (SERVER_KEYWORDS.some(k => msgLower.includes(k))) p.serverInterest++;
  if (INTELLECTUAL_KEYWORDS.some(k => msgLower.includes(k))) p.stylePreference = 'intelectual';
  else if (p.favoriteCommands['filosofia'] && p.favoriteCommands['filosofia'] > 2) p.stylePreference = 'intelectual';
  else if (p.avgMessageLength < 120) p.stylePreference = 'pratico';
  p.lastUpdated = Date.now();
}

function trackCommandUsage(userId, commandName) {
  const p = ensureProfile(userId);
  p.favoriteCommands[commandName] = (p.favoriteCommands[commandName] || 0) + 1;
  if (commandName === 'filosofia' && p.favoriteCommands[commandName] > 1) {
    p.stylePreference = 'intelectual';
  }
  if (commandName === 'minecraft' || commandName === 'moderacao') {
    p.stylePreference = 'pratico';
  }
  p.lastUpdated = Date.now();
}

function getUserProfile(userId) {
  return profiles.get(userId) || ensureProfile(userId);
}

function getPersonalizationOptions(userId, content, context) {
  metrics.personalizedCount += 1;
  const p = getUserProfile(userId);
  // complexity factor balances enrichment
  const complexity = Math.min(0.8, Math.max(0.2, p.avgMessageLength / 500));
  return {
    estilo: p.stylePreference || 'pratico',
    complexidade: complexity,
    contextoGlobal: mostActiveGlobalHour(),
  };
}

function mostActiveGlobalHour() {
  let max = -1; let idx = 0;
  for (let i = 0; i < globalActivityByHour.length; i++) {
    if (globalActivityByHour[i] > max) { max = globalActivityByHour[i]; idx = i; }
  }
  return idx;
}

function recordOutcome(userId, outcome = {}) {
  const rt = outcome.responseTimeMs || outcome.responseTime || 0;
  if (rt > 0) {
    metrics.samples += 1;
    metrics.avgResponseTimeMs = metrics.avgResponseTimeMs === 0 ? rt : (metrics.avgResponseTimeMs * 0.95 + rt * 0.05);
  }
}

function getMetrics() {
  return { ...metrics, profilesCount: profiles.size };
}

function flushToDisk() {
  try {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const out = {
      metrics: getMetrics(),
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(dataDir, 'personalization.json'), JSON.stringify(out, null, 2));
    metrics.lastFlush = Date.now();
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  initPersonalization,
  analyzeLogsOnce,
  trackMessage,
  trackCommandUsage,
  getUserProfile,
  getPersonalizationOptions,
  recordOutcome,
  getMetrics,
  flushToDisk,
};