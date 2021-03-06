var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var chalk = require('chalk');

var indexRouter = require('./routes/index');
var uploadRouter = require('./routes/upload');
var factRouter = require('./routes/fact');

const db = require('./data/db');
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1', {});
const imageQueue = 'imageQueue';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/upload', uploadRouter);
app.use('/fact', factRouter);

// TASK 5-------------------------------
async function uploadToDB() {
  await client.lpop(imageQueue, async function(error, image) {
    if (image != null){
      await db.cat(image);
      console.log(chalk.keyword('orange')('...Uploading Image to DB from Redis Queue'));
    }
  })
}

setInterval(uploadToDB, 100);
// TASK 5 END----------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
