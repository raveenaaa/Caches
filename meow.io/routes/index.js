var express = require('express');
var router = express.Router();

// REDIS
const redis = require('redis');
let client = redis.createClient(6379, '127.0.0.1', {});

const db = require('../data/db');
const cache = 'cache';


/* GET home page. */
router.get('/', async function(req, res, next) {
  // await client.get(cache, function(err, cacheValue) {
  //   if (cacheValue != null) {
  //     res.render('index', { title: 'meow.io', recentUploads: await db.recentCats(5), bestFacts: JSON.parse(cacheValue) });
  //     next();
  //   }
  // })
  const bestFacts = (await db.votes()).slice(0,100);
  // await client.set(cache, JSON.stringify(bestFacts));
  // await client.expire(cache, 10);
  res.render('index', { title: 'meow.io', recentUploads: await db.recentCats(5), bestFacts: bestFacts});
});

module.exports = router;
