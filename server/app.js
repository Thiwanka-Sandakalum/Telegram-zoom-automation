const express = require('express');
const app = express();
require('dotenv').config();
const { getAccessToken } = require('./config/zoom');
const { getRecordings, uploadTelegram } = require('../server/services/zoom');
const logger = require('./logger/logger');

const serverLogger = function (req, res, next) {
    logger.http(`${req.url} [${req.method}] request received from ${req.ip}`, { req });
    
    res.on('finish', () => {
        logger.http(`Response sent`, { req });
    });

    next();
};


app.use(serverLogger);

app.use(express.json());

const port = process.env.PORT || 3000;
const clientId = process.env.ZOOM_CLIENT_ID;
const redirectUri = process.env.ZOOM_REDIRECT_URI;

const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
    res.send("Welcome to zoomgram");
});

apiRouter.route('/zoom')
    .get(async (req, res) => {
        try {
            const recordings = await getRecordings();
            logger.info('Zoom recordings received successfully');
            res.json(recordings);
        } catch (error) {
            if (error.code === '124') {
                const authorizeUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
                logger.info('Redirecting to Zoom authorization');
                res.redirect(authorizeUrl);
            } else {
                logger.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    });

apiRouter.route('/telegram')
    .post(async (req, res) => {
        if (!req.body.downloadUrl) {
            logger.warn('Download URL not provided');
            return res.status(400).json({ error: 'Bad Request: Download URL is required' });
        }

        const downloadUrl = req.body.downloadUrl;

        try {
            await uploadTelegram(downloadUrl);
            res.status(200).json('Successfully uploaded.');
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: 'Internal Server Error while uploading video' });
        }
    });

// Zoom API auth callback
app.get('/callback', (req, res) => {
    logger.info('Authorization callback');
    const code = req.query.code;

    if (code) {
        getAccessToken(code);
    } else {
        logger.warn('Access code not received');
        const authorizeUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
        logger.info('Redirecting to Zoom authorization');
        res.redirect(authorizeUrl)
    }
});

app.use('/api', apiRouter);

app.listen(port, () => {
    logger.info(`Server started on http://localhost:${port}`);
});
