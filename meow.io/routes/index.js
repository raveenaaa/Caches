var express = require('express');
var router = express.Router();

const redis = require('redis');
let client = redis.createClient(6379, '127.0.0.1', {});

const db = require('../data/db');
const cacheFacts = 'cacheFacts';
const cacheImages = 'cacheImages';


/* GET home page. */
router.get('/', async function(req, res, next) {

  await client.get(cacheFacts, async function(err, facts) {

      await client.lrange(cacheImages, 0, -1, async function(error, images){
        const uploads = images || await db.recentCats(5);

        if (facts != null) {
          res.render('index', { title: 'meow.io', recentUploads: uploads, bestFacts: JSON.parse(facts) });
          // console.log('================ Cache Facts');
          }
        else {
          // console.log('+++++++++++ DB Facts');
          const bestFacts = (await db.votes()).slice(0,100);
          await client.set(cacheFacts, JSON.stringify(bestFacts));
          await client.expire(cacheFacts, 10);
          res.render('index', { title: 'meow.io', recentUploads: uploads, bestFacts: bestFacts});
        }
      })
    });
});

module.exports = router;