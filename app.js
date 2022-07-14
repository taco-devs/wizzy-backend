var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyparser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var accountsRouter = require('./routes/accounts');
var questionsRouter = require('./routes/questions');

var app = express();

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/accounts', accountsRouter);
app.use('/questions', questionsRouter);

module.exports = app;
