/**
 * Created by michael-prime on 8/17/16.
 */
var mongoose  = require('mongoose');


var productSchema = new mongoose.Schema({
    imagePath:{type:String, required:true},
    title:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number, required:true},
    restaurantId:[{type:mongoose.Schema.Types.ObjectId,ref:'restaurant'}],
    date: {type:Date, default:Date.now},
    quantity: {type: String,required:true},
    category : {type:String}

});

module.exports = mongoose.model('Product', productSchema);
