import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Banco de dados de sinônimos e variações linguísticas
const synonymsPath = path.join(__dirname, '../../data/synonyms.json');
let synonymsDB = {
  // Verbos comuns
  "ajudar": ["auxiliar", "assistir", "socorrer", "apoiar", "colaborar"],
  "fazer": ["realizar", "executar", "efetuar", "concretizar", "elaborar"],
  "criar": ["desenvolver", "produzir", "gerar", "construir", "elaborar"],
  "entender": ["compreender", "assimilar", "captar", "interpretar", "apreender"],
  "dizer": ["falar", "expressar", "comunicar", "mencionar", "relatar"],
  "ver": ["observar", "enxergar", "notar", "perceber", "contemplar"],
  "ir": ["dirigir-se", "partir", "deslocar-se", "caminhar", "avançar"],
  "ter": ["possuir", "dispor", "deter", "desfrutar", "apresentar"],
  "saber": ["conhecer", "dominar", "estar ciente", "ter ciência", "discernir"],
  
  // Adjetivos comuns
  "bom": ["ótimo", "excelente", "maravilhoso", "fantástico", "incrível", "positivo", "agradável"],
  "ruim": ["péssimo", "terrível", "horrível", "desagradável", "insatisfatório", "negativo", "detestável"],
  "importante": ["essencial", "fundamental", "crucial", "vital", "indispensável", "relevante", "significativo"],
  "difícil": ["complicado", "complexo", "desafiador", "árduo", "trabalhoso", "complicado", "intrincado"],
  "feliz": ["alegre", "contente", "satisfeito", "radiante", "jubiloso"],
  "triste": ["melancólico", "descontente", "abatido", "pesaroso", "infeliz"],
  "grande": ["enorme", "imenso", "vasto", "gigante", "considerável"],
  "pequeno": ["minúsculo", "ínfimo", "reduzido", "diminuto", "mínimo"],
  
  // Advérbios comuns
  "muito": ["extremamente", "consideravelmente", "bastante", "demasiadamente", "imensamente", "sobremaneira"],
  "rapidamente": ["velozmente", "prontamente", "ligeiramente", "agilmente", "celeremente", "depressa"],
  "certamente": ["definitivamente", "indubitavelmente", "seguramente", "incontestavelmente", "inquestionavelmente", "com certeza"],
  "agora": ["neste momento", "atualmente", "já", "imediatamente", "prontamente"],
  "sempre": ["constantemente", "eternamente", "invariavelmente", "perpetuamente", "a todo tempo"],
  
  // Expressões de transição
  "além disso": ["adicionalmente", "ademais", "outrossim", "ainda mais", "somado a isso", "também"],
  "por exemplo": ["como ilustração", "a título de exemplo", "para exemplificar", "como demonstração", "tal como", "ilustrativamente"],
  "em conclusão": ["para finalizar", "concluindo", "em suma", "finalizando", "para encerrar", "em síntese"],
  "no entanto": ["contudo", "todavia", "entretanto", "porém", "mas"],
  "portanto": ["assim", "desse modo", "consequentemente", "logo", "por conseguinte"],
  
  // Expressões de opinião
  "eu acho": ["na minha opinião", "do meu ponto de vista", "a meu ver", "segundo minha perspectiva", "conforme minha análise", "creio que"],
  "eu recomendo": ["eu sugiro", "eu aconselho", "eu indico", "eu proponho", "eu preconizo", "minha sugestão é"],
  "acredito que": ["considero que", "tenho a convicção de que", "parece-me que", "sou da opinião de que"],
  
  // Outras palavras e frases
  "obrigado": ["grato", "agradecido", "muito obrigado", "valeu"],
  "desculpe": ["perdão", "sinto muito", "minhas desculpas", "lamento"],
  "sim": ["claro", "com certeza", "positivo", "afirmativo", "ok"],
  "não": ["negativo", "de jeito nenhum", "nem pensar", "jamais", "não mesmo"]
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
      "ADVÉRBIO, SUJEITO VERBO OBJETO.",
      "Que tal SUJEITO VERBO OBJETO?",
      "Pense nisto: SUJEITO VERBO OBJETO.",
      "Acredito que SUJEITO VERBO OBJETO."
    ]
  },
  {
    type: "pergunta",
    templates: [
      "VERBO SUJEITO OBJETO?",
      "Como VERBO SUJEITO OBJETO?",
      "Seria possível VERBO OBJETO?",
      "SUJEITO poderia VERBO OBJETO?",
      "ADVÉRBIO SUJEITO VERBO OBJETO?",
      "O que você acha sobre VERBO OBJETO?",
      "Você já considerou VERBO OBJETO?",
      "Curioso para saber: VERBO OBJETO?"
    ]
  },
  {
    type: "sugestao",
    templates: [
      "Sugiro que SUJEITO VERBO OBJETO.",
      "Uma boa opção seria VERBO OBJETO.",
      "Considere VERBO OBJETO.",
      "Talvez seja interessante VERBO OBJETO.",
      "SUJEITO poderia considerar VERBO OBJETO.",
      "Que tal experimentar VERBO OBJETO?",
      "Minha recomendação é VERBO OBJETO.",
      "Poderíamos tentar VERBO OBJETO."
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
function enrichText(text, overallSentiment, intent, complexity = 0.5) {
  let enrichedText = text;
  let substitutionProbability = Math.min(0.8, complexity);

  // Ajustar a probabilidade de substituição com base no sentimento geral
  if (overallSentiment === 'very positive' || overallSentiment === 'very negative') {
    substitutionProbability = Math.min(0.9, complexity + 0.2); // Mais variações para sentimentos fortes
  } else if (overallSentiment === 'positive' || overallSentiment === 'negative') {
    substitutionProbability = Math.min(0.85, complexity + 0.1); // Variações moderadas
  } else if (overallSentiment === 'neutral') {
    substitutionProbability = Math.max(0.3, complexity - 0.1); // Menos variações para neutralidade
  }

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
function varyStructure(message, overallSentiment, intent, type = null) {
  // Se nenhum tipo for especificado, detectar com base no conteúdo
  if (!type) {
    if (message.endsWith('?')) {
      type = 'pergunta';
    } else if (message.includes('sugiro') || message.includes('recomendo') || message.includes('considere') || message.includes('talvez')) {
      type = 'sugestao';
    } else {
      // Usar o sentimento para influenciar o tipo de estrutura padrão
      if (overallSentiment === 'very positive' || overallSentiment === 'positive') {
        type = 'afirmativa_simples'; // Ou talvez um tipo mais entusiástico se houver
      } else if (overallSentiment === 'very negative' || overallSentiment === 'negative') {
        type = 'afirmativa_simples'; // Ou um tipo mais cauteloso
      } else {
        type = 'afirmativa_simples';
      }
    }
  }
  
  // Encontrar estruturas correspondentes ao tipo
  const structures = sentenceStructures.find(s => s.type === type);
  
  // Se não encontrar estruturas, retornar mensagem original
  if (!structures) return message;
  
  // 50% de chance de variar a estrutura para maior dinamismo
  if (Math.random() < 0.5) {
    const template = structures.templates[Math.floor(Math.random() * structures.templates.length)];
    
    // Esta é uma implementação simplificada. Um parser mais robusto seria necessário
    // para mapear SUJEITO, VERBO, OBJETO, etc., de forma inteligente.
    // Por enquanto, faremos substituições básicas ou retornaremos o template se for muito diferente.
    
    let variedMessage = template;
    
    // Tentativa de substituir placeholders básicos
    variedMessage = variedMessage.replace(/SUJEITO/, 'você'); // Exemplo simples
    variedMessage = variedMessage.replace(/VERBO/, 'fazer'); // Exemplo simples
    variedMessage = variedMessage.replace(/OBJETO/, 'isso'); // Exemplo simples
    variedMessage = variedMessage.replace(/ADJETIVO/, 'bom'); // Exemplo simples
    variedMessage = variedMessage.replace(/ADVÉRBIO/, 'rapidamente'); // Exemplo simples

    // Se a mensagem original for muito curta, podemos usar o template diretamente
    if (message.split(' ').length < 5 && Math.random() < 0.7) {
      return variedMessage;
    }
    
    // Caso contrário, tentamos incorporar partes da mensagem original ou manter a original
    // Esta parte é a mais complexa e exigiria NLP avançado para ser perfeita.
    // Por simplicidade, vamos apenas retornar o template variado ou a mensagem original.
    return variedMessage; // Retorna o template variado para demonstração
  }
  
  return message;
}

// Adicionar elementos criativos como emojis, interjeições ou formatação
function addCreativeFlair(message, overallSentiment, intent) {
  let creativeMessage = message;
  const random = Math.random();

  // Adicionar emojis baseados no sentimento
  if (overallSentiment === 'very positive' && random < 0.6) { // Muito positivo
    creativeMessage += ' ✨🤩';
  } else if (overallSentiment === 'positive' && random < 0.4) { // Positivo
    creativeMessage += ' 😊';
  } else if (overallSentiment === 'very negative' && random < 0.5) { // Muito negativo
    creativeMessage += ' 😭💔';
  } else if (overallSentiment === 'negative' && random < 0.3) { // Negativo
    creativeMessage += ' 😟';
  } else if (random < 0.2) { // Neutro ou aleatório
    const emojis = ['💡', '🤔', '🚀', '😂', '🤩']; // Adicionado emojis de humor
    creativeMessage += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
  }

  // Adicionar interjeições ou frases de efeito baseadas na intenção
  if (intent === 'greeting' && random < 0.5) {
    creativeMessage = 'Olá! ' + creativeMessage;
  } else if (intent === 'farewell' && random < 0.5) {
    creativeMessage += ' Até mais!';
  } else if (intent === 'help' && random < 0.4) {
    creativeMessage = 'Com certeza! ' + creativeMessage;
  } else if (random < 0.15) { // Aumentada a chance de interjeições aleatórias
    const interjections = ['Uau!', 'Que interessante!', 'Entendi!', 'Perfeito!', 'Hahaha!', 'Ops!', 'Surpresa!']; // Adicionado humor
    creativeMessage = interjections[Math.floor(Math.random() * interjections.length)] + ' ' + creativeMessage;
  }

  // Adicionar elementos de surpresa/humor baseados no conteúdo ou contexto
  if (message.toLowerCase().includes('piada') && random < 0.8) {
    const jokes = [
      "Por que o programador foi à praia? Para ver o mar, mas só encontrou a web.",
      "Qual é o animal mais antigo? A zebra, porque é preto e branco.",
      "O que o tomate foi fazer no banco? Foi tirar extrato."
    ];
    creativeMessage += `\n${jokes[Math.floor(Math.random() * jokes.length)]}`;
  } else if (message.toLowerCase().includes('segredo') && random < 0.6) {
    creativeMessage += " Shhh... isso é só entre nós! 😉";
  } else if (random < 0.08) { // Pequena chance de uma reviravolta inesperada
    const twists = [
      "Mas espere, tem mais!",
      "E se eu te dissesse que...",
      "Prepare-se para o inesperado!"
    ];
    creativeMessage += ` ${twists[Math.floor(Math.random() * twists.length)]}`;
  }

  // Adicionar formatação criativa (ex: negrito, itálico - se o ambiente suportar Markdown)\n\n  if (random < 0.20) { // Aumentada a chance de formatação\n    creativeMessage = `*${creativeMessage}*`; // Itálico\n  } else if (random < 0.10) { // Aumentada a chance de negrito\n    creativeMessage = `**${creativeMessage}**`; // Negrito\n  } else if (message.toLowerCase().includes(\'spoiler\') && random < 0.7) {\n    creativeMessage = `||${creativeMessage}||`; // Spoiler\n  } else if (random < 0.05) {\n    creativeMessage = `\`\`\`\\n${creativeMessage}\\n\`\`\``; // Bloco de código\n  }\n\n  return creativeMessage;\n}\n
  return creativeMessage;
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

export {
  initLinguisticVariety,
  enrichText,
  varyStructure,
  addSynonym,
  addCreativeFlair,
  synonymsDB
};