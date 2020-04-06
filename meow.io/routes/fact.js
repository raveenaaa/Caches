const express = require('express');
const router = express.Router();
const fs = require('fs');

/* GET catfact with id. */
router.get('/:id', function(req, res, next) {

    const data = fs.readFileSync("data/catfacts.txt", 'utf8');
    const lines = data.split("\n");

    let line_no = req.params.id;

    if(+line_no > lines.length){
        res.send('Error: invalid cat fact id');
    }

    res.send(lines[+line_no]);
});

const db = require('../data/db');
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1', {});

router.post('/:id/vote', async function(req, res, next) {

    const score = req.body.score;
    console.log( score );

    try{
        await db.vote(req.params.id, score)
        res.send('Ok');
    }catch(ex)
    {
        res.send(ex);
    }
    
});

module.exports = router;