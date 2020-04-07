HW3-Devops: Redis
=========================

In this homework we try to understand the basic building blocks that form complex infrastructure is important for operating web-scale applications

### Getting started

* Clone [this repo](https://github.ncsu.edu/rmdcosta/HW3-DevOps.git) and change directory to the repo.
* Pull `queues` virtual machine image which has nodejs and redis:
  ```
  bakerx pull CSC-DevOps/Images#Spring2020 queues
  ```
* Create a new virtual machine using the `queues` image:
  ```bash
  bakerx run queues queues --ip 192.168.44.81 --sync
  ```
* Run `bakerx ssh queues` to connect to the virtual machine.

### Basics

Inside the VM, go to the sync folder containing this repo and install npm dependencies:
  ```bash
  cd /bakerx/basics
  npm install
  ```

##### Task 1: An expiring cache

We create two routes, `/get` and `/set`.

When [`/set`](http://192.168.44.81:3003/set) is visited (i.e. GET request), set a new key, with the value:
> "this message will self-destruct in 10 seconds".

Use the [EXPIRE](https://redis.io/commands/expire) command to make sure this key will expire in 10 seconds.

When [`/get`](http://192.168.44.81:3003/get) is visited (i.e. GET request), fetch that key, and send its value back to the client: `res.send(value)`.

##### Task 2: Recent visited sites

We create a new route, `/recent`, which will display the most recently visited sites.

We use [`LPUSH`](https://redis.io/commands/lpush), [`LTRIM`](https://redis.io/commands/ltrim), and[`LRANGE`](https://redis.io/commands/lrange) redis commands to store the most recent 5 sites visited, and return that to the client.

## Meow.io

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

real	1m53.098s
```

However, if we cache the results, we greatly reduce the load.

```
$ time ./load.sh 

real	0m47.018s
```

Note: This is making an explicit trade-off between availability and consistency, since displayed data will be potentially 10 seconds behind real scores.

##### Task 4: Cat picture uploads storage
 
The front page will display the 5 most recently uploaded files (/upload).
You can use curl to help you upload files easily for test.

```bash
curl -F "image=@./data/morning.jpg" http://localhost:3000/upload
```

However, this is being read from the database on each page load. You could instead simply store the 5 most recently uploaded files in a cache without reading from the database.

we have modified the `meow.io/routes/upload.js` file to cache recently uploaded images. Modify the `meow.io/routes/index.js` to read from the cache instead the database.

Without caching:

```
$ time ./load.sh 

real	1m48.405s
```

After caching:

```
$ time ./load.sh 

real	0m30.164s
```

##### Task 5: Regulate uploads with queue

If the application receives large volume of uploads faster that the database can handle perforance will be very poor.

* We have modified the `meow.io/routes/upload.js` to store incoming images in a queue and not the database. 
* We have then modified `meow.io/app.js` to pop images stored in the queue (consider using  [`LPOP`](https://redis.io/commands/lpop) ) and save in the database. This is done every 100ms using [setInveral()](https://javascript.info/settimeout-setinterval#setinterval). This way, we can take advantage of the faster write speed for redis and drain the queue at a steady rate for longer term storage.

