import { describe, it, expect } from 'vitest';
const { rememberInteraction, getRecentInteractions, getCurrentTopics } = require('../src/conversation/memory');

describe('Memória contextual', () => {
  it('armazena e recupera últimas 3 interações', () => {
    const uid = 'u1';
    for (let i = 0; i < 5; i++) {
      rememberInteraction(uid, `msg${i}`, `resp${i}`);
    }
    const win = getRecentInteractions(uid, 3);
    expect(win.length).toBe(3);
    expect(win[0].message).toBe('msg2');
    expect(win[2].response).toBe('resp4');
  });

  it('identifica tópicos correntes', () => {
    const uid = 'u2';
    rememberInteraction(uid, 'minecraft servidor', 'ok');
    rememberInteraction(uid, 'lag fps', 'ok');
    const topics = getCurrentTopics(uid);
    expect(topics[0]).toBe('minecraft');
  });
});