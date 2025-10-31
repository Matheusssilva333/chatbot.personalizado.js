const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('moderacao')
  .setDescription('Comandos de moderação para gerenciar o servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand(subcommand =>
    subcommand
      .setName('timeout')
      .setDescription('Aplicar timeout em um membro')
      .addUserOption(option => 
        option.setName('usuario')
          .setDescription('O usuário que receberá timeout')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('minutos')
          .setDescription('Duração do timeout em minutos')
          .setRequired(true))
      .addStringOption(option => 
        option.setName('razao')
          .setDescription('Razão do timeout')
          .setRequired(false)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('limpar')
      .setDescription('Limpar mensagens do canal')
      .addIntegerOption(option => 
        option.setName('quantidade')
          .setDescription('Quantidade de mensagens para limpar (2-100)')
          .setRequired(true)
          .setMinValue(2)
          .setMaxValue(100)));

async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'timeout') {
    const targetUser = interaction.options.getUser('usuario');
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    const minutes = interaction.options.getInteger('minutos');
    const reason = interaction.options.getString('razao') || 'Nenhuma razão fornecida';
    
    // Verificar se o bot tem permissão para aplicar timeout
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        content: 'Não tenho permissão para aplicar timeout em membros.',
        ephemeral: true
      });
    }
    
    // Verificar se o alvo pode ser moderado pelo usuário
    if (!targetMember.moderatable) {
      return interaction.reply({
        content: `Não posso aplicar timeout em ${targetUser.username} devido à hierarquia de cargos.`,
        ephemeral: true
      });
    }
    
    try {
      await targetMember.timeout(minutes * 60 * 1000, reason);
      
      await interaction.reply({
        content: `Aplicado timeout em ${targetUser.username} por ${minutes} minutos.\nRazão: ${reason}`,
        ephemeral: false
      });
    } catch (error) {
      await interaction.reply({
        content: `Ocorreu um erro ao aplicar timeout: ${error.message}`,
        ephemeral: true
      });
    }
  } else if (subcommand === 'limpar') {
    const amount = interaction.options.getInteger('quantidade');
    
    // Verificar se o bot tem permissão para gerenciar mensagens
    if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: 'Não tenho permissão para excluir mensagens neste canal.',
        ephemeral: true
      });
    }
    
    try {
      const { size } = await interaction.channel.bulkDelete(amount, true);
      
      await interaction.reply({
        content: `${size} mensagens foram removidas.`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `Ocorreu um erro ao limpar mensagens: ${error.message}`,
        ephemeral: true
      });
    }
  }
}

module.exports = {
  data,
  execute
};