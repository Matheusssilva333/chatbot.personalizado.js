import { describe, it, expect } from 'vitest';
const { evaluateTriggers } = require('../src/automation/intelligentAutomation');

describe('Triggers de automação', () => {
  it('detecta FAQ de minecraft com alta confiança', () => {
    const t = evaluateTriggers('Como montar servidor de Minecraft?', { stylePreference: 'pratico' }, [], ['minecraft']);
    const hasFaq = t.some(x => x.type === 'faq');
    expect(hasFaq).toBe(true);
  });

  it('dispara coleta de informações em mensagens curtas', () => {
    const t = evaluateTriggers('oi', { stylePreference: 'pratico' }, [], []);
    expect(t.some(x => x.type === 'coleta_info')).toBe(true);
  });
});