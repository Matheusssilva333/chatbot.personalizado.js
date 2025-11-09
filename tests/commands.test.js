import { describe, it, expect, vi, beforeEach } from 'vitest';

// Load command modules
import minecraft from '../src/commands/minecraft/index.js';
import filosofia from '../src/commands/filosofia/index.js';
import xadrez from '../src/commands/xadrez/index.js';
import moderacao from '../src/commands/moderacao/index.js';

function createInteractionMock({ subcommand, options = {} }) {
  const replies = [];
  const reply = vi.fn(async (payload) => {
    replies.push(payload);
  });

  const defaultOptions = {
    getSubcommand: () => subcommand,
    getUser: (name) => ({ id: 'user123', username: 'UserTest' }),
    getInteger: (name) => {
      if (name === 'minutos') return 5;
      if (name === 'quantidade') return 10;
      return 0;
    },
    getString: (name) => {
      if (name === 'razao') return 'Teste de razão';
      return null;
    },
  };

  const guildMemberMe = {
    permissions: { has: vi.fn(() => true) }
  };

  const targetMember = {
    moderatable: true,
    timeout: vi.fn(async () => {})
  };

  return {
    replies,
    reply,
    options: { ...defaultOptions, ...options },
    guild: {
      members: {
        me: guildMemberMe,
        fetch: vi.fn(async () => targetMember)
      }
    },
    channel: {
      permissionsFor: vi.fn(() => ({ has: vi.fn(() => true) })),
      bulkDelete: vi.fn(async (amount, filterOld) => ({ size: Math.min(amount, 10) }))
    }
  };
}

describe('Comandos: minecraft', () => {
  it('responde ao subcomando servidor com conteúdo esperado', async () => {
    const interaction = createInteractionMock({ subcommand: 'servidor' });
    await minecraft.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/Como criar um servidor de Minecraft/);
  });

  it('responde ao subcomando dicas com conteúdo esperado', async () => {
    const interaction = createInteractionMock({ subcommand: 'dicas' });
    await minecraft.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/Dicas para Minecraft/);
  });
});

describe('Comandos: filosofia', () => {
  it('responde ao subcomando hegel com conteúdo esperado', async () => {
    const interaction = createInteractionMock({ subcommand: 'hegel' });
    await filosofia.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/Reflexões sobre Hegel/);
  });

  it('responde ao subcomando intelectual com conteúdo esperado', async () => {
    const interaction = createInteractionMock({ subcommand: 'intelectual' });
    await filosofia.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/O que significa ser um intelectual/);
  });
});

describe('Comandos: xadrez', () => {
  it('responde ao subcomando dicas com conteúdo esperado', async () => {
    const interaction = createInteractionMock({ subcommand: 'dicas' });
    await xadrez.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/Dicas para melhorar no xadrez/);
  });

  it('responde ao subcomando carlsen com conteúdo esperado', async () => {
    const interaction = createInteractionMock({ subcommand: 'carlsen' });
    await xadrez.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/Magnus Carlsen/);
  });
});

describe('Comandos: moderacao', () => {
  it('executa timeout com permissões válidas', async () => {
    const interaction = createInteractionMock({ subcommand: 'timeout' });
    await moderacao.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/Aplicado timeout/);
  });

  it('limpa mensagens quando há permissão', async () => {
    const interaction = createInteractionMock({ subcommand: 'limpar' });
    await moderacao.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.replies[0].content).toMatch(/mensagens foram removidas/);
  });
});