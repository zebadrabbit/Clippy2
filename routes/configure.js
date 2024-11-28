const express = require('express');
var router = express.Router();

const fs = require('fs');
const path = require('path');

const dotenvPath = path.join(__dirname, '../.env');

router.get('/', (req, res) => {
    // get the contents of the .env file and pass it to the template
    let username = '';
    let client_id = '';
    let client_secret = '';
    if (fs
        .existsSync(dotenvPath)) {
        const dotenv = require('dotenv').config();
        username = dotenv.parsed.USERNAME;
        client_id = dotenv.parsed.CLIENT_ID;
        client_secret = dotenv.parsed.CLIENT_SECRET;
    }
    res.render('configure.njk', {
        username,
        client_id,
        client_secret
    });
});

router.post('/', async (req, res) => {
    const username = req.body.username;
    const client_id = req.body.client_id;
    const client_secret = req.body.client_secret;

    // get our bearer token from twitch
    const axios = require('axios');
    let token;
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id,
                client_secret,
                grant_type: 'client_credentials'
            }
        });
        token = response.data.access_token;
    } catch (err) {
        res.status(500).send('Internal Server Error');
        console.error(err);
    }

    // get the user id from twitch
    let user_id;
    try {
        const response = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Client-ID': client_id,
                'Authorization': `Bearer ${token}`
            },
            params: {
                login: username
            }
        });
        user_id = response.data.data[0].id;
    } catch (err) {
        res.status(500).send('Internal Server Error');
        console.error(err);
    }


    const data = `USERNAME=${username}\nCLIENT_ID=${client_id}\nCLIENT_SECRET=${client_secret}\nBEARER_TOKEN=${token}\nBROADCASTER_ID=${user_id}`;
    try {
        await fs.promises.writeFile(dotenvPath, data);
    } catch (err) {
        res.status(500).send('Internal Server Error');
        console.error(err);
    }


    req.flash('info', 'Configuration saved');
    res.redirect('/');

});

module.exports = router;
