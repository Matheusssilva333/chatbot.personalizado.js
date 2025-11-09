export function generateFormulations(base, profile = {}, count = 5) {
  const b = String(base || '');
  const style = profile.stylePreference || 'pratico';
  const variants = [];

  const soften = (txt) => txt.replace(/\b(precisa|deve)\b/gi, 'pode');
  const colloquial = (txt) => {
    let newTxt = txt.replace(/você/gi, 'vc').replace(/não/gi, 'num');
    newTxt = newTxt.replace(/está/gi, 'tá').replace(/muito/gi, 'mt');
    newTxt = newTxt.replace(/por que/gi, 'pq').replace(/para/gi, 'pra');
    return newTxt;
  };
  const formal = (txt) => {
    let newTxt = txt.replace(/vc/gi, 'você').replace(/num/gi, 'não');
    newTxt = newTxt.replace(/tá/gi, 'está').replace(/mt/gi, 'muito');
    newTxt = newTxt.replace(/pq/gi, 'por que').replace(/pra/gi, 'para');
    return newTxt;
  };
  const punct = (txt) => (txt.endsWith('.') ? txt.slice(0, -1) + '!' : txt + '.');
  const addFiller = (txt) => {
    const fillers = ['Então...', 'Bem,', 'Olha,', 'Tipo assim,', 'Sabe,', 'Uhm...', 'Pois é,'];
    return `${fillers[Math.floor(Math.random() * fillers.length)]} ${txt}`;
  };

  const addEmphasis = (txt) => {
    const emphasisWords = ['realmente', 'muito', 'bastante', 'super'];
    const words = txt.split(' ');
    if (words.length > 2) {
      const randomIndex = Math.floor(Math.random() * (words.length - 2)) + 1; // Evita primeira e última palavra
      words.splice(randomIndex, 0, emphasisWords[Math.floor(Math.random() * emphasisWords.length)]);
    }
    return words.join(' ');
  };

  const rephrase = (txt) => {
    const rephrases = {
      'como posso ajudar': ['em que posso ser útil', 'o que posso fazer por você'],
      'olá': ['oi', 'e aí'],
      'obrigado': ['valeu', 'agradeço'],
      'sim': ['claro', 'com certeza'],
      'não': ['negativo', 'de jeito nenhum'],
    };
    let newTxt = txt;
    for (const key in rephrases) {
      if (newTxt.toLowerCase().includes(key)) {
        const options = rephrases[key];
        newTxt = newTxt.replace(new RegExp(key, 'gi'), options[Math.floor(Math.random() * options.length)]);
        break;
      }
    }
    return newTxt;
  };

  const ops = [
    (t) => t, // Original
    (t) => punct(t), // Adiciona pontuação
    (t) => soften(t), // Suaviza a linguagem
    (t) => question(t), // Transforma em pergunta
    (t) => style === 'pratico' ? colloquial(t) : formal(t), // Coloquial ou formal
    (t) => addFiller(t), // Adiciona uma interjeição
    (t) => colloquial(punct(t)), // Coloquial e pontuado
    (t) => soften(addFiller(t)), // Suaviza e adiciona interjeição
    (t) => addEmphasis(t), // Adiciona ênfase
    (t) => rephrase(t), // Refraseia
  ];

  for (let i = 0; i < count; i++) {
    let currentVariant = b;
    // Aplica um número aleatório de transformações (1 a 3)
    const numTransforms = Math.floor(Math.random() * 3) + 1;
    const appliedOps = new Set();

    for (let j = 0; j < numTransforms; j++) {
      let opIndex;
      do {
        opIndex = Math.floor(Math.random() * ops.length);
      } while (appliedOps.has(opIndex)); // Garante que a mesma operação não seja aplicada duas vezes na mesma variante
      appliedOps.add(opIndex);
      currentVariant = ops[opIndex](currentVariant);
    }
    variants.push(currentVariant);
  }
  return variants;
}

export function computeDelayMs(complexity = 0.5, textLen = 100) {
  // 0.5–1.5s for simples respostas; aumentar ligeiramente com complexidade
  const base = 500 + Math.min(1000, Math.floor(complexity * 1000));
  const add = Math.min(300, Math.floor(textLen / 200 * 300));
  return base + add;
}

export function applyTone(text, profile = {}, context = {}, sentiment = 0) {
  const tone = profile.stylePreference || 'pratico';
  let modifiedText = text;

  const toneMap = {
    'intelectual': {
      'ok': 'certo', 'legal': 'interessante', 'entendi': 'compreendido', 'tipo': 'análogo',
      'sim': 'afirmativo', 'não': 'negativo', 'talvez': 'possivelmente',
      'problema': 'questão', 'ajudar': 'auxiliar', 'fazer': 'executar',
    },
    'casual': {
      'olá': 'e aí', 'obrigado': 'valeu', 'sim': 'claro', 'não': 'nem a pau',
      'legal': 'irado', 'problema': 'perrengue', 'ajudar': 'dar uma força',
      'fazer': 'mandar ver', 'muito': 'pra caramba', 'pouco': 'quase nada',
    },
    'pratico': {
      'ok': 'entendido', 'legal': 'bom', 'entendi': 'compreendido', 'tipo': 'como',
      'sim': 'ok', 'não': 'não', 'talvez': 'pode ser',
      'problema': 'questão', 'ajudar': 'auxiliar', 'fazer': 'realizar',
    }
  };

  // Aplicar substituições baseadas no tom
  if (toneMap[tone]) {
    for (const [key, value] of Object.entries(toneMap[tone])) {
      modifiedText = modifiedText.replace(new RegExp(`\\b${key}\\b`, 'gi'), value);
    }
  }

  // Ajustes de tom baseados no sentimento
  if (sentiment > 0.7) { // Muito positivo
    modifiedText = modifiedText.replace(/\b(que bom)\b/gi, 'que ótimo').replace(/\b(legal)\b/gi, 'incrível');
    modifiedText += ' Que notícia fantástica!';
  } else if (sentiment > 0.3) { // Positivo
    modifiedText = modifiedText.replace(/\b(que bom)\b/gi, 'que bom').replace(/\b(legal)\b/gi, 'muito bom');
    modifiedText += ' Fico feliz em saber.';
  } else if (sentiment < -0.7) { // Muito negativo
    modifiedText = modifiedText.replace(/\b(sinto muito)\b/gi, 'poxa, que chato').replace(/\b(problema)\b/gi, 'perrengue');
    modifiedText += ' Espero que melhore logo.';
  } else if (sentiment < -0.3) { // Negativo
    modifiedText = modifiedText.replace(/\b(sinto muito)\b/gi, 'sinto muito').replace(/\b(problema)\b/gi, 'dificuldade');
    modifiedText += ' Lamento ouvir isso.';
  } else { // Neutro
    modifiedText += ' Certo.';
  }

  return modifiedText;
}

export function getTransitionalPhrase() {
  const phrases = [
    "Mudando um pouco de assunto,",
    "A propósito,",
    "Por falar nisso,",
    "Em outro tópico,",
    "Agora, sobre outra coisa,",
    "Deixando isso de lado por um momento,",
    "Aproveitando a deixa,",
    "Falando em...",
    "Ah, e mais uma coisa,",
    "Antes que eu me esqueça,"
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function question(txt) {
  return (txt.endsWith('.') ? txt.slice(0, -1) + '?' : txt + '?');
}