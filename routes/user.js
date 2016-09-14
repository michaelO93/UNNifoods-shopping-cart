var express = require('express');
var router = express.Router(),
    passport = require('passport'),
    csrf = require('csurf');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});
router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.get('/verify_email', function (req,res,next) {
    console.log('verify_email token ',req.query.token);

    User.findOne({authToken: req.query.token},function (err, user) {
        if(err) {  console.log(err.message);
            return next(err);
        }
        user.isAuthenticated = true;
        user.save(function (err, result) {
            if(err){
                console.log(err.message);
                return next(err);
            }
            var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME,process.env.SENDGRID_PASSWORD);
            sendgrid.send({
                to:       user.email,
                from:     'noreply-shoppping-cart@gmail.com',
                subject:  'Email confirmed!',
                html:     'Awesome! We can now send you kick-ass emails'
            }, function(err, json) {
                if (err) { return console.error(err); }
                console.log(json);
            });

            res.send(user);
        })
    })
});

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/signin',
    failureFlash: true
}));

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}