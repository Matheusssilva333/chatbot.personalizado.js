import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const patternsPath = path.join(__dirname, '../../data/patterns.json');
let patternsDB = {};

function initThematicCohesion() {
  try {
    if (fs.existsSync(patternsPath)) {
      // Para arquivos grandes, podemos carregar apenas uma parte ou usar um stream
      // Por simplicidade, vamos tentar carregar o arquivo inteiro, mas em produção, isso precisaria ser otimizado
      patternsDB = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
    } else {
      console.warn('patterns.json não encontrado. Coesão temática pode ser limitada.');
    }
  } catch (error) {
    console.error('Erro ao inicializar padrões temáticos:', error);
  }
}

function getThematicPatterns(topics, limit = 5) {
  if (!topics || topics.length === 0) {
    return [];
  }

  let allPatterns = new Set();
  topics.forEach(topic => {
    if (patternsDB[topic]) {
      patternsDB[topic].forEach(pattern => allPatterns.add(pattern));
    }
  });

  const uniquePatterns = Array.from(allPatterns);
  const shuffled = [...uniquePatterns].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

export {
  initThematicCohesion,
  getThematicPatterns,
};