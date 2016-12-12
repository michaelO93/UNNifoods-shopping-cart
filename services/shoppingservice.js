/**
 * Created by michael-prime on 12/12/16.
 */

var unirest = require('unirest');
var q = require('q'),
    dotenv = require('dotenv');

dotenv.load({path:'.env'});

   var baseUrl = process.env.apiUrl;

module.exports = {
    shopcart : function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl+ '/card/mvva/pay').
            headers({
                'Content-Type':'application/json'
        }).send(data)
            .end(function (response) {
                console.log(response);
                if(response.body.status == 'success'){
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    }
};
