const { Events } = require('discord.js');
const { setupLogger } = require('../utils/logger');
const { logInteraction } = require('../utils/performanceReports');
const { trackCommandUsage } = require('../utils/personalizationEngine');

const logger = setupLogger();

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  execute: async function (interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
      return;
    }

    const start = Date.now();
    try {
      await command.execute(interaction);
      try {
        logInteraction({ type: 'command', command: interaction.commandName, responseTime: Date.now() - start, success: true });
        trackCommandUsage(interaction.user.id, interaction.commandName);
      } catch {}
    } catch (error) {
      logger.error(`Erro ao executar o comando ${interaction.commandName}: ${error}`);
      try {
        logInteraction({ type: 'command', command: interaction.commandName, responseTime: Date.now() - start, success: false });
      } catch {}
      
      const errorResponse = {
        content: 'Ocorreu um erro ao executar este comando.',
        ephemeral: true
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorResponse);
      } else {
        await interaction.reply(errorResponse);
      }
    }
  }
};