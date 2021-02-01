const q = require('q');

module.exports = {

    eMailAdr: function (emailsBody) {

        let d = q.defer();

        let eBody = emailsBody.toString();
        if (eBody === ""){
            d.reject(null);
        } else{
            d.resolve(eBody.split(";").join("\n"));
        }
        return d;
    }

};