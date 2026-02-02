var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/error', (req, res) => getError());

function getError() {
    const error = new Error('test');
    error.status = 504;
    throw error;
}


// Global Error Handler
app.use((err, req, res, next) => {
    defaultError = {
        log: 'Express error handler caught unknown middleware error',
        status: err.status || 500,
        message: {err: 'An error occured'}
    }

    const errorObj = {...defaultError, ...err}
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
});

module.exports = app;
