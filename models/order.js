/**
 * Created by michael-prime on 9/2/16.
 */
var mongoose  = require('mongoose');


var orderSchema = new mongoose.Schema({
    // user:{type: mongoose.Schema.Types.ObjectId, ref:'User'},
    name:{type:String, required:true},
    address:{type:String,required:true},
    cart:{type :Object, required:true},
    paymentId:{type:String,required:true}
});

module.exports = mongoose.model('Order', orderSchema);
