/**
 * Created by michael-prime on 8/23/16.
 */
var express = require('express');
var router = express.Router();
var apiRequests = require('../api');

var RestModel = require('../models/restaurant'),
    CategoryModel = require('../models/category-menu'),
    ProductModel = require('../models/product');

var fs = require("fs"),
    multer = require('multer');
var path = require("path");
var f= null;
 f = path.join(__dirname,'../../images');
var storage = multer.diskStorage({
    dest: function (req,file,cb) {
        cb(null,f);
    },
    filename:function (req,file,cb) {
        cb(null,file.originalname);
    }
});


router.get('/register', function (req, res) {
    res.send('we are getting something');
});

router.post('/register', function (req, res) {

    var restaurantData = req.body;

    apiRequests.restaurant.createRestaurant(restaurantData, function (err, restaurant) {
        if (err) {
            console.log(err);
            return res.json({error: err});
        }

        req.session.restaurantData = restaurantData;
        res.json(null, {data: restaurantData});


    });


});


router.post('/addProduct', function (req, res, next) {
    var formdata = {};
    RestModel.findOne({name: req.body.rest_name}, function (err, response) {
        if(err){
            return console.log(err)
        }

        console.log(response);

        formdata.ImagePath = f;
        formdata.title= req.body.product_title;
        formdata.description = req.body.product_desc;
        formdata.price = req.body.product_price;
        formdata.restaurantId = response._id;
        formdata.date = new Date();
        formdata.quantity = req.body.product_quantity;
        formdata.category  = req.body.menu;

        apiRequests.restaurant.restaurantCreateProduct(formdata,function (err,result) {
            if(err){
                return console.log("Error: Couldn't  create product", err);
            }
            return  res.render('dashboard/menu_add',{messages: 'Successfully Created'})
        })
    });


});

router.get('/addProduct',function (req,res) {
    res.render('dashboard/menu_add');
});

router.get('/view_menu', function (req,res,next) {
    res.render('dashboard/view_menu');
});

router.post('/getAddedProducts',function (req,res,next) {

    RestModel.findOne({name: req.body.rest_name},function (err,response) {
        if(err){
            console.log(err);
            return err;
        }
        console.log("::::"+response);
        var formdata ={};
        formdata.restaurantId  = response._id;

       return apiRequests.restaurant.getRestaurantProduct(formdata, function (err, result) {
            if(err){
                console.log(err.message);
                var error = err.message;
                return error;
            }

            if(!result.body ){
                var message  = 'No Product Found';
                return res.render('dashboard/view_menu',{error:message , success: mesage});
            }
            console.log("data: " + result.body);
           var r = JSON.parse(result.body);
           message  = 'Product fetch Successful';
           return res.render('dashboard/view_menu',{error:error , products : r, success: message});

        })
    })

});

router.get('/addProduct', function (req, res) {
    //var mess = req.flash('error');
    res.render('dashboard/menu_add');

});


router.post('/addProductImage', function (req, res) {
    var formData = {};
    formData.main = req.body.main;
    formData.restaurantId = req.body.restaurant_id;
    formData.productId = req.body.product_id;
    formData.imageId = req.body.image_id;

    if (formData) {
        apiRequests.restaurant.addRestaurantProductImage(formData, function (err, products) {
            if (err) {
                console.log(err);
                return res.json({error: err});
            }
            return res.json(null, {data: products});
        })
    }

});


router.get('/:id', function (req, res) {
    var formData = {};
    formData.restaurantId = req.params.id;
    if (formData) {
        return apiRequests.restaurant.getRestaurantById(formData, function (err, response) {
            if (err) {
                console.log(err);
                return res.json(err);
            }

            console.log(response.body);
            return res.render('user/profile', {data: response.body});
            //return res.json({error: null, data: restaurant})
        })
    }

});

router.get('/getAllOrders', function (req, res, next) {
    return apiRequests.restaurant.getAllOrders(function (err, resp) {

        if (err) {
            console.log(err);
            return res.json(err.message);
        }

        if (!resp) {
            var message = 'No order is available '
        }

        return res.render('getOrders', {data: resp, message: message});
    })
});

router.post('/orders', function (req, res, next) {
    var data = req;
    if (data) {
        apiRequests.restaurant.createOrderForRestaurant(data, function (err, resp) {
            if (err) {
                console.log(err);
                return res.send(err.message);
            }
            console.log({data: resp});
            return res.json(null, {data: resp});
        })
    }
});

module.exports = router;

