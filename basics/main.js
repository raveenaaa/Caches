const express = require('express');
const app = express();

const multer = require('multer');
const fs = require('fs');

// REDIS
const redis = require('redis');
let client = redis.createClient(6379, '127.0.0.1', {});
const queue = 'recentSites';

///////////// GLOBAL HOOK

// Add hook to make it easier to get all visited URLS.
app.use(async function(request, response, next) {
  console.log(request.method, request.url);

  // Task 2 ... INSERT HERE.
  // TODO: Store recent routes
  await client.lpush(queue, [request.url]);
  await client.ltrim(queue, 0, 4);
  
  next(); // Passing the request to the next handler in the stack.
});

///////////// WEB ROUTES

// responding to GET request to / route (http://IP:3000/)
app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/test', function (req, res) {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.write('test');
  console.log('test');
  res.end();
})

// Task 1 ===========================================
// TODO: Create two routes, `/get` and `/set`.
// Route `/get`
app.get('/get/:key', function(request, response) {
  var key = request.params.key;
  client.get(key, function(error, value){
    var message;
    if (value == null)
      message = `The key '${key}' doesn't exists`;
    else
      message = `${key}:${value}`;

    response.send(message);
    console.log(message);
  })
})

// Route `/set`
app.get('/set/:key', function(request, response) {
  var value = "this message will self-destruct in 10 seconds";
  var key = request.params.key;

  client.set(key, value, redis.print);
  client.expire(key, 10);

  response.send(`${key} has been set to: ${value}`);
  console.log(`${key} has been set to: ${value}`);
})

// ===================================================


// Task 2 ============================================

// TODO: Create a new route, `/recent`
app.get('/recent', async function(request, response) {
  let sites = ''
  const recent = await client.lrange(queue, 0, -1, (err, data) => {
    if (err) {
     console.log(err);
     response.status(500).send(err.message);
     return;
    }
 
    data.forEach(site => {
     sites += `${site}\n`;
    });

  console.log(sites);
  response.send(sites);
})
})

// ===================================================


// Task 3 ============================================
const upload = multer({ dest: './uploads/' })
app.post('/upload', upload.single('image'), function (req, res) {
  console.log(req.body) // form fields
  console.log(req.file) // form files

  if (req.file.fieldname === 'image') {
    fs.readFile(req.file.path, function (err, data) {
      if (err) throw err;
      var img = new Buffer(data).toString('base64');
      console.log(img);

      client.lpush('cats', img, function (err) {
        res.status(204).end()
      });
    });
  }
});

app.get('/meow', function (req, res) {
  res.writeHead(200, { 'content-type': 'text/html' });

  // res.write("<h1>\n<img src='data:my_pic.jpg;base64," + imagedata + "'/>");
  res.end();
})
// ===================================================

// HTTP SERVER
let server = app.listen(3003, function () {

  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
})