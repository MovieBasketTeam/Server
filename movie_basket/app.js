var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 세션과 인증
var session = require('express-session');
var passport = require('passport');

// 레디스 서버의 세션 구성을 위한 정보
//var redisClient = require('./models/redisClient.js');
var redisStore = require('connect-redis')(session);

//var routes = require('./routes/index');
var users = require('./routes/users');
var member = require('./routes/member');
var search = require('./routes/search');
var basket = require('./routes/basket');
var mypage = require('./routes/mypage');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/users', users);
app.use('/member', member);
app.use('/mypage', mypage);
app.use('/search', search);
app.use('/basket', basket);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
