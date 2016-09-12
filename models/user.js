
var  mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = mongoose.Schema({
    email: {type:String, required:true},
    password:{type:String,required:true},
    facebook_id: {type:String},
    firstName:{type:String},
    lastName:{type:String},
    otherName :{type:String},
    gender:{type:String},
    // authToken: {type:String, required:true, unique:true},
    // isAuthenticated:{type:Boolean, required:true}
});

UserSchema.methods.generateHashPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
};

UserSchema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password,this.password);
};

module.exports = mongoose.model('User', UserSchema);