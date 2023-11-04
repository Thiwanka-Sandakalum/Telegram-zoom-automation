const express = require('express');
const app = express();
require('dotenv').config()
const { getAccessToken } = require('./config/zoom');
const { getRecordings, uploadTelegram } = require('../server/services/zoom')

app.use(express.json());

const port = process.env.PORT || 3000;
const clientId = process.env.ZOOM_CLIENT_ID;
const redirectUri = process.env.ZOOM_REDIRECT_URI;

const apiRouter = express.Router();

apiRouter.get('/',(req,res)=>{
    res.send("Wellcome to zoomgram")
})

apiRouter.route('/zoom')
    .get(async (req, res) => {
        try {
            const recordings = await getRecordings();
            res.json(recordings);
        } catch (error) {
            if (error.code = '124') {
                const authorizeUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
                res.redirect(authorizeUrl);
            } else {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    })



apiRouter.route('/telegram')
    .post(async (req, res) => {
        try {
            console.log(req.body.downloadUrl)
            await uploadTelegram(req.body.downloadUrl);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });




// zoom api auth
app.get('/callback', (req, res) => {
    console.log('authorization')
    getAccessToken(req)
});

app.use('/api', apiRouter);

app.listen(port, () => console.log('App starting on prot :', port));
