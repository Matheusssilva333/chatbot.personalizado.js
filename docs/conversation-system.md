# Sistema de Conversação Natural e Automatizado

Este documento descreve a arquitetura, módulos e métricas do novo sistema de conversação da Luana, cobrindo memória contextual, automação inteligente, naturalidade, verificação de contexto e auto‑aprimoramento.

## Arquitetura
- `src/conversation/memory.js`: guarda últimas 10 interações por usuário; janela de 3 para contexto; extração de tópicos.
- `src/conversation/contextEngine.js`: agrega contexto legado (`learningSystem`) + perfil + janela de interações + tópicos correntes.
- `src/conversation/entities.js`: extrai nomes, locais e interesses e grava no perfil.
- `src/conversation/naturalness.js`: gera variações, aplica tom e calcula timing (0,5–1,5s para simples).
- `src/conversation/contextVerifier.js`: detecta repetição (similaridade) e mudança de tópico.
- `src/automation/intelligentAutomation.js`: 5 fluxos automatizados com triggers por palavras‑chave, intenção e perfil.
- `src/automation/selfImprovement.js`: registra interações problemáticas e fornece ajustes simples.
- `src/utils/personalizationEngine.js`: perfis em memória; preferências explícitas/implícitas; dados contextuais.
- `src/events/messageCreate.js`: integra todos os módulos no fluxo de resposta.

## Memória Contextual
- Armazena perguntas e respostas (10 últimas por usuário) com tópicos detectados.
- Recupera até 3 interações anteriores para contexto imediato.
- Integra dados do perfil (preferências, estilo) e tópicos correntes.

## Automação Inteligente (5 fluxos)
- FAQ: identifica perguntas comuns com alta confiança e oferece até 3 variações.
- Pedidos padrão: executa ações típicas (ex.: status do servidor) e confirma.
- Encaminhamento: sugere módulo/setor apropriado quando a intenção exige.
- Coleta de informações: solicita dados mínimos quando faltam detalhes.
- Confirmação de ações: valida e confirma antes de efetivar operações.

### Triggers
- Palavras‑chave prioritárias, padrões de intenção, contexto acumulado e perfil do usuário.
- Combinação de sinais gera `actionsPerformed` e `responses` adequadas.

## Naturalidade na Conversação
- Variação linguística: 5+ formulações por resposta, ajustadas por perfil.
- Timing: simula pausas naturais (0,5–1,5s para simples; maior para complexas).
- Tom de voz: mantém coerência, ajusta formalidade e aplica auto‑correções.

## Verificação de Contexto
- Evita repetição com detector de similaridade textual.
- Detecta mudança de tópicos e registra para revisão.
- Mantém coerência temática combinando janela recente + perfil.

## Auto‑Aprimoramento
- Registra interações lentas (>2s) ou com mudança brusca de tema.
- Ajusta parâmetros básicos automaticamente e persiste métricas.

## Métricas e Desempenho
- Testes unitários (Vitest) cobrem memória, personalização, triggers e entidades.
- Resultados atuais: 5 arquivos, 16 testes, 100% passando em ~4s.
- Logs anteriores indicam resposta média alta (~32s) e memória elevada (~218MB). O novo fluxo reduz trabalho por resposta ao usar automações e verificação de repetição.

### Recomendações de otimização
- Reduzir caches e aplicar lazy‑loading em módulos pesados.
- Evitar carregamentos JSON redundantes; memoizar I/O.
- Ajustar `data/automation.json` (`maxResponseTimeTargetMs` ≤ 1500) e monitorar GC.
- Se necessário, elevar temporariamente `memoryLimitMB` em `data/config.json` para 250MB enquanto otimiza.

## Qualidade (objetivos)
- Satisfação >90%: reforçar variações naturais e respostas diretas.
- Precisão contextual ≥95%: usar janela de 3 + perfil + verificador.
- Redução 70% no tempo médio para FAQs: triggers e respostas pré‑variadas.
- Personalidade mantida em 98%: tom coerente + engine de estilo.

## Como validar
1) Executar bot: `npm start` e observar `logs/startup.log`.
2) Rodar testes: `npm test -- --run` (todos devem passar).
3) Simular FAQs e fluxos padrão em canal de teste; verificar timing e tom.
4) Checar métricas: `data/personalization.json` e `logs/combined.log`.

## Operação
- Sem dependência externa de DB; tudo em memória com flush para JSON.
- Perfis expiram em 24h (TTL) e têm limiar de 200 perfis ativos.