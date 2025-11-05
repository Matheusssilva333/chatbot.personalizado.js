function recognizeIntent(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('ajuda') || lowerMessage.includes('socorro') || lowerMessage.includes('problema')) {
    return 'help';
  }
  if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia')) {
    return 'greeting';
  }
  if (lowerMessage.includes('adeus') || lowerMessage.includes('tchau') || lowerMessage.includes('até mais')) {
    return 'farewell';
  }
  if (lowerMessage.includes('minecraft') || lowerMessage.includes('servidor')) {
    return 'minecraft_query';
  }
  if (lowerMessage.includes('filosofia') || lowerMessage.includes('pensamento')) {
    return 'philosophy_query';
  }
  if (lowerMessage.includes('moderacao') || lowerMessage.includes('moderar')) {
    return 'moderation_query';
  }
  if (lowerMessage.includes('xadrez') || lowerMessage.includes('chess')) {
    return 'chess_query';
  }
  // Adicione mais intenções conforme necessário
  if (lowerMessage.includes('programação') || lowerMessage.includes('código') || lowerMessage.includes('desenvolvimento')) {
    return 'programming_query';
  }
  if (lowerMessage.includes('depurar') || lowerMessage.includes('erro') || lowerMessage.includes('bug')) {
    return 'debugging_query';
  }
  if (lowerMessage.includes('api') || lowerMessage.includes('interface de programação')) {
    return 'api_query';
  }
  if (lowerMessage.includes('banco de dados') || lowerMessage.includes('sql') || lowerMessage.includes('nosql')) {
    return 'database_query';
  }
  if (lowerMessage.includes('nuvem') || lowerMessage.includes('cloud') || lowerMessage.includes('aws') || lowerMessage.includes('azure') || lowerMessage.includes('gcp')) {
    return 'cloud_query';
  }
  return 'unknown';
}

export {
  recognizeIntent,
};