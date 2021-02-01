/**
 * Created by michael-prime on 12/12/16.
 */
var CryptoJS = require('crypto-js'),
    forge = require('node-forge'),
    utf8 = require('utf8');

var  dotenv = require('dotenv');
dotenv.load({path:'.env'});

module.exports = {

    encrypt: function (key, text) {
        text = (text) ? text.toString() : '';
        key = CryptoJS.MD5(utf8.encode(key)).toString(CryptoJS.enc.Latin1);
        key = key + key.substring(0, 8);
        var cipher = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
        cipher.start({iv: ''});
        cipher.update(forge.util.createBuffer(text, 'utf-8'));
        cipher.finish();
        var encrypted = cipher.output;
        return ( forge.util.encode64(encrypted.getBytes()) );
    },

    integrityValue: function (req,res) {
        var hashedPayload = '';
        var payload = {
            PBFPubKey: "FLWPUBK-8e189fc497790b12b287bd0d8f511bfd-X",
            customer_email: "michaelonyeforo112@gmail.com",
            customer_firstname: "Temi",
            customer_lastname: "Adelewa",
            custom_logo: "https://image.ibb.co/dLg6AU/Screen_Shot_2018_09_13_at_5_14_40_PM.png",
            amount: 20,
            customer_phone: "234099940409",
            country: "NG",
            currency: "NGN",
            txref: "MG-" + Date.now()
        };
            var keys = Object.keys(payload).sort();
            for(var index in keys){
                if (keys.hasOwnProperty(index)) {
                    var key = keys[index];
                    hashedPayload += payload[key];
                }
            }

            var hashedString = hashedPayload + process.env.STAGING_SECKEY;

        var sha256Hash = createHash(hashedString).digest().hex('');

        res.json({hash: sha256Hash, txref: payload.txref});
    }
};
