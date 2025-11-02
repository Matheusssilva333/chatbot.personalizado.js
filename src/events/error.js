const { Events } = require('discord.js');
const { setupLogger } = require('../utils/logger');
const { checkAndAlert } = require('../automation/alerts');

const logger = setupLogger();

module.exports = {
  name: Events.Error,
  once: false,
  execute: async function (error) {
    try {
      logger.error(`Discord.js error: ${error && error.message ? error.message : String(error)}`);
    } catch {}
  }
};