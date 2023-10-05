const signale = require('signale');
require('dotenv').config();

const token = process.env.MARKO_TOKEN;
const owner = process.env.MARKO_OWNER;
const channel = process.env.MARKO_CHANNEL;

if (!token || !owner || !channel) {
  signale.fatal(new Error(`You must add an .env file containing the bot token, owner and channel (See .env.example)`));
  process.exit(1);
}

module.exports = {
  bot: {
    token,
    owner
  },
  channel,
  data: {
    save: {
      auto: true,
      // Automatic data save interval in milliseconds
      autoSaveInterval: 5 * 60 * 1000 // = 5 minutes
    }
  }
};