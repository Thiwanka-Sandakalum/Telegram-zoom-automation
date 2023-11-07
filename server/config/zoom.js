const axios = require('axios');
const fs = require('fs');
const logger = require('../logger/logger');
require('dotenv').config();

const clientId = process.env.ZOOM_CLIENT_ID;
const clientSecret = process.env.ZOOM_CLIENT_SECRET;
const redirectUri = process.env.ZOOM_REDIRECT_URI;
let accessToken = null;
let code = null


async function getAccessToken(code) {
   
    const tokenUrl = 'https://zoom.us/oauth/token';
    const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
    });

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const headers = {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
        const response = await axios.post(tokenUrl, params, { headers });
        accessToken = response.data.access_token;
        fs.writeFileSync('./Token.txt', accessToken);
        return
    } catch (error) {
        logger.error(error)
        throw 'Error exchanging code for access token'
    }
}

module.exports = {
    getAccessToken
}