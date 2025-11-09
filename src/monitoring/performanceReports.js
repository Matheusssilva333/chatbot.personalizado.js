import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { synonymsDB } from '../utils/linguisticVariety.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const metricsPath = path.join(__dirname, '../../data/metrics.json');

// Inicializar arquivo de métricas se não existir
function initMetrics() {
  try {
    if (!fs.existsSync(metricsPath)) {
      const initialMetrics = {
        interactions: [],
        engagement: { averageConversationLength: 0, followUpUsageRate: 0 },
        diversity: { uniqueResponseRate: 0, synonymUsageRate: 0 },
        satisfaction: { averageRating: 0, totalRatings: 0 }
      };
      fs.writeFileSync(metricsPath, JSON.stringify(initialMetrics, null, 2));
    }
  } catch (error) {
    console.error('Erro ao inicializar arquivo de métricas:', error);
  }
}

// Registrar interação usuário-bot para cálculo de métricas
function recordInteraction(interactionData) {
  try {
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    metrics.interactions.push({
      timestamp: new Date().toISOString(),
      userId: interactionData.userId,
      userMessage: interactionData.userMessage,
      botResponse: interactionData.botResponse,
      followUpUsed: interactionData.followUpUsed || false,
      sentiment: interactionData.sentiment,
      intent: interactionData.intent
    });
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    // Atualizar métricas em tempo real
    calculateEngagementMetrics();
    calculateResponseDiversity();
  } catch (error) {
    console.error('Erro ao registrar interação:', error);
  }
}

// Calcular métricas de engajamento (comprimento médio de conversa, taxa de uso de follow-ups)
function calculateEngagementMetrics() {
  try {
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    if (metrics.interactions.length === 0) return;

    // Comprimento médio de conversa (baseado em interações consecutivas do mesmo usuário)
    const userConversations = {};
    metrics.interactions.forEach(inter => {
      if (!userConversations[inter.userId]) userConversations[inter.userId] = 0;
      userConversations[inter.userId]++;
    });
    const totalLength = Object.values(userConversations).reduce((a, b) => a + b, 0);
    metrics.engagement.averageConversationLength = (totalLength / Object.keys(userConversations).length).toFixed(2);

    // Taxa de uso de follow-ups
    const followUpCount = metrics.interactions.filter(inter => inter.followUpUsed).length;
    metrics.engagement.followUpUsageRate = ((followUpCount / metrics.interactions.length) * 100).toFixed(2);

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('Erro ao calcular métricas de engajamento:', error);
  }
}

// Calcular métricas de diversidade de respostas (taxa de respostas únicas, taxa de uso de sinônimos)
function calculateResponseDiversity() {
  try {
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    if (metrics.interactions.length === 0) return;

    // Taxa de respostas únicas
    const uniqueResponses = [...new Set(metrics.interactions.map(inter => inter.botResponse))].length;
    metrics.diversity.uniqueResponseRate = ((uniqueResponses / metrics.interactions.length) * 100).toFixed(2);

    // Taxa de uso de sinônimos (baseado em presença de sinônimos do banco de dados)

    const synonymUsedCount = metrics.interactions.filter(inter => {
      const responseWords = inter.botResponse.toLowerCase().split(/\s+/);
      return responseWords.some(word => Object.values(synonymsDB).flat().includes(word));
    }).length;
    metrics.diversity.synonymUsageRate = ((synonymUsedCount / metrics.interactions.length) * 100).toFixed(2);

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('Erro ao calcular métricas de diversidade:', error);
  }
}

// Registrar satisfação do usuário (avaliação 1-5)
function recordUserSatisfaction(userId, rating) {
  try {
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const validRating = Math.max(1, Math.min(5, rating));
    metrics.satisfaction.totalRatings++;
    metrics.satisfaction.averageRating = ((metrics.satisfaction.averageRating * (metrics.satisfaction.totalRatings - 1)) + validRating) / metrics.satisfaction.totalRatings;
    metrics.satisfaction.averageRating = metrics.satisfaction.averageRating.toFixed(2);

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('Erro ao registrar satisfação do usuário:', error);
  }
}

// Gerar relatório de desempenho em formato legível
function generatePerformanceReport() {
  try {
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    return `
RELATÓRIO DE DESEMPENHO DO BOT
=============================
Interações total: ${metrics.interactions.length}

ENGAJAMENTO:
- Comprimento médio de conversa: ${metrics.engagement.averageConversationLength} interações
- Taxa de uso de follow-ups: ${metrics.engagement.followUpUsageRate}%

DIVERSIDADE DE RESPOSTAS:
- Taxa de respostas únicas: ${metrics.diversity.uniqueResponseRate}%
- Taxa de uso de sinônimos: ${metrics.diversity.synonymUsageRate}%

SATISFAÇÃO DO USUÁRIO:
- Avaliação média: ${metrics.satisfaction.averageRating}/5
- Total de avaliações: ${metrics.satisfaction.totalRatings}
`;
  } catch (error) {
    console.error('Erro ao gerar relatório de desempenho:', error);
    return 'Erro ao gerar relatório de desempenho.';
  }
}

// Inicializar métricas ao carregar o módulo
initMetrics();

export {
  recordInteraction,
  calculateEngagementMetrics,
  calculateResponseDiversity,
  recordUserSatisfaction,
  generatePerformanceReport
};