import express from "express";
import passport from "passport";
import { initPassport } from "./passport-config.js"

initPassport();
const router = express.Router();

passport.serializeUser((user, done) => {
 done(null, user);
});

passport.deserializeUser((obj, done) => {
 done(null, obj);
});

router.get('/test', (req, res) => res.send('hello'));

// Route to kick off the login process
router.get('/login',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/auth-failure' }),
    (req, res) => res.redirect('/')
);

router.get('/logout', function(req, res, next) {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Good practice: clear the cookie
            res.redirect(process.env.APPLICATION_URL);
        });
    });
});

// Callback route (Ensure this matches your Redirect URI in Azure)
// If RESPONSE_MODE is 'form_post', use router.post
router.post('/auth/callback',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/auth-failure' }),
    (req, res) => {
        req.session.isAuthenticated = true; // Manual flag for your middleware
        res.redirect('/');
    }
);

router.get('/auth-success', (req, res) => {
 const token = (req?.user)?._json?.email;
 const name = (req?.user)?._json?.given_name;
 res.redirect(`${process.env.APPLICATION_URL}`);
});

router.get('/auth-failure', (req, res) => {
 res.status(401).json({ message: 'Authentication failed' });
});

router.get('/getLoggedInUser', (req, res) => {
    if (req.isAuthenticated()) { // Passport's built-in helper
        res.json({
            username: req.user?.displayName,
            email: req.user?._json?.email
        });
    } else {
        res.json({ username: null, email: null });
    }
});

function regenerateSessionAfterAuthentication (req, res, next) {
    var passportInstance = req.session.passport;
    return req.session.regenerate( (err) => {
        if (err) {
            return next(err);
        }
        req.session.passport = passportInstance;
        req.session.isAuthenticated = true;
        return req.session.save(next);
    });
}

export default router;