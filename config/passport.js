/**
 * Created by michael-prime on 8/18/16.
 */
var passport = require('passport'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    User = require('../models/user'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

var sendgrid =require('sendgrid')(process.env.SENDGRID_USERNAME,process.env.SENDGRID_PASSWORD);

var appId = '1639529383004359',
    appSecret = 'ea6ee9d1f5aa01aec320773cd6854b4d';

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
});

passport.use('local.signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
        req.checkBody('password', 'Invalid Password').notEmpty().isLength({min: 4});
        var errors = req.validationErrors();
        if (errors) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });
            return done(null, false, req.flash('error', messages));
        }
        User.findOne({'email': email}, function (err, user) {
            if (err) return done(err);
            if (user) return done(null, false, {message: 'Email is already taken!'});

            //email auth
            var seed = crypto.randomBytes(20);
            var authToken  = crypto.createHash('sha1').update(seed+req.body.email).digest('hex');

            var newUser = new User();
            newUser.email = email;
            newUser.password = newUser.generateHashPassword(password);
            newUser.authToken = authToken;
            newUser.isAuthenticated = false;

            newUser.save(function (err) {
                if (err) return done(err);
                return done(null, newUser);
            })
        })
    }));

passport.use('local.signin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
        req.checkBody('password', 'Invalid Password, Password must be atleast 3').notEmpty().isLength({min: 4});
        var errors = req.validationErrors();
        if (errors) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });
            return done(null, false, req.flash('error', messages));
        }
        User.findOne({'email': email}, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, {message: 'No user found!'});
            if (!user.isValidPassword(password)) return done(null, false, {message: 'Wrong Password'});
            return done(null, user);
        })
    }));

passport.use('facebook.login', new FacebookStrategy({
    clientID: appId,
    clientSecret: appSecret,
    callbackURL: "http://localhost:3000/shopping-cart/auth/facebook/callback/",
    profileFields: ['id', 'email', 'displayName']

}, function (refreshToken, accessToken, profile, done) {

    process.nextTick(function () {
        User.findOne({'facebook_id': profile.id}, function (err, user) {
            if (err) return done(err);
            if (user) {
                return done(null, user)
            }
            else {
                var newUser = new User();
                newUser.email = profile.email;
                newUser.facebook_id = profile.id;
                newUser.otherName = accessToken;
                newUser.gender = convertFBGender(profile.gender);

                if (newUser) {
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        //return new created user
                        return done(null, newUser);
                    })
                }

            }
        })
    });
}));

function convertFBGender(gender) {
    switch (gender) {
        case 'male':
            return 'M';
        case 'female':
            return 'F';
        default:
            return 'X';
    }
}
