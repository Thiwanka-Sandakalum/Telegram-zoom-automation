const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()

const botToken = process.env.TOKENBOT;
const bot = new TelegramBot(botToken, { polling: true });

function uploadVideo() {
    const chatid = "-4023877389"
    bot.sendVideo(chatid,)

}

bot.on('message', async (msg) => {
    console.log('Message received\n', msg);
    const chatId = msg.chat.id;
    const messageText = msg?.text;
    bot.sendChatAction(chatId, 'typing');

});


