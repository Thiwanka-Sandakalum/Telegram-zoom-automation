const axios = require('axios');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const logger=require('../logger/logger')
require('dotenv').config();

const botToken = process.env.TOKENBOT;
let accessToken = null;
const chatid = process.env.ALLOWED_CHAT_ID;

const bot = new TelegramBot(botToken, { polling: true });


async function getRecordings() {
    try {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 1);
        const formattedDate = currentDate.toISOString().split('T')[0];

        const tokenFilePath = path.join(__dirname, '..', 'config', 'Token.txt');
        accessToken = fs.readFileSync(tokenFilePath, 'utf-8').trim();
        logger.info('Read Token');

        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        const params = {
            from: formattedDate
        };

        const { data } = await axios.get('https://api.zoom.us/v2/users/me/recordings', { headers, params });
        return data;

    } catch (error) {
        if (error.code === '124') {
            logger.warn('Access token expired');
            throw error;
        } else {
            logger.error('Error:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

async function uploadTelegram(downloadUrl) {
    try {
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        bot.sendVideo(chatid, response.data);
        logger.info('Video sent successfully!');
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

module.exports = {
    getRecordings,
    uploadTelegram
};
