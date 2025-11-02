const { Events } = require('discord.js');
const { setupLogger } = require('../utils/logger');
const { checkAndAlert } = require('../automation/alerts');

const logger = setupLogger();

module.exports = {
  name: Events.Warn,
  once: false,
  execute: async function (info) {
    try {
      logger.warn(`Discord.js warn: ${info}`);
    } catch {}
  }
};