var express = require('express');
var router = express.Router();
const sqlite = require('../db');
const axios = require('axios');
const dotenv = require('dotenv').config();


router.get('/', function(req, res, next) {

    // get a list of clips from the twitch api using the broadcaster_id
    // url request format: https://api.twitch.tv/helix/clips?broadcaster_id=23045359
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

router.post('/', function(req, res, next) {
    const cursor = req.body.cursor;
    const client_id = process.env.CLIENT_ID;
    const bearer_token = process.env.BEARER_TOKEN;
    const broadcaster_id = process.env.BROADCASTER_ID;

    const url = `https://api.twitch.tv/helix/clips?` +
                `broadcaster_id=${broadcaster_id}&` +
                `first=10&` +
                `after=${cursor}`;

    axios.get(url, {
        headers: {
            'Client-ID': client_id,
            'Authorization': `Bearer ${bearer_token}`
        }
    })
    .then(response => {
        const clips = response.data.data;
        const cursor = response.data.pagination.cursor;
        res.render('create.njk', { clips, cursor });
    })
    .catch(err => {
        res.status(500).send('Internal Server Error');
        console.error(err);
    });
});

router.post('/add', function(req, res) {
    const slug = req.body.slug; 
    sqlite.addClip(slug);
    res.sendStatus(200);
});

router.post('/remove', function(req, res) {
    const slug = req.body.slug;
    sqlite.removeClip(slug);
    res.sendStatus(200);
});

router.get('/build', function(req, res) {

    // get in the queue, if they dont exist then redirect to the create page
    sqlite.getClips((clips) => {
        if (clips.length == 0) {
            res.redirect('/create');
        } else {
            


        }
    });

    res.render('build.njk');
}); 

module.exports = router;
