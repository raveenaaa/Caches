const multer = require('multer');
const fs = require('fs');
const chalk = require('chalk');

const db = require('../data/db');
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1', {});

var express = require('express');
var router = express.Router();

const cacheImages = 'cacheImages';
const imageQueue = 'imageQueue';

/* GET users listing. */
const upload = multer({ dest: './uploads/' })

router.post('/', upload.single('image'), function (req, res) {
 // console.log(req.body) // form fields
 // console.log(req.file) // form files

  if (req.file.fieldname === 'image') {
    fs.readFile(req.file.path, async function (err, data) {
      if (err) throw err;
      var img = new Buffer(data).toString('base64');

      await client.lpush(cacheImages, [img]);
      await client.ltrim(cacheImages, 0, 4);
      
      await client.rpush(imageQueue, [img]);
      console.log(chalk.keyword('orange')('\n...Image pushed to Redis Queue'));

    });
  }
});

module.exports = router;
