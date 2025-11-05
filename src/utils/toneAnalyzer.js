// Lógica de adaptação de tom (formal/informal) conforme estilo do usuário

/**
 * Analisa o tom da mensagem do usuário e retorna formal ou informal
 * @param {string} message - Mensagem do usuário
 * @param {object} preferences - Preferências armazenadas do usuário
 * @returns {string} 'formal' ou 'informal'
 */
function analyzeTone(message, preferences) {
  // Priorizar preferências armazenadas se existirem
  if (preferences?.tonePreference) {
    return preferences.tonePreference;
  }

  const lowerMessage = message.toLowerCase();
  // Indicadores de tom formal
  const formalIndicators = ['por favor', 'com licença', 'senhor', 'senhora', 'desejo', 'solicito'];
  // Indicadores de tom informal
  const informalIndicators = ['e aí', 'tô', 'vou', 'cê', 'mano', 'gente', 'né'];

  const formalCount = formalIndicators.filter(ind => lowerMessage.includes(ind)).length;
  const informalCount = informalIndicators.filter(ind => lowerMessage.includes(ind)).length;

  return formalCount > informalCount ? 'formal' : 'informal';
}

/**
 * Ajusta a resposta do bot para combinar com o tom alvo
 * @param {string} response - Resposta base do bot
 * @param {string} targetTone - Tom alvo (formal/informal)
 * @returns {string} Resposta ajustada
 */
function adaptTone(response, targetTone) {
  if (targetTone === 'informal') {
    // Substitui expressões formais por informais
    return response
      .replace(/você/g, 'cê')
      .replace(/estou/g, 'tô')
      .replace(/vou/g, 'vou')
      .replace(/por favor/g, 'pf')
      .replace(/em que posso ser útil/g, 'o que precisa?');
  } else {
    // Substitui expressões informais por formais
    return response
      .replace(/cê/g, 'você')
      .replace(/tô/g, 'estou')
      .replace(/pf/g, 'por favor')
      .replace(/o que precisa?/g, 'em que posso ser útil');
  }
}

module.exports = { analyzeTone, adaptTone };