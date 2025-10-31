const fs = require('fs');
const path = require('path');

// Banco de dados de sinônimos e variações linguísticas
const synonymsPath = path.join(__dirname, '../../data/synonyms.json');
let synonymsDB = {
  // Verbos comuns
  "ajudar": ["auxiliar", "assistir", "socorrer", "apoiar", "colaborar"],
  "fazer": ["realizar", "executar", "efetuar", "concretizar", "elaborar"],
  "criar": ["desenvolver", "produzir", "gerar", "construir", "elaborar"],
  "entender": ["compreender", "assimilar", "captar", "interpretar", "apreender"],
  
  // Adjetivos comuns
  "bom": ["ótimo", "excelente", "maravilhoso", "fantástico", "incrível"],
  "ruim": ["péssimo", "terrível", "horrível", "desagradável", "insatisfatório"],
  "importante": ["essencial", "fundamental", "crucial", "vital", "indispensável"],
  "difícil": ["complicado", "complexo", "desafiador", "árduo", "trabalhoso"],
  
  // Advérbios comuns
  "muito": ["extremamente", "consideravelmente", "bastante", "demasiadamente", "imensamente"],
  "rapidamente": ["velozmente", "prontamente", "ligeiramente", "agilmente", "celeremente"],
  "certamente": ["definitivamente", "indubitavelmente", "seguramente", "incontestavelmente", "inquestionavelmente"],
  
  // Expressões de transição
  "além disso": ["adicionalmente", "ademais", "outrossim", "ainda mais", "somado a isso"],
  "por exemplo": ["como ilustração", "a título de exemplo", "para exemplificar", "como demonstração", "tal como"],
  "em conclusão": ["para finalizar", "concluindo", "em suma", "finalizando", "para encerrar"],
  
  // Expressões de opinião
  "eu acho": ["na minha opinião", "do meu ponto de vista", "a meu ver", "segundo minha perspectiva", "conforme minha análise"],
  "eu recomendo": ["eu sugiro", "eu aconselho", "eu indico", "eu proponho", "eu preconizo"]
};

// Estruturas de frases para variação
const sentenceStructures = [
  {
    type: "afirmativa_simples",
    templates: [
      "SUJEITO VERBO OBJETO.",
      "VERBO-SE que SUJEITO OBJETO.",
      "É ADJETIVO que SUJEITO VERBO OBJETO.",
      "OBJETO, SUJEITO VERBO.",
      "ADVÉRBIO, SUJEITO VERBO OBJETO."
    ]
  },
  {
    type: "pergunta",
    templates: [
      "VERBO SUJEITO OBJETO?",
      "Como VERBO SUJEITO OBJETO?",
      "Seria possível VERBO OBJETO?",
      "SUJEITO poderia VERBO OBJETO?",
      "ADVÉRBIO SUJEITO VERBO OBJETO?"
    ]
  },
  {
    type: "sugestao",
    templates: [
      "Sugiro que SUJEITO VERBO OBJETO.",
      "Uma boa opção seria VERBO OBJETO.",
      "Considere VERBO OBJETO.",
      "Talvez seja interessante VERBO OBJETO.",
      "SUJEITO poderia considerar VERBO OBJETO."
    ]
  }
];

// Inicializar o sistema de variação linguística
function initLinguisticVariety() {
  try {
    // Criar diretório de dados se não existir
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Carregar sinônimos existentes ou criar novo arquivo
    if (fs.existsSync(synonymsPath)) {
      synonymsDB = JSON.parse(fs.readFileSync(synonymsPath, 'utf8'));
    } else {
      fs.writeFileSync(synonymsPath, JSON.stringify(synonymsDB, null, 2));
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de sinônimos:', error);
  }
}

// Enriquecer texto com variações linguísticas
function enrichText(text, complexity = 0.5) {
  // Aplicar substituições de palavras com base na complexidade
  let enrichedText = text;
  
  // Quanto maior a complexidade, mais substituições serão feitas
  const substitutionProbability = Math.min(0.8, complexity);
  
  // Substituir palavras por sinônimos
  Object.keys(synonymsDB).forEach(word => {
    // Criar regex para encontrar a palavra completa (não parte de outra palavra)
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    
    // Substituir apenas se a probabilidade for atendida
    if (Math.random() < substitutionProbability && regex.test(enrichedText)) {
      const synonyms = synonymsDB[word];
      const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
      
      // Preservar capitalização
      enrichedText = enrichedText.replace(regex, match => {
        if (match === match.toUpperCase()) return synonym.toUpperCase();
        if (match[0] === match[0].toUpperCase()) return synonym.charAt(0).toUpperCase() + synonym.slice(1);
        return synonym;
      });
    }
  });
  
  return enrichedText;
}

// Variar estrutura da frase
function varyStructure(message, type = null) {
  // Se nenhum tipo for especificado, detectar com base no conteúdo
  if (!type) {
    if (message.endsWith('?')) {
      type = 'pergunta';
    } else if (message.includes('sugiro') || message.includes('recomendo') || message.includes('considere')) {
      type = 'sugestao';
    } else {
      type = 'afirmativa_simples';
    }
  }
  
  // Encontrar estruturas correspondentes ao tipo
  const structures = sentenceStructures.find(s => s.type === type);
  
  // Se não encontrar estruturas, retornar mensagem original
  if (!structures) return message;
  
  // 30% de chance de variar a estrutura
  if (Math.random() < 0.3) {
    // Selecionar uma estrutura aleatória
    const template = structures.templates[Math.floor(Math.random() * structures.templates.length)];
    
    // Implementação simplificada - na prática, seria necessário um parser mais sofisticado
    // Esta é uma versão básica para demonstração
    if (type === 'afirmativa_simples') {
      // Exemplo simples: substituir "Eu vou ajudar você" por "Vou ajudar você"
      return message.replace(/^Eu /, '');
    } else if (type === 'pergunta') {
      // Exemplo simples: adicionar "Você gostaria que" no início de perguntas
      if (!message.startsWith('Você gostaria')) {
        return `Você gostaria que ${message.toLowerCase()}`;
      }
    } else if (type === 'sugestao') {
      // Exemplo simples: substituir "Sugiro" por "Recomendo"
      return message.replace(/^Sugiro/, 'Recomendo');
    }
  }
  
  return message;
}

// Adicionar novo sinônimo ao banco de dados
function addSynonym(word, synonym) {
  if (!synonymsDB[word]) {
    synonymsDB[word] = [];
  }
  
  // Verificar se o sinônimo já existe
  if (!synonymsDB[word].includes(synonym)) {
    synonymsDB[word].push(synonym);
    
    // Salvar no arquivo
    try {
      fs.writeFileSync(synonymsPath, JSON.stringify(synonymsDB, null, 2));
      return true;
    } catch (error) {
      console.error('Erro ao salvar novo sinônimo:', error);
      return false;
    }
  }
  
  return false;
}

module.exports = {
  initLinguisticVariety,
  enrichText,
  varyStructure,
  addSynonym
};