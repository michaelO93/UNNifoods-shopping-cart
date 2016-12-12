/**
 * Created by michael-prime on 9/18/16.
 */
var mongoose = require('mongoose');

var product = require('./product');

var categorySchema = mongoose.Schema({
   name: {type:String,required:true},
    product :[product]
});

module.exports = mongoose.model('category-menu', categorySchema);