import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('filosofia')
  .setDescription('Reflexões filosóficas e discussões intelectuais')
  .addSubcommand(subcommand =>
    subcommand
      .setName('hegel')
      .setDescription('Reflexões sobre a filosofia de Hegel'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('intelectual')
      .setDescription('O que significa ser um intelectual'));

async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'hegel') {
    await interaction.reply({
      content: `# Reflexões sobre Hegel

A filosofia hegeliana representa um marco no pensamento ocidental, especialmente por sua abordagem dialética e sistemática:

## Pontos fundamentais:
- **Dialética**: O movimento tese-antítese-síntese como motor do desenvolvimento do Espírito
- **Fenomenologia do Espírito**: A jornada da consciência em direção ao Saber Absoluto
- **Idealismo Absoluto**: A realidade como manifestação da Ideia ou Razão
- **Historicismo**: A história como processo racional de desenvolvimento da liberdade

A grandeza de Hegel está em sua capacidade de articular um sistema que integra subjetividade e objetividade, particular e universal, em um todo coerente. Sua influência se estende de Marx a Sartre, demonstrando a fertilidade de seu pensamento.

Como diria o próprio Hegel: "O verdadeiro é o todo." Esta frase sintetiza sua visão de que a verdade não reside em momentos isolados, mas na totalidade do processo dialético.`,
      ephemeral: false
    });
  } else if (subcommand === 'intelectual') {
    await interaction.reply({
      content: `# O que significa ser um intelectual

A figura do intelectual, especialmente na concepção sartriana, carrega responsabilidades e características distintivas:

## Características do intelectual:
- **Autonomia crítica**: Capacidade de questionar dogmas e verdades estabelecidas
- **Engajamento**: Compromisso com questões sociais e políticas de seu tempo
- **Universalidade**: Transcendência do particular em direção a valores universais
- **Mediação**: Função de traduzir conhecimentos especializados para o debate público

O verdadeiro intelectual não é apenas alguém com conhecimento técnico, mas aquele que usa esse conhecimento para questionar as estruturas de poder e promover reflexão crítica na sociedade.

Como observou Sartre, o intelectual é "alguém que se mete no que não é da sua conta" - ou seja, alguém que não se limita à sua especialidade, mas se posiciona criticamente sobre questões amplas da sociedade.

Esta postura exige rigor metodológico, honestidade intelectual e coragem para defender posições impopulares quando necessário.`,
      ephemeral: false
    });
  }
}

export default {
  data,
  execute
};