/**
 * Created by michael-prime on 9/7/16.
 */
var mongoose  = require('mongoose');
var Schema = mongoose.Schema;

var Order = require('./order');

var orderHistSchema = new Schema({
   date:{type:Date, default: Date.now},
    restName : String,
    price:Number,
    order:[Order]
});

module.exports = mongoose.model('orderHistory',orderHistSchema,'orderHistory');