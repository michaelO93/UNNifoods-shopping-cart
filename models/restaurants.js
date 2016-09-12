/**
 * Created by michael-prime on 8/23/16.
 */
var mongoose = require('mongoose');

var restaurantSchema = new mongoose.Schema({
    name: {type:String,required:true},
    address: {type: String,required:true},
    email:{type:String, required:true},
    phone:{type:Number}
});

module.exports = mongoose.model('restaurant', restaurantSchema);