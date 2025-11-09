import { Events } from 'discord.js';
import { setupLogger } from '../utils/logger.js';
import { checkAndAlert } from '../automation/alerts.js';

const logger = setupLogger();

export default {
  name: Events.Error,
  once: false,
  execute: async function (error) {
    try {
      logger.error(`Discord.js error: ${error && error.message ? error.message : String(error)}`);
    } catch {}
  }
};