Infrastructure Components
=========================

![build](https://travis-ci.org/CSC-DevOps/Queues.svg?branch=master)

In this workshop, we'll cover the basics of adding infrastructure components to a web application.

In particular, we will focus on using redis to construct basic infrastructure components, such as a cache and queue, and intergrating them into a web application.

## Workshop

### Before you start

* Clone this repo and change directory to the repo.
* Pull `queues` virtual machine image which has the prerequisites you need for this workshop (nodejs, redis):
  ```
  bakerx pull CSC-DevOps/Images#Spring2020 queues
  ```
* Create a new virtual machine using the `queues` image:
  ```bash
  bakerx run queues queues --ip 192.168.44.81 --sync
  ```
* Run `bakerx ssh queues` to connect to the virtual machine.

### Redis

You will be using [redis server](http://redis.io/) and [node-redis client](https://github.com/mranney/node_redis) to build some simple infrastructure components:

```js
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1', {});
```

In general, you can run all the [redis commands](https://redis.io/commands) in the following manner: `client.CMD(args)`. For example:

```js
client.set("key", "value");
client.get("key", function(err,value){ console.log(value)});
```

### A simple web server

In this workshop we use [express](http://expressjs.com/) to make a simple web server:

```js
let server = app.listen(3003, function () {

  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
})
```

Express uses the concept of routes to use pattern matching against requests and sending them to specific functions. You can simply write back a response body:

```js
app.get('/', function(req, res) {
	res.send('hello world')
})
```

This functionality already exists in [main.js](./basics/main.js).

### Basics

Inside the VM, go to the sync folder containing this repo and install npm dependencies:
  ```bash
  cd /bakerx/basics
  npm install
  ```

##### Task 1: An expiring cache

Create two routes, `/get` and `/set`.

When [`/set`](http://192.168.44.81:3003/set) is visited (i.e. GET request), set a new key, with the value:
> "this message will self-destruct in 10 seconds".

Use the [EXPIRE](https://redis.io/commands/expire) command to make sure this key will expire in 10 seconds.

When [`/get`](http://192.168.44.81:3003/get) is visited (i.e. GET request), fetch that key, and send its value back to the client: `res.send(value)`.

##### Task 2: Recent visited sites

Create a new route, `/recent`, which will display the most recently visited sites.

There is already a [global hook (middleware) setup](./basics/main.js#L14-L21), which will allow you to see each site that is requested:

```js
app.use(function (req, res, next) {
  ...
```

Use [`LPUSH`](https://redis.io/commands/lpush), [`LTRIM`](https://redis.io/commands/ltrim), and[`LRANGE`](https://redis.io/commands/lrange) redis commands to store the most recent 5 sites visited, and return that to the client.

## Meow.io

Now that you have a better handle on using express and redis, let's see if we do tasks on a simple app, meow.io.
This is a simple 3-tier node.js application, with a view, app layer, and database.

![meow.io](./img/meow.io.png)

To run the application, perform the following steps:

```
# Setup app
cd meow.io
npm install 
node data/init.js

# Start server
npm start
```

You should be able to visit http://192.168.44.81:3000/

##### Task 3: Cache best facts calculation

The front page will load all cat facts and display the 100 most voted facts on each page load.
Without caching, this can add up with heavier traffic.

```
$ time ./load.sh 

real	0m20.373s
```

However, if we cache the results, we can greatly reduce this load.

```
$ time ./load.sh 

real	0m4.282s
```

Task: Modify `meow.io/routes/index.js` to cache and return the results of bestFacts. Have cached results expire after 10 seconds. You should see a reduction in load time for the site. 

Note: This is making an explicit trade-off between availability and consistency, since displayed data will be potentially 10 seconds behind real scores.

##### Task 4: Cat picture uploads storage
 
The front page will display the 5 most recently uploaded files (/upload).
You can use curl to help you upload files easily for test.

```bash
curl -F "image=@./data/morning.jpg" http://localhost:3000/upload
```

However, this is being read from the database on each page load. You could instead simply store the 5 most recently uploaded files in a cache without reading from the database.

Task: Modify the `meow.io/routes/upload.js` file to cache recently uploaded images. Modify the `meow.io/routes/index.js` to read from the cache instead the database.

##### Task 5: Regulate uploads with queue

meow.io is a huge success. You are now receiving a large volume of uploads, much faster than your poor database can handle.

Task: Modify the `meow.io/routes/upload.js` to store incoming images in a queue and not the database. Modify `meow.io/app.js` to timer (setInternal every 100ms), to pop images stored in the queue (consider using  [`LPOP`](https://redis.io/commands/lpop) ) and save in the database. This way, you can take advantage of the faster write speed for redis and drain the queue at a steady rate for longer term storage.