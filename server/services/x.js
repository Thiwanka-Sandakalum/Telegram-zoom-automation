const express = require('express');
const axios = require('axios');
const app = express();
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path')

app.use(bodyParser.json());

const clientId = process.env.ZOOM_CLIENT_ID;
const clientSecret = process.env.ZOOM_CLIENT_SECRET;
const redirectUri = process.env.ZOOM_REDIRECT_URI;
let accessToken = null;
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello, this is your Zoom OAuth app!');
});

app.get('/authorize', (req, res) => {
    const authorizeUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    res.redirect(authorizeUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

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
        console.log("Access token:", response.data.access_token);
        accessToken = response.data.access_token;
        fs.writeFileSync('./Token.txt', accessToken);
        res.redirect(`http://localhost:${port}/data`);
    } catch (error) {
        return res.status(500).send('Error exchanging code for access token');
    }
});

app.get('/data', async (req, res) => {
    try {
        var currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 1);
        var formattedDate = currentDate.toISOString().split('T')[0];
        accessToken = 'eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6ImI5M2JiYThkLWQ3YTAtNGNiYS1iYmEyLTJlMjU5MzA0ZjAyYyJ9.eyJ2ZXIiOjksImF1aWQiOiI0ZTliOWZhZDg2ZDIyNzE5ZjYyNWI0MWVhMTNmZjQzYiIsImNvZGUiOiJKWnl1VXo4QThMRzZvZGxaSng4U2VlaEZiTV9MU3Z5ZkEiLCJpc3MiOiJ6bTpjaWQ6SWpLQVIwZGZRTEdYR2hPSjNzUkdmQSIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJSN08tWWpiVFJNLTBvRVVDbWcyclFBIiwibmJmIjoxNjk4NjA2MjkwLCJleHAiOjE2OTg2MDk4OTAsImlhdCI6MTY5ODYwNjI5MCwiYWlkIjoiR2liTDJPMGVSY1M4d1Z3SExpTG9qZyJ9.rhbVXJC9KGN170XNbi2IE6nzKny8IYbltjEqtXq9bTAv-gdyXC_714pv_Ru8t2fdKEYLVyGiG3RyZHVyz9idIA'

        const headers = {
            "Authorization": `Bearer ${accessToken}`
        };

        const params = {
            'from': formattedDate
        }

        console.log(accessToken);
        const { data } = await axios.get('https://api.zoom.us/v2/users/me/recordings', { headers, params });
        console.log(data);
        res.json(data);

        for (const meeting of data.meetings) {
            for (const recordingFile of meeting.recording_files) {
                if (recordingFile.file_type === 'MP4') {
                    const downloadUrl = recordingFile.download_url;

                    const response = await axios({
                        method: 'get',
                        url: downloadUrl,
                        responseType: 'stream',
                    });

                    const directoryPath = path.join(__dirname, 'downloads');
                    const filePath = path.join(directoryPath, `${meeting.topic}_${recordingFile.id}.mp4`);

                    // Ensure the directory exists
                    fs.mkdirSync(directoryPath, { recursive: true });

                    const fileStream = fs.createWriteStream(filePath);
                    response.data.pipe(fileStream);

                    console.log(`Downloaded: ${filePath}`);
                }
            }
        }

    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send('Error retrieving Zoom user data');
    }
});



app.post('/webhook', (req, res) => {
    var response;
    console.log("Event:", req.body.event);
    console.log('Body', req.body);

    const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`;
    const hashForVerify = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest('hex');
    const signature = `v0=${hashForVerify}`;

    if (req.headers['x-zm-signature'] === signature) {
        if (req.body.event === 'endpoint.url_validation') {
            const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest('hex');

            response = {
                message: {
                    plainToken: req.body.payload.plainToken,
                    encryptedToken: hashForValidate
                },
                status: 200
            };

            console.log("Response message:", response.message);
            res.status(response.status).json(response.message);
        } else {
            response = { message: 'Authorized request to Zoom Webhook sample.', status: 200 };
            console.log(response.message);
            res.status(response.status).json(response);

            // Business logic here, e.g., make API request to Zoom or 3rd party
        }
    } else {
        response = { message: 'Unauthorized request to Zoom Webhook sample.', status: 401 };
        console.log(response.message);
        res.status(response.status).json(response);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
