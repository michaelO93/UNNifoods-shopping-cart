var q = require('q');
var unirest = require('unirest');
var dotenv = require('dotenv');
dotenv.load({path:'.env'});

var baseUrl = process.env.apiUrl;

module.exports  = {

    accountNumberValidation:function (req) {
        var deferred = q.defer();
        unirest.post(baseUrl + 'v1/resolve/account')
            .headers({
                'Content-Type':'application/json',
                'Authorization': req.AccessToken
            }).send(req.body).end(function (response) {
            console.log(response.body);
            if (response.body.status === 'success'){
                deferred.resolve(response.body);
            }
            deferred.reject(response.body);
        });
        return deferred.promise;
    }

};