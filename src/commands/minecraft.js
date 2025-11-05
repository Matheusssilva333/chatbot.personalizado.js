import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('minecraft')
  .setDescription('Informações e dicas sobre Minecraft')
  .addSubcommand(subcommand =>
    subcommand
      .setName('servidor')
      .setDescription('Informações sobre como criar um servidor de Minecraft'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('dicas')
      .setDescription('Dicas para jogar Minecraft'));

async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'servidor') {
    await interaction.reply({
      content: `# Como criar um servidor de Minecraft

Olá! Como alguém que adora criar servidores de Minecraft, posso te ajudar com isso.

## Passos básicos:
1. Escolha a versão do Minecraft (Java ou Bedrock)
2. Baixe o software do servidor oficial no site minecraft.net
3. Configure o arquivo server.properties
4. Aloque memória RAM suficiente (mínimo 2GB recomendado)
5. Configure o port forwarding no seu roteador
6. Compartilhe seu IP com amigos (ou use um serviço como No-IP)

Se precisar de ajuda mais específica, me avise! Adoro conversar sobre configurações de servidores Minecraft.`,
      ephemeral: false
    });
  } else if (subcommand === 'dicas') {
    await interaction.reply({
      content: `# Dicas para Minecraft

Como uma entusiasta de Minecraft, aqui estão algumas dicas que considero valiosas:

## Sobrevivência:
- Sempre carregue um balde de água para escapar de situações perigosas
- Construa sua base próxima a uma vila para ter acesso a trocas
- Minere no nível Y=-58 para encontrar diamantes com mais facilidade
- Use tochas para marcar o caminho em cavernas (coloque-as sempre do mesmo lado)

## Construção:
- Use diferentes variações de blocos para adicionar textura
- Planeje suas construções em números ímpares para ter simetria
- Adicione profundidade usando lajes, cercas e muros

Espero que essas dicas sejam úteis! Se quiser discutir estratégias mais avançadas, estou à disposição.`,
      ephemeral: false
    });
  }
}

export { data, execute };