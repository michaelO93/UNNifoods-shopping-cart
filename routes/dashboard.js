/**
 * Created by michael-prime on 9/14/16.
 */
var express = require('express');
var router = express.Router();


router.get('/', isLoggedIn, function (req,res, next) {
   res.render('dashboard/home');
});

router.post('/',isLoggedIn,function (req,res,next) {
    res.render('dashboard/home')
});

router.get('/widgets',isLoggedIn, function (req,res,next) {
    res.render('dashboard/widgets')
});

router.get('/charts',isLoggedIn, function (req,res) {
   res.render('dashboard/charts')
});


module.exports = router;

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) return next();
    res.redirect('/user/signin')
}