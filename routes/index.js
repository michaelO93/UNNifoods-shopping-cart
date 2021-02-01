var moneywave  = require( "../api/index");

var express = require('express');
var router = express.Router(),
    passport = require('passport');

var Product = require('../models/product');
var Cart = require('../models/cart'),
    Order = require('../models/order');
var flutterwave = require("../services/Encryption.js");
const e = require("../services/e");
const ine = require("../services/inline-emails");
var shopping = require("../services/shoppingservice.js");
var q = require('q');
var dotenv = require('dotenv');
var createHash = require("crypto").createHash;

dotenv.load({
    path: '.env'
});

var unirest = require('unirest');

/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [],
            chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {
            title: 'Shopping Cart', products: productChunks,
            successMsg: successMsg, noMessages: !successMsg
        });
    });
});

router.post('/verify-payment',function(req, res, next){
    var txref = req.body.txref;
    var data = {
        "txref": txref
    };
    shopping.verifyPayment(data).then(function(response){
        return res.json(response)
    },
    function(error){
        return res.json(error);
    });
});

router.post('/integrity-hash', function (req, res, next) {

    //FLWPUBK-1acc0c234b21839f4ffac462d63beb39-X

    var hashedPayload = '';
    var payload2 = {
        "PBFPubKey": "FLWPUBK-8e189fc497790b12b287bd0d8f511bfd-X",
        "amount": req.body.amount,
        "custom_description": req.body.custom_description,
        "custom_logo": req.body.custom_logo,
        "custom_title": req.body.custom_title,
        "country": req.body.country,
        "currency": req.body.currency,
        "customer_email":req.body.customer_email,
        "customer_firstname": req.body.customer_firstname,
        "customer_lastname": req.body.customer_lastname,
        "customer_phone": req.body.customer_phone,
        "txref": "MG-" + Date.now()
    };


    var payload = {
        "PBFPubKey": "FLWPUBK_TEST-33e0873bf799aa0c43ba0dcaa1fbdd6e-X",
        "amount": req.body.amount,
        "custom_description": req.body.custom_description,
        "country": req.body.country,
        "currency": req.body.currency,
        "customer_email":req.body.customer_email,
        "customer_firstname": req.body.customer_firstname,
        "customer_lastname": req.body.customer_lastname,
        "customer_phone": req.body.customer_phone,
        "payment_type":"account",
        "payment_options":"account",
        "redirect_url":"https://1x-pay.vagrant.lan",
        "txref": "2004808809",
    };


    var keys = Object.keys(payload).sort();
    for(var index in keys){
        if (keys.hasOwnProperty(index)) {
            var key = keys[index];
            hashedPayload += payload[key];
        }
    }
    // var hashedString = hashedPayload + process.env.STAGING_SECKEY;
    var hashedString = hashedPayload + "FLWSECK_TEST-fd09e5fabf10c2dff02f2f0d404da372-X";
    console.log(hashedString);

    var sha256Hash = createHash('sha256').update(hashedString, 'utf8').digest('hex');
    console.log("Hash: "+sha256Hash);
    return res.json({hash: sha256Hash, txref: payload.txref});
});

router.post('/chargeWithToken',function(req, res, next){
    console.log(req.body);
    shopping.chargeWithToken(req.body).then(function(response){
        return res.json(response)
    },
    function(error){
        return res.json(error);
    });
});

router.post('/chargeWithSafeToken',function(req, res, next){
    console.log(req.body);
    shopping.chargeWithSafeToken(req.body).then(function(response){
            return res.json(response)
        },
        function(error){
            return res.json(error);
        });
});


router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

    Product.findById(productId, function (err, product) {
        if (err) return next(err);
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    })
});

router.post('/webhook-payment', function(req,res, next){

    var myhash = process.env.MY_HASH;
    var hash = req.headers["verif-hash"];
    if(!hash) return;
    if( hash != myhash) return;

    var response = JSON.parse(req.body);
    console.log(response);

    return res;

});

router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice})
});

router.get('/transfer', function (req, res, next) {

    res.render('transfer')
});

router.get('/checkout', function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg});
});

router.post('/checkout', function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);


    var data = {
        "merchantid": process.env.test_merchant_key,
        "amount": flutterwave.encrypt(process.env.test_api_key, cart.totalPrice ),
        "cardno": flutterwave.encrypt(process.env.test_api_key, req.body.cardno),
        "cvv": flutterwave.encrypt(process.env.test_api_key, req.body.cvv),
        "authmodel": flutterwave.encrypt(process.env.test_api_key, "NOAUTH"),
        "currency": flutterwave.encrypt(process.env.test_api_key, req.body.currency),
        "country": flutterwave.encrypt(process.env.test_api_key, req.body.country),
        "custid": flutterwave.encrypt(process.env.test_api_key,req.body.uniqid),
        "expirymonth": flutterwave.encrypt(process.env.test_api_key, req.body.expirymonth),
        "expiryyear": flutterwave.encrypt(process.env.test_api_key, req.body.expiryyear),
        "narration": flutterwave.encrypt(process.env.test_api_key, "food purchase")
    };

    console.log(req.body);

    shopping.shopcart(data).then(function (response) {
        if(response.data.responsecode == '00' || response.data.responsecode == '02'){
            console.log(response.data);
            req.flash('success','Successfully bought Product!');
            req.session.cart = null;
            return res.json(response);
        }else if(response.data.responsecode != '00' || response.data.responsecode != '02'){
            console.log(response.data);
            return res.json(response);
        }
    },function (error) {
        if(error){
            req.flash('error',error.message);
            return res.redirect('/checkout');
        }
    }).catch(function (error) {
       console.log(error);
        return res.redirect('/checkout');
    });
});

router.get('/shopping-cart/auth/facebook/',
    passport.authenticate('facebook.login',{scope:'email'}));

router.get('/shopping-cart/auth/facebook/callback/',
    passport.authenticate('facebook.login',
        {
            successRedirect: '/dashboard',
            failureRedirect: '/user/signin'
        })
);

var AccessToken = function (req, res, next) {
    var data  = {
        "apiKey": process.env.apiKey,
        "secret": process.env.secret
    };

    var baseUrl = process.env.apiUrl;
    unirest.post(baseUrl + 'v1/merchant/verify')
        .headers({
            'Content-Type': 'application/json'
        })
        .send(data)
        .end(function (response) {
            if (response.body.status === 'success') {
                req.AccessToken = response.body.token;
            }
            next();
        });

};

router.post('/resolve/account', AccessToken, function (req,res,next) {
    next();
}, moneywave.accountNumberValidation);

router.post('/encrypt', function (req, res) {
    res.json(e.encryptCardDetails(req.body));
});

router.post('/emails', function (req,res) {
    let body =  req.body;
    body = body.toString();
    body = body.split(";");
   for ( let i=0; i <= body.length; i++){
       console.log(body[i]);
   }

});
module.exports = router;
