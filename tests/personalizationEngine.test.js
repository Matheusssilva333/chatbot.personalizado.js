// Testes básicos para o motor de personalização
const { describe, it, expect } = require('vitest');
const pe = require('../src/utils/personalizationEngine.js');

describe('personalizationEngine', () => {
  it('inicializa e cria perfil ao rastrear mensagem', () => {
    pe.initPersonalization({});
    pe.trackMessage('user-1', 'luana, qual o status do servidor?');
    const p = pe.getUserProfile('user-1');
    expect(p).toBeDefined();
    expect(p.serverInterest).toBeGreaterThan(0);
  });

  it('gera opções de personalização consistentes', () => {
    const opts = pe.getPersonalizationOptions('user-1', 'texto de exemplo', {});
    expect(opts).toHaveProperty('estilo');
    expect(opts).toHaveProperty('complexidade');
    expect(opts.complexidade).toBeGreaterThan(0);
  });
});