import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('xadrez')
  .setDescription('Informações e dicas sobre xadrez')
  .addSubcommand(subcommand =>
    subcommand
      .setName('dicas')
      .setDescription('Dicas para melhorar no xadrez'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('carlsen')
      .setDescription('Informações sobre Magnus Carlsen'));

async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'dicas') {
    await interaction.reply({
      content: `# Dicas para melhorar no xadrez

Como praticante de xadrez e admiradora do pensamento estratégico, posso compartilhar algumas reflexões:

## Princípios fundamentais:
1. **Controle do centro** - As casas centrais (d4, d5, e4, e5) são estrategicamente valiosas
2. **Desenvolvimento de peças** - Desenvolva cavalos e bispos antes de movimentos mais complexos
3. **Segurança do rei** - O roque é uma jogada defensiva crucial nas aberturas
4. **Estrutura de peões** - Evite peões isolados ou dobrados quando possível

## Abordagem analítica:
- Analise cada posição sistematicamente, considerando ameaças e oportunidades
- Pratique problemas táticos diariamente para aprimorar sua visão de jogo
- Estude finais básicos para entender princípios fundamentais

O xadrez, assim como o pensamento filosófico, requer rigor metodológico e autocrítica constante. Ao jogar, busque equilibrar intuição com análise profunda.`,
      ephemeral: false
    });
  } else if (subcommand === 'carlsen') {
    await interaction.reply({
      content: `# Magnus Carlsen

Como admiradora do xadrez e do pensamento estratégico, acompanho a carreira de Magnus Carlsen com interesse particular:

## Sobre Magnus Carlsen:
- Grande Mestre norueguês, considerado um dos maiores jogadores da história
- Campeão mundial de 2013 a 2023, quando decidiu não defender seu título
- Conhecido por seu estilo versátil e habilidade excepcional em finais
- Recordista de rating ELO, ultrapassando 2882 pontos
- Revolucionou o xadrez moderno com sua abordagem pragmática e versatilidade

## O que admiro em seu jogo:
- Capacidade de extrair vantagens de posições aparentemente iguais
- Precisão técnica em finais complexos
- Resistência psicológica em posições difíceis
- Adaptabilidade tática e estratégica

Carlsen representa a fusão ideal entre intuição e cálculo preciso, demonstrando como o pensamento sistemático pode ser aplicado com criatividade.`,
      ephemeral: false
    });
  }
}

export default {
  data,
  execute
};