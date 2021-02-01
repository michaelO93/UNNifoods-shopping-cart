var moneywave = require("../api/transfer");

module.exports = {
    accountNumberValidation: function (req, res) {

        moneywave.accountNumberValidation(req).then(function (response) {
            return res.json(response);

        }).catch(function (error) {
            if (error) {
                console.log(error);
                return res.json(error);
            }
        })
    }
};