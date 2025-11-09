import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Banco de dados de erros comuns e correções
const errorsPath = path.join(__dirname, '../../data/errors.json');
let errorsDB = {
  "informacao_incorreta": {
    patterns: ["isso não está certo", "informação errada", "incorreto", "não é verdade"],
    responses: [
      "Peço desculpas pela informação incorreta. A informação correta é: {correction}",
      "Você está certo, cometi um erro. A informação correta é: {correction}",
      "Obrigada pela correção. Você está certo, {correction}"
    ]
  },
  "comando_errado": {
    patterns: ["comando não funciona", "comando errado", "não é esse comando"],
    responses: [
      "Desculpe pelo comando incorreto. O comando correto é: {correction}",
      "Você tem razão, o comando correto é: {correction}",
      "Obrigada por apontar o erro. O comando correto é: {correction}"
    ]
  },
  "mal_entendido": {
    patterns: ["não foi isso que perguntei", "você não entendeu", "não é isso"],
    responses: [
      "Parece que não compreendi corretamente sua pergunta. Você poderia reformulá-la?",
      "Peço desculpas pelo mal-entendido. Vamos tentar novamente?",
      "Entendi incorretamente. Poderia esclarecer sua pergunta para que eu possa ajudar melhor?"
    ]
  }
};

// Inicializar o sistema de auto-correção
export function initSelfCorrection() {
  try {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (fs.existsSync(errorsPath)) {
      errorsDB = JSON.parse(fs.readFileSync(errorsPath, 'utf8'));
    } else {
      fs.writeFileSync(errorsPath, JSON.stringify(errorsDB, null, 2));
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de erros:', error);
  }
}

// Detectar erro com base na mensagem do usuário
export function detectError(message, previousResponse) {
  if (!message) return null;
  
  const lowerMessage = message.toLowerCase();
  let errorType = null;
  
  // Verificar cada tipo de erro
  Object.keys(errorsDB).forEach(type => {
    const patterns = errorsDB[type].patterns;
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      errorType = type;
    }
  });
  
  if (errorType) {
    return {
      type: errorType,
      previousResponse
    };
  }
  
  return null;
}

// Gerar resposta de correção
export function generateCorrection(error, correction = null) {
  if (!error || !error.type) {
    return "Peço desculpas pelo erro. Vamos tentar novamente.";
  }
  
  const errorType = error.type;
  const responses = errorsDB[errorType].responses;
  let response = responses[Math.floor(Math.random() * responses.length)];
  
  // Substituir placeholder por correção específica
  if (correction && response.includes("{correction}")) {
    response = response.replace("{correction}", correction);
  } else if (response.includes("{correction}")) {
    // Remover placeholder se não houver correção específica
    response = response.replace(" A informação correta é: {correction}", ".");
    response = response.replace(" O comando correto é: {correction}", ".");
    response = response.replace(", {correction}", ".");
  }
  
  return response;
}

// Registrar erro para aprendizado
export function logError(error, userMessage, botResponse) {
  // Implementação simplificada - apenas registra no console
  console.log("Erro detectado:", {
    type: error.type,
    userMessage,
    botResponse
  });
  
  // Em uma implementação completa, salvaria em um arquivo de log
  // ou banco de dados para análise posterior
}

// Analisar feedback do usuário para melhorar respostas futuras
export function learnFromFeedback(error, correction) {
  // Implementação simplificada - apenas registra no console
  console.log("Aprendendo com feedback:", {
    errorType: error.type,
    correction
  });
  
  // Em uma implementação completa, atualizaria o modelo de linguagem
  // ou banco de dados de respostas com base no feedback
}