const { Client, Intents } = require('discord.js');
const signale = require('signale');
const config = require('../config.js');
const handler = require('./handler');
const status = require('./status');

const client = new Client({
    allowedMentions: { parse: [] },
    intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ]
});

client.on('ready', () => {
    signale.success(`Logged in as ${client.user.tag}`);

    if (config.data.save.auto) {
        // Enable automatic data saving
        setInterval(async () => {
            await handler.save();
            signale.success('Automatically saved collected words');
        }, config.data.save.autoSaveInterval);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.type !== 'GUILD_TEXT' || message.channel.id !== config.channel) return;

    if (config.bot.owner === message.author.id) {
        switch (message.content.toLowerCase()) {
            case '!save': {
                await message.channel.send(':wrench: Saving collected words...');
                await handler.save();
                signale.success('Manually saved collected words');
                return;
            }
            case '!collect': {
                status.collect = !status.collect;
                await message.channel.send(`:man_student: Word collection is now set to: ${status.collect}`);
                signale.success('Word collection set to %s', status.collect);
                return;
            }
            case '!talk': {
                status.talk = !status.talk;
                await message.channel.send(`:parrot: Talking is now set to: ${status.talk}`);
                signale.success('Talking set to %s', status.talk);
                return;
            }
        }
    }

    if (status.talk) {
        await message.channel.send(handler.generate().join(' '));
    }

    if (status.collect) {
        handler.train(message.content.split(/ +/g));
    }
});

client.login(config.bot.token)
    .catch(console.error);