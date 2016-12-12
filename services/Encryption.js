/**
 * Created by michael-prime on 12/12/16.
 */
var CryptoJS = require('crypto-js'),
    forge = require('node-forge'),
    utf8 = require('utf8');

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
    }
};