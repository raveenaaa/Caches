var express = require('express');
var router = express.Router();

const db = require('../data/db');

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'meow.io', recentUploads: await db.recentCats(5), bestFacts: (await db.votes()).slice(0,100) });
});

module.exports = router;
