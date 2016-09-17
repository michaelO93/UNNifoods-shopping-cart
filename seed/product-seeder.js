/**
 * Created by michael-prime on 8/17/16.
 */
var Product = require('../models/product');
var mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/shopping');

var products = [
    new Product({
        imagePath: '../../images/food1.jpg',
        title: 'Ewedu Beta!',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit Aperiam assumenda dicta dignissimos dolore dolores ea',
        price: 240
    }),
    new Product({
        imagePath: '../../images/food2.jpg',
        title: 'Correct Yam & Beans!',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit Aperiam assumenda dicta dignissimos dolore dolores ea,',
        price: 200
    }),
    new Product({
        imagePath: '../../images/food3.jpg',
        title: 'Mama Ebuka!',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit Aperiam assumenda dicta dignissimos dolore dolores ea,!',
        price: 150
    })

];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function (err, result) {
        if (err) console.error(err);
        console.log(result.toString());
        done++;
        if (done === products.length) {
            exit();
        }
    });
}
function exit() {
    mongoose.disconnect();
}
