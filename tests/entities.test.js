import { describe, it, expect } from 'vitest';
const { extractEntities } = require('../src/conversation/entities');
const pe = require('../src/utils/personalizationEngine');

describe('Entidades e contexto', () => {
  it('extrai nomes, locais e interesses', () => {
    const e = extractEntities('Oi Luana, sou Ana Clara de São Paulo e curto xadrez.');
    expect(e.names.length).toBeGreaterThanOrEqual(1);
    expect(e.locations.includes('são paulo')).toBe(true);
    expect(e.interests.includes('xadrez')).toBe(true);
  });

  it('grava dados contextuais no perfil', () => {
    const uid = 'user-ctx-1';
    pe.initPersonalization({});
    const e = extractEntities('Meu nome é João e moro no Rio de Janeiro, adoro minecraft');
    const p = pe.recordContextData(uid, e);
    expect(p.contextualData.names.length).toBeGreaterThan(0);
    expect(p.contextualData.locations.includes('rio de janeiro')).toBe(true);
    expect(p.preferencesImplicit.interesseTecnico).toBe(true);
  });
});