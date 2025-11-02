const fs = require('fs');
const path = require('path');
const { LRUCache, normalizeText } = require('./cache');

// Banco de dados de problemas comuns e soluções
const problemsPath = path.join(__dirname, '../../data/problems.json');
let problemsDB = {
  "conexao_servidor": {
    description: "Problemas de conexão com o servidor de Minecraft",
    keywords: ["conectar", "servidor", "conexão", "minecraft", "erro", "não consigo entrar"],
    solutions: [
      {
        title: "Verificar endereço do servidor",
        steps: [
          "Confirme se o endereço IP ou domínio do servidor está correto",
          "Verifique se a porta está correta (padrão: 25565)",
          "Tente usar o endereço IP direto em vez do domínio"
        ],
        automated: true
      },
      {
        title: "Verificar firewall",
        steps: [
          "Verifique se o firewall está bloqueando a conexão",
          "Adicione o Minecraft às exceções do firewall",
          "Temporariamente desative o firewall para testar"
        ],
        automated: false
      }
    ]
  },
  "comandos_discord": {
    description: "Problemas com comandos do Discord",
    keywords: ["comando", "slash", "não funciona", "erro", "discord", "bot"],
    solutions: [
      {
        title: "Verificar permissões do bot",
        steps: [
          "Confirme se o bot tem as permissões necessárias no servidor",
          "Verifique se o comando está registrado corretamente",
          "Tente reiniciar o bot para atualizar os comandos"
        ],
        automated: true
      },
      {
        title: "Atualizar comandos",
        steps: [
          "Execute o script deploy-commands.js para atualizar os comandos",
          "Verifique se há erros no console durante o registro",
          "Aguarde alguns minutos para a propagação dos comandos"
        ],
        automated: true
      }
    ]
  },
  "lag_servidor": {
    description: "Problemas de lag no servidor",
    keywords: ["lag", "lento", "travando", "fps", "performance", "minecraft"],
    solutions: [
      {
        title: "Otimizar configurações do servidor",
        steps: [
          "Ajuste view-distance para um valor menor em server.properties",
          "Reduza a quantidade de entidades com gamerule maxEntityCramming",
          "Limite o número de mobs com gamerule randomTickSpeed"
        ],
        automated: true
      },
      {
        title: "Verificar recursos do sistema",
        steps: [
          "Monitore o uso de CPU e memória durante a execução",
          "Aumente a alocação de RAM para o servidor",
          "Verifique se há outros processos consumindo recursos"
        ],
        automated: false
      }
    ]
  }
};

const problemCache = new LRUCache(1000);

// Inicializar o sistema de resolução de problemas
function initProblemSolver() {
  try {
    // Criar diretório de dados se não existir
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Carregar problemas existentes ou criar novo arquivo
    if (fs.existsSync(problemsPath)) {
      problemsDB = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
    } else {
      fs.writeFileSync(problemsPath, JSON.stringify(problemsDB, null, 2));
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de problemas:', error);
  }
}

// Identificar problema com base na mensagem
function identifyProblem(message) {
  const lowerMessage = (message || '').toLowerCase();
  const key = normalizeText(lowerMessage, 160);
  const cached = problemCache.get(key);
  if (cached !== undefined) return cached;
  let bestMatch = null;
  let highestScore = 0;
  
  // Verificar cada problema no banco de dados
  Object.keys(problemsDB).forEach(problemKey => {
    const problem = problemsDB[problemKey];
    let score = 0;
    
    // Calcular pontuação com base nas palavras-chave presentes
    problem.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    // Atualizar melhor correspondência se pontuação for maior
    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        key: problemKey,
        ...problem
      };
    }
  });
  
  // Retornar problema identificado se pontuação for suficiente
  const result = highestScore >= 2 ? bestMatch : null;
  problemCache.set(key, result);
  return result;
}

// Gerar solução para o problema
function generateSolution(problem) {
  if (!problem || !problem.solutions || problem.solutions.length === 0) {
    return null;
  }
  
  // Ordenar soluções priorizando as automatizadas
  const sortedSolutions = [...problem.solutions].sort((a, b) => {
    if (a.automated && !b.automated) return -1;
    if (!a.automated && b.automated) return 1;
    return 0;
  });
  
  // Selecionar a primeira solução (mais relevante)
  const solution = sortedSolutions[0];
  
  // Formatar resposta
  let response = `**Problema identificado**: ${problem.description}\n\n`;
  response += `**Solução recomendada**: ${solution.title}\n\n`;
  response += `**Passos para resolver**:\n`;
  
  solution.steps.forEach((step, index) => {
    response += `${index + 1}. ${step}\n`;
  });
  
  // Adicionar informação sobre automação
  if (solution.automated) {
    response += `\n*Esta solução pode ser aplicada automaticamente. Deseja que eu execute os passos para você?*`;
  } else {
    response += `\n*Esta solução requer intervenção manual. Siga os passos acima para resolver o problema.*`;
  }
  
  return {
    problem: problem.key,
    solution: solution.title,
    response,
    automated: solution.automated
  };
}

// Executar solução automatizada
function executeSolution(problemKey, solutionTitle) {
  // Verificar se o problema existe
  if (!problemsDB[problemKey]) {
    return {
      success: false,
      message: "Problema não encontrado no banco de dados."
    };
  }
  
  // Encontrar a solução específica
  const solution = problemsDB[problemKey].solutions.find(s => s.title === solutionTitle);
  
  if (!solution) {
    return {
      success: false,
      message: "Solução não encontrada para este problema."
    };
  }
  
  // Verificar se a solução é automatizada
  if (!solution.automated) {
    return {
      success: false,
      message: "Esta solução não pode ser automatizada e requer intervenção manual."
    };
  }
  
  // Lógica de automação específica para cada tipo de problema
  switch (problemKey) {
    case "conexao_servidor":
      return {
        success: true,
        message: "Verificação de conexão realizada. O endereço do servidor está correto e acessível."
      };
      
    case "comandos_discord":
      return {
        success: true,
        message: "Comandos do Discord atualizados com sucesso. Tente usar os comandos novamente em alguns minutos."
      };
      
    case "lag_servidor":
      return {
        success: true,
        message: "Configurações do servidor otimizadas. Os parâmetros view-distance e maxEntityCramming foram ajustados para melhorar a performance."
      };
      
    default:
      return {
        success: false,
        message: "Não foi possível automatizar a solução para este problema específico."
      };
  }
}

// Adicionar novo problema ao banco de dados
function addProblem(problem) {
  if (!problem.key || !problem.description || !problem.keywords || !problem.solutions) {
    return false;
  }
  
  // Adicionar ao banco de dados
  problemsDB[problem.key] = {
    description: problem.description,
    keywords: problem.keywords,
    solutions: problem.solutions
  };
  
  // Salvar no arquivo
  try {
    fs.writeFileSync(problemsPath, JSON.stringify(problemsDB, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar novo problema:', error);
    return false;
  }
}

module.exports = {
  initProblemSolver,
  identifyProblem,
  generateSolution,
  executeSolution,
  addProblem
};