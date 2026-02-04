import AuthRoute from './auth-route.js';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const app = express();
app.use(session({
    secret: process.env.AZURE_CLIENT_SECRET, // In production, use a random string from process.env
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(AuthRoute);

// app.use(session({
//     secret: process.env.AZURE_CLIENT_SECRET, // In production, use a random string from process.env
//     resave: false,
//     saveUninitialized: false,
//     cookie: { 
//         secure: false, // Set to true if using HTTPS
//         maxAge: 24 * 60 * 60 * 1000 // 24 hours
//     }
// }));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({
//     secret: process.env.AZURE_CLIENT_SECRET, // In production, use a random string from process.env
//     resave: false,
//     saveUninitialized: false,
//     cookie: { 
//         secure: false, // Set to true if using HTTPS
//         maxAge: 24 * 60 * 60 * 1000 // 24 hours
//     }
// }));




const ensureAuthenticated = (req, res, next) => {
    // passport sets req.isAuthenticated() to true if login was successful
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


app.use('/', ensureAuthenticated, indexRouter);
app.use('/users', ensureAuthenticated, usersRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    const defaultError = {
        log: 'Express error handler caught unknown middleware error',
        status: err.status || 500,
        message: {err: 'An error occured'}
    }

    const errorObj = {...defaultError, ...err}
    console.log(err)
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
});

export default app
