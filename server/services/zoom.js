const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config();

const botToken = process.env.TOKENBOT;
let accessToken = null;
const bot = new TelegramBot(botToken, { polling: true });
const chatid = process.env.ALLOWED_CHAT_ID
bot.sendMessage(chatid, 'Hello from your Telegram bot!')


async function getRecordings() {
    console.log('getRecordings')
    try {
        var currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 1);
        var formattedDate = currentDate.toISOString().split('T')[0];
        const tokenFilePath = path.join(__dirname, '..', 'config', 'Token.txt');
        const token = fs.readFileSync(tokenFilePath, 'utf-8').trim();
        console.log('Token:', token);

        accessToken = token;

        const headers = {
            "Authorization": `Bearer ${accessToken}`
        };

        const params = {
            'from': formattedDate
        }

        const { data } = await axios.get('https://api.zoom.us/v2/users/me/recordings', { headers, params });
        console.log(data);
        return data

        // for (const meeting of data.meetings) {
        //     for (const recordingFile of meeting.recording_files) {
        //         if (recordingFile.file_type === 'MP4') {
        //             const downloadUrl = recordingFile.download_url;

        //             const response = await axios({
        //                 method: 'get',
        //                 url: downloadUrl,
        //                 responseType: 'stream'
        //             });
        //             console.log("video uploading : ")
        //             bot.sendChatAction(chatid, 'upload_video')
        //             bot.sendVideo(chatid, response.data)
        //                 .then(() => {
        //                     console.log("video uploaded successfully")
        //                 })
        //                 .catch((error) => {
        //                     console.log(error.message)
        //                 })
        //         }
        //     }
        // }

    } catch (error) {
        if (error.code = '124') {
            // auth()
            throw error.code
        } else {
            console.error("error : ", error.response ? error.response.data : error.message);
            throw error.message
        }
    }
}

async function uploadTelegram(downloadUrl) {
    try {
        console.log("uploadTelegram")
        bot.sendMessage(chatid, "uploadTelegram")

        // const downloadUrl = "https://dl109.dlmate13.online/?file=M3R4SUNiN3JsOHJ6WWQ2a3NQS1Y5ZGlxVlZIOCtyZ0xqY0UreUI4eFNveFpxTVlDMXZhckp0MWNaYWdKaHF1a0Z0WlYremZMWmRHRmV6Q2Y1TXgyY2oyTTU0Sjd2emJEOXJFd1dOMTVDMU9xdmYrc2d5Vmppd0t3TFA3QUJld1RQMUY5NWhKRnlSYTMvdERBbmhLdmhWU1NzUi9YUEJSRXZ5dGZlL0xWL3NKay9pL09kK2Z0d1pVUnBDdWF2OHNmZzZuTjdGU3ZrdWQ0cThvb1drWWxJUT09"
        axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream',
        })
            .then(response => {
                console.log('downlooading')
                bot.sendVideo(chatid, response.data);
                console.log('uploading finished')
            })
            .catch(error => {
                console.error('Error downloading and uploading the video:', error);
            });

    } catch (error) {
        console.error(error);
        throw error;
    }
}


module.exports = {
    getRecordings,
    uploadTelegram
}
