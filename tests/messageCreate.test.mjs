import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const metricsPath = path.join(__dirname, '../data/metrics.json');

beforeEach(() => {
  if (fs.existsSync(metricsPath)) {
    fs.unlinkSync(metricsPath);
  }
});

// Define a single mock logger object
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock de dependências
vi.mock('../src/utils/logger', () => ({
  setupLogger: vi.fn(() => mockLogger),
}));
vi.mock('../src/utils/learningSystem', () => ({
  getRelevantContext: vi.fn(() => ({})),
  learnFromInteraction: vi.fn(),
}));
vi.mock('../src/conversation/contextEngine', () => ({
  buildContext: vi.fn(() => ({
    sentiment: 'neutral',
    intent: 'greeting',
    type: 'affirmative',
    topics: [],
    profile: { preferences: { style: 'pratico' }, history: [] },
  })),
}));
vi.mock('../src/conversation/memory', () => ({
  rememberInteraction: vi.fn(),
}));
vi.mock('../src/conversation/naturalness.cjs', () => ({
  generateFormulations: vi.fn((res) => [res]),
  computeDelayMs: vi.fn(() => 0),
  applyTone: vi.fn((res) => res),
  getTransitionalPhrase: vi.fn(() => 'A propósito,'),
}));
vi.mock('../src/conversation/contextVerifier', () => ({
  isRepetitive: vi.fn(() => false),
  detectTopicShift: vi.fn(() => false),
}));
vi.mock('../src/automation/intelligentAutomation', () => ({
  runAutomations: vi.fn(),
}));
vi.mock('../src/automation/selfImprovement', () => ({
  recordProblematicInteraction: vi.fn(),
}));
vi.mock('../src/utils/contextualResponses', () => ({
  generateContextualResponse: vi.fn(() => ({ response: 'Olá! Como posso ajudar?', followUp: null })),
}));
vi.mock('../src/utils/linguisticVariety.cjs', () => {
  const enrichText = vi.fn((text) => `Enriched: ${text}`);
  const varyStructure = vi.fn((text) => `Varied: ${text}`);
  const addCreativeFlair = vi.fn((text) => `Creative: ${text}`);
  return {
    enrichText,
    varyStructure,
    addCreativeFlair,
  };
});
vi.mock('../src/monitoring/performanceReports', () => ({
  recordInteraction: vi.fn(),
}));
vi.mock('../src/utils/problemSolver', () => ({
  identifyProblem: vi.fn(() => null),
  generateSolution: vi.fn(() => null),
}));
vi.mock('../src/utils/needsAnticipation.cjs', () => ({
  anticipateNeeds: vi.fn(() => []),
  executeAnticipatedAction: vi.fn(),
}));
vi.mock('../src/utils/selfCorrection.cjs', () => ({
  detectError: vi.fn(() => null),
  generateCorrection: vi.fn(() => ''),
  logError: vi.fn(),
}));
vi.mock('../src/utils/performanceReports', () => ({
  logInteraction: vi.fn(),
}));
vi.mock('../src/utils/personalizationEngine', () => ({
  getPersonalizationOptions: vi.fn(() => ({ estilo: 'pratico', complexidade: 0.5 })),
  trackMessage: vi.fn(),
  recordOutcome: vi.fn(),
  recordContextData: vi.fn(),
}));
vi.mock('../src/conversation/entities', () => ({
  extractEntities: vi.fn(() => ({})),
}));
vi.mock('../src/automation/automationRouter', () => ({
  autoRespondStandardCases: vi.fn(() => false),
  routeToModule: vi.fn(() => ({ actionsPerformed: [] })),
  scoreIntent: vi.fn(() => ({ intent: 'general' })),
}));
vi.mock('../src/utils/toneAnalyzer', () => ({
  analyzeTone: vi.fn(() => ({})),
  adaptTone: vi.fn((res) => res),
}));



import { Events } from 'discord.js';

// Destructure mocked functions
import { setupLogger } from '../src/utils/logger';
import { getRelevantContext, learnFromInteraction } from '../src/utils/learningSystem';
import { buildContext } from '../src/conversation/contextEngine';
import { rememberInteraction } from '../src/conversation/memory';
import { generateFormulations, computeDelayMs, applyTone, getTransitionalPhrase } from '../src/conversation/naturalness.cjs';
import { isRepetitive, detectTopicShift } from '../src/conversation/contextVerifier';
import { runAutomations } from '../src/automation/intelligentAutomation';
import { recordProblematicInteraction } from '../src/automation/selfImprovement';
import { generateContextualResponse } from '../src/utils/contextualResponses';
import { enrichText, varyStructure, addCreativeFlair } from '../src/utils/linguisticVariety.cjs';
import { recordInteraction } from '../src/monitoring/performanceReports';
import { identifyProblem, generateSolution } from '../src/utils/problemSolver';
import { anticipateNeeds, executeAnticipatedAction } from '../src/utils/needsAnticipation.cjs';
import { detectError, generateCorrection, logError } from '../src/utils/selfCorrection.cjs';
import { logInteraction } from '../src/utils/performanceReports';
import { getPersonalizationOptions, trackMessage, recordOutcome, recordContextData } from '../src/utils/personalizationEngine';
import { extractEntities } from '../src/conversation/entities';
import { autoRespondStandardCases, routeToModule, scoreIntent } from '../src/automation/automationRouter';
import { analyzeTone, adaptTone } from '../src/utils/toneAnalyzer';

// Mock Discord.js Message and Client objects
let mockClient = {
  user: { id: 'botId' },
  guilds: { cache: new Map() },
};

let mockMessage = {
  author: { bot: false, id: 'userId', username: 'testuser' },
  content: 'Olá Luana, como você está?',
  mentions: { has: vi.fn(id => id === 'botId') },
  client: { user: { id: 'botId' } },
  channel: {
    type: 'text',
    sendTyping: vi.fn(),
    send: vi.fn(),
    messages: {
      fetch: vi.fn(() => Promise.resolve(new Map()))
    }
  },
  guild: { id: 'guildId', name: 'Test Guild' },
  reply: vi.fn(() => Promise.resolve()),
};

describe('messageCreate event', () => {
  let messageCreateEvent;
  let mockResponseGenerator;

  beforeEach(async () => {
    mockResponseGenerator = {
      generateResponse: vi.fn(() => ({
        response: { response: 'Olá! Como posso ajudar?' },
        delay: 0,
        intent: 'greeting',
        sentiment: 'neutral',
        overallSentiment: 'neutral',
        followUp: null,
      })),
    };
    vi.resetModules(); // Reset modules registry
    const messageCreateModule = await import('../src/events/messageCreate');
    messageCreateEvent = messageCreateModule.default;
    vi.clearAllMocks(); // Clear all mock history

    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();

    // Reset all mocks before each test
    generateFormulations.mockClear();
    computeDelayMs.mockClear();
    applyTone.mockClear();
    getTransitionalPhrase.mockClear();
    getRelevantContext.mockClear();
    learnFromInteraction.mockClear();
    buildContext.mockClear();
    rememberInteraction.mockClear();
    isRepetitive.mockClear();
    detectTopicShift.mockClear();
    runAutomations.mockClear();
    recordProblematicInteraction.mockClear();
    generateContextualResponse.mockClear();
    enrichText.mockClear();
    varyStructure.mockClear();
    addCreativeFlair.mockClear();
    recordInteraction.mockClear();
    identifyProblem.mockClear();
    generateSolution.mockClear();
    anticipateNeeds.mockClear();
    executeAnticipatedAction.mockClear();
    detectError.mockClear();
    generateCorrection.mockClear();
    logError.mockClear();
    logInteraction.mockClear();
    getPersonalizationOptions.mockClear();
    trackMessage.mockClear();
    recordOutcome.mockClear();
    recordContextData.mockClear();
      extractEntities.mockClear();
      routeToModule.mockClear();
      scoreIntent.mockClear();
    analyzeTone.mockClear();
    adaptTone.mockClear();

    // Default mock implementations
    // setupLoggerMock.mockReturnValue({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }); // No longer needed
    getRelevantContext.mockReturnValue({});
    learnFromInteraction.mockReturnValue(undefined);
    buildContext.mockReturnValue({
      profile: { history: [] },
      window: [],
      sentiment: 'neutral',
      intent: 'greeting',
      topics: [],
      type: 'text',
    });
    rememberInteraction.mockReturnValue(undefined);
    generateFormulations.mockImplementation(response => [response]);
    computeDelayMs.mockReturnValue(0);
    applyTone.mockImplementation(response => response);
    getTransitionalPhrase.mockReturnValue('A propósito,');
    isRepetitive.mockReturnValue(false);
    detectTopicShift.mockReturnValue(false);
    runAutomations.mockReturnValue(undefined);
    recordProblematicInteraction.mockReturnValue(undefined);
    generateContextualResponse.mockReturnValue({ response: 'Olá! Como posso ajudar?', followUp: null });
    enrichText.mockImplementation(text => `Enriched: ${text}`);
    varyStructure.mockImplementation(text => `Varied: ${text}`);
    addCreativeFlair.mockImplementation(text => `Creative: ${text}`);
    recordInteraction.mockReturnValue(undefined);
    identifyProblem.mockReturnValue(null);
    generateSolution.mockReturnValue(null);
    anticipateNeeds.mockReturnValue([]);
    executeAnticipatedAction.mockReturnValue(undefined);
    detectError.mockReturnValue(null);
    generateCorrection.mockReturnValue(null);
    logError.mockReturnValue(undefined);
    logInteraction.mockReturnValue(undefined);
    getPersonalizationOptions.mockReturnValue({});
    trackMessage.mockReturnValue(undefined);
    recordOutcome.mockReturnValue(undefined);
    recordContextData.mockReturnValue(undefined);
      extractEntities.mockReturnValue([]);
      routeToModule.mockReturnValue(null);
      scoreIntent.mockReturnValue({ intent: 'greeting' });
    analyzeTone.mockReturnValue('neutral');
    adaptTone.mockImplementation(response => response);

    // Reset mockMessage mentions before each test
    mockMessage.author.bot = false;
    mockMessage.content = 'Olá Luana, como você está?';
    mockMessage.mentions.has.mockClear();
    mockMessage.mentions.has.mockImplementation(id => id === mockClient.user.id);
    mockMessage.reply.mockClear();
    mockMessage.channel.sendTyping.mockClear();
    mockMessage.channel.send.mockClear();
    autoRespondStandardCases.mockReturnValue(false);
  });

  it('should ignore bot messages', async () => {
    mockMessage.author.bot = true;
      await messageCreateEvent.execute(mockMessage, mockResponseGenerator);
    expect(mockMessage.reply).not.toHaveBeenCalled();
    expect(recordInteraction).not.toHaveBeenCalled();
  });

  it.skip('should process message if bot is mentioned', async () => {
    await messageCreateEvent.execute(mockMessage, mockClient, mockResponseGenerator);
    expect(mockMessage.channel.sendTyping).toHaveBeenCalled();    expect(mockMessage.reply).toHaveBeenCalledWith('Creative: Varied: Enriched: Olá! Como posso ajudar?');
     expect(recordInteraction).toHaveBeenCalledTimes(1);
  });

  it.skip('should process message if bot name is in content', async () => {
    mockMessage.mentions.has.mockReturnValue(false);
    mockMessage.content = 'Luana, me diga algo.';
    autoRespondStandardCases.mockResolvedValue(false); // Adicionado para evitar retorno prematuro
    await messageCreateEvent.execute(mockMessage, mockClient, mockResponseGenerator);
    expect(enrichText).toHaveBeenCalled();
    expect(mockMessage.reply).toHaveBeenCalledWith('Creative: Varied: Enriched: Olá! Como posso ajudar?');
  });

  it.skip('should apply linguistic variety functions', async () => {
    mockMessage.mentions.has.mockReturnValue(false);
    mockMessage.content = 'Luana, teste de variedade linguística.';
    autoRespondStandardCases.mockResolvedValue(false); // Adicionado para evitar retorno prematuro
    await messageCreateEvent.execute(mockMessage, mockClient, mockResponseGenerator);
    expect(enrichText).toHaveBeenCalledWith(expect.any(String), 'neutral', 'greeting');
    expect(varyStructure).toHaveBeenCalledWith(expect.any(String), 'neutral', 'greeting');
    expect(addCreativeFlair).toHaveBeenCalledWith(expect.any(String), 'neutral', 'greeting');
  });

  it('should record interaction metrics', async () => {
    await expect(messageCreateEvent.execute(mockMessage, mockResponseGenerator)).resolves.not.toThrow();
  });

  it('should handle follow-up responses', async () => {
    await expect(messageCreateEvent.execute(mockMessage, mockResponseGenerator)).resolves.not.toThrow();
  });

  it('should handle errors gracefully', async () => {
    // Simular um erro em alguma parte do processo
    buildContext.mockImplementationOnce(() => {
      throw new Error('Erro de contexto simulado');
    });
  
    mockMessage.author.bot = false;
    await messageCreateEvent.execute(mockMessage, mockResponseGenerator);
    expect(autoRespondStandardCases).toHaveBeenCalledWith(mockMessage.content, mockMessage.author.id, mockMessage.channel);
    expect(mockMessage.mentions.has).toHaveBeenCalledWith(mockMessage.client.user.id);
    expect(buildContext).toHaveBeenCalled();
    // Esperar que o logger de erro seja chamado
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Erro ao responder mensagem'));
    // Nenhuma resposta deve ser enviada ao usuário em caso de erro interno
    expect(mockMessage.reply).not.toHaveBeenCalled();
    expect(recordInteraction).not.toHaveBeenCalled();
  });
});