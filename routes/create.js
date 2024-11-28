var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

    // get a list of clips from the twitch api using the broadcaster_id
    // url request format: https://api.twitch.tv/helix/clips?broadcaster_id=23045359
    const axios = require('axios');
    const dotenv = require('dotenv').config();
    const client_id = process.env.CLIENT_ID;
    const bearer_token = process.env.BEARER_TOKEN;
    const broadcaster_id = process.env.BROADCASTER_ID;

    const started_at = new Date();
    const ended_at = new Date();
    
    // get clips from the last 7 days
    started_at.setDate(started_at.getDate() - 14);
    ended_at.setDate(ended_at.getDate());

    const url = `https://api.twitch.tv/helix/clips?` +
                `broadcaster_id=${broadcaster_id}&` +
                `started_at=${started_at.toISOString()}&` +
                `ended_at=${ended_at.toISOString()}` +
                `&first=10`;

    axios.get(url, {
        headers: {
            'Client-ID': client_id,
            'Authorization': `Bearer ${bearer_token}`
        }
    })
    .then(response => {
        const clips = response.data.data;        
        for (let clip of clips) {
            console.log(clip);
        }        

        const cursor = response.data.pagination.cursor;        
        res.render('create.njk', { clips, cursor });
    })
    .catch(err => {
        res.status(500).send('Internal Server Error');
        console.error(err);
    });


});

module.exports = router;
