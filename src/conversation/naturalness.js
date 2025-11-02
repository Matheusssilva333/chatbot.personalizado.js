function generateFormulations(base, profile = {}, count = 5) {
  const b = String(base || '');
  const style = profile.stylePreference || 'pratico';
  const variants = [];
  const soften = (txt) => txt.replace(/\b(precisa|deve)\b/gi, 'pode');
  const colloquial = (txt) => txt.replace(/você/gi, 'vc').replace(/não/gi, 'num');
  const formal = (txt) => txt.replace(/vc/gi, 'você').replace(/num/gi, 'não');
  const punct = (txt) => (txt.endsWith('.') ? txt.slice(0, -1) + '!' : txt + '.');
  const question = (txt) => (txt.endsWith('.') ? txt.slice(0, -1) + '?' : txt + '?');

  const ops = [
    (t) => t,
    (t) => punct(t),
    (t) => soften(t),
    (t) => question(t),
    (t) => style === 'pratico' ? colloquial(t) : formal(t),
  ];
  for (let i = 0; i < count; i++) {
    const op = ops[i % ops.length];
    variants.push(op(b));
  }
  return variants;
}

function computeDelayMs(complexity = 0.5, textLen = 100) {
  // 0.5–1.5s for simples respostas; aumentar ligeiramente com complexidade
  const base = 500 + Math.min(1000, Math.floor(complexity * 1000));
  const add = Math.min(300, Math.floor(textLen / 200 * 300));
  return base + add;
}

function applyTone(text, profile = {}, context = {}) {
  const tone = profile.stylePreference || 'pratico';
  if (tone === 'intelectual') {
    return text.replace(/\b(ok)\b/gi, 'certo').replace(/\blegal\b/gi, 'interessante');
  }
  return text;
}

module.exports = {
  generateFormulations,
  computeDelayMs,
  applyTone,
};