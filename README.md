
# Bot Discord Luana

Bot Discord com personalidade intelectual, reflexiva e profundamente analítica, inspirado nas características do cliente.

## Características da Luana

- **Personalidade**: Intelectual, reflexiva, analítica e com forte pensamento crítico
- **Interesses**: Minecraft, filosofia, xadrez, anime, moderação de Discord
- **Experiência**: Staff do youtuber Seraf por 2 anos, gestão de comunidades Discord
- **Estilo de pensamento**: Ensaístico, sistêmico, rigoroso metodologicamente

## Funcionalidades Implementadas

- **Comandos de Minecraft**: Dicas e informações sobre criação de servidores
- **Comandos de Xadrez**: Dicas para melhorar e informações sobre Magnus Carlsen
- **Comandos de Filosofia**: Reflexões sobre Hegel e o papel do intelectual
- **Comandos de Moderação**: Timeout e limpeza de mensagens
- **Personalidade**: Respostas contextuais baseadas nos interesses e estilo de pensamento da Luana

## Estrutura do Projeto

```
Bot Luana/
├── src/
│   ├── commands/
│   │   ├── minecraft.js
│   │   ├── xadrez.js
│   │   ├── filosofia.js
│   │   └── moderacao.js
│   ├── events/
│   │   ├── interactionCreate.js
│   │   └── messageCreate.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── contextualResponses.js
│   │   ├── linguisticVariety.js
│   │   ├── learningSystem.js
│   │   ├── needsAnticipation.js
│   │   ├── performanceReports.js
│   │   ├── personalizationEngine.js
│   │   ├── problemSolver.js
│   │   └── selfCorrection.js
│   ├── deploy-commands.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure o arquivo `.env` com suas credenciais:
   ```
   DISCORD_TOKEN=seu_token_aqui
   CLIENT_ID=seu_client_id_aqui
   GUILD_ID=seu_guild_id_aqui
   ```
4. Registre os comandos slash:
   ```
   node src/deploy-commands.js
   ```
5. Inicie o bot:
   ```
   npm start
   ```

### Scripts auxiliares

- `npm start` — inicia o bot
- `npm run dev` — inicia o bot com `nodemon` para hot-reload
- `npm run ui` — inicia o dashboard (Vite)
- `npm run build` — build do dashboard
- `npm run preview` — preview de build do dashboard
- `npm run register` — registra comandos slash (`node src/deploy-commands.js`)
- `npm test` — executa testes unitários com Vitest

## Personalização

A personalização de respostas usa:
- `learningSystem` para contexto relevante e histórico
- `contextualResponses` para geração de respostas baseadas em tipo
- `linguisticVariety` para enriquecer texto e variar estrutura
- `personalizationEngine` para preferências em memória por usuário e métricas

Durante a inicialização (`src/index.js`), módulos são preparados e métricas são registradas periodicamente.

## Comandos Disponíveis

- `/minecraft servidor` - Informações sobre como criar um servidor de Minecraft
- `/minecraft dicas` - Dicas para jogar Minecraft
- `/xadrez dicas` - Dicas para melhorar no xadrez
- `/xadrez carlsen` - Informações sobre Magnus Carlsen
- `/filosofia hegel` - Reflexões sobre a filosofia de Hegel
- `/filosofia intelectual` - O que significa ser um intelectual
- `/moderacao timeout` - Aplicar timeout em um membro (requer permissões)
- `/moderacao limpar` - Limpar mensagens do canal (requer permissões)

## Desenvolvimento

Para contribuir com o desenvolvimento:

1. Adicione novos comandos na pasta `src/commands/`
2. Expanda a personalidade no arquivo `src/events/messageCreate.js`
3. Adicione novos eventos na pasta `src/events/`

## Testes

Testes unitários básicos com Vitest:

```
npm test
```

Exemplo: `tests/personalizationEngine.test.js` valida a criação de perfis em memória e cálculo de opções de personalização.

## Exemplos de Uso

### Mencionar o bot

Envie uma mensagem contendo “luana” para receber uma resposta personalizada, com estilo ajustado ao seu histórico.

### Comandos slash

```
/minecraft servidor
/filosofia hegel
/moderacao limpar
```

## Ambiente

Variáveis necessárias em `.env`:

```
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
```

Configurações de logging são feitas via `winston` em `src/utils/logger.js`. Logs são gravados em `logs/`.

## Licença

ISC
=======

>>>>>>> 35f570493eec14761fdc00086a9a05166298b993
