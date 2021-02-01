const forge    = require('node-forge');
const md5 = require('md5');

module.exports = {

    getKey() {
        let sec_key = process.env.STAGING_SECKEY;
        // let sec_key = process.env.LIVE_SECKEY;
        let keymd5 = md5(sec_key);
        let keymd5last12 = keymd5.substr(-12);

        let seckeyadjusted = sec_key.replace('FLWSECK-', '');
        let seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

        return seckeyadjustedfirst12 + keymd5last12;
    },

    encryptCardDetails (payment_details) {
        payment_details = JSON.stringify(payment_details);
        let cipher   = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(this.getKey()));
        cipher.start({iv:''});
        cipher.update(forge.util.createBuffer(payment_details, 'utf-8'));
        cipher.finish();        let sec_key = process.env.STAGING_SECKEY;
        // let sec_key = process.env.LIVE_SECKEY;
        let keymd5 = md5(sec_key);
        let keymd5last12 = keymd5.substr(-12);

        let seckeyadjusted = sec_key.replace('FLWSECK-', '');
        let seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

        return seckeyadjustedfirst12 + keymd5last12;

        let encrypted = cipher.output;
        let body = {
                "PBFPubKey": process.env.STAGING_PUBLIC_KEY,
                // "PBFPubKey": process.env.LIVE_PUBLIC_KEY,
                "alg": "3DES-24",
                client: forge.util.encode64(encrypted.getBytes()) ,
            };
        return body;
    },

};
