var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nunjucks = require('nunjucks'); 
var dotenv = require('dotenv').config();
var flash = require('express-flash')
var session = require('express-session')

var app = express();

// setup 
app.use(logger('dev'));
app.use(session({
    secret: 'j5a90svvjasd',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(flash());

// configure nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});


// if the .env is not present, create a new one
app.use('/config', require('./routes/configure'));
app.use('/', require('./routes/index'));
app.use('/create', require('./routes/create'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // use the 404.html template
    res.status(404).render('404.njk');
});
// error handler
app.use(function(err, req, res, next) {
    res.status(500).render('500.njk');
    console.error(err);
});


module.exports = app;
