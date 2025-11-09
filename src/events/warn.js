import { Events } from 'discord.js';
import { setupLogger } from '../utils/logger.js';
import { checkAndAlert } from '../automation/alerts.js';

const logger = setupLogger();

export default {
  name: Events.Warn,
  once: false,
  execute: async function (info) {
    try {
      logger.warn(`Discord.js warn: ${info}`);
    } catch {}
  }
};