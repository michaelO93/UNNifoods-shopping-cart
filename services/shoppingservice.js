/**
 * Created by michael-prime on 12/12/16.
 */
var CryptoJS = require('crypto-js'),
    forge = require('node-forge'),
    utf8 = require('utf8');
var crypt = require('crypto');

var unirest = require('unirest');
var q = require('q'),
    dotenv = require('dotenv');
var createHash = require("crypto").createHash;

dotenv.load({
    path: '.env'
});

var baseUrl = process.env.apiUrl;

module.exports = {
    shopcart: function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/card/mvva/pay').
        headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                console.log(response);
                if (response.body.status === 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    verifyPayment: function (data) {
        var d = q.defer();
        // data.SECKEY = "FLWSECK-09ed20c3fef6f2f252bdc32c92a88673-X"; // staging
        data.SECKEY = process.env.STAGING_SECKEY;
        // data.SECKEY = "FLWSECK-1aa12cba44ea57b2c9d49d23842e7197-X"; // live
        //https://api.ravepay.co/flwv3-pug/getpaidx/api/v2/verify
        unirest.post(process.env.VERIFY_STAGING+'')
            .headers({
                'Content-Type': 'application/json'
            })
            .send(data)
            .end(function (response) {
                if (response.body.status === "success") {
                    d.resolve(response.body.data);
                }
                d.reject(response.body.data);
            });

        return d.promise;
    },

    chargeWithToken: function (data) {
        var d = q.defer();
        data.SECKEY = process.env.STAGING_SECKEY; //staging
        console.log(data);
        var subaccounts ={

        };

        //data.SECKEY = "FLWSECK-1aa12cba44ea57b2c9d49d23842e7197-X"; // live
// 
// https://api.ravepay.co/flwv3-pug/getpaidx/api/tokenized/charge
        unirest.post(process.env.TOKENIZED_STAGING+'')
            .headers({
                'Content-Type': 'application/json'
            })
            .send(data)
            .end(function (response) {
                if (response.body.status === "success") {
                    d.resolve(response.body.data);
                }
                d.reject(response.body.data);
            });
        return d.promise;
    },

    chargeWithSafeToken: function (data) {
        var d = q.defer();
        data.SECKEY = process.env.STAGING_SECKEY; //staging
        console.log(data);

        unirest.post("https://ravesandboxapi.flutterwave.com/v2/gpx/cards/tokenize")
            .headers({
                'Content-Type': 'application/json'
            })
            .send(data)
            .end(function (response) {
                if (response.body.status === "success") {
                    d.resolve(response.body.data);
                }
                d.reject(response.body.data);
            });
        return d.promise;
    }
};