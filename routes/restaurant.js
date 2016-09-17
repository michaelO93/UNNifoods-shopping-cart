/**
 * Created by michael-prime on 8/23/16.
 */
var express = require('express');
var router = express.Router();
var apiRequests = require('../api');


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


router.post('/addProduct', function (req, res) {
    var formData = {};
    formData.main = req.body;
    formData.restaurantId = req.body.restaurant_id;
    if (!formData.restaurantId) {
        return res.send({error: 'Can\'t create new product!'});
    }

    apiRequests.restaurant.restaurantCreateProduct(formData, function (err, products) {
        if (err) {
            console.log(err.message);
            res.json({error: err});
            return;
        }
        return res.json(null, {data: products});
    })
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
            return res.render('user/profile', { data: response.body});
            //return res.json({error: null, data: restaurant})
        })
    }
});

router.get('/getOrders', function (req, res, next) {
    return apiRequests.restaurant.getRestaurantOrders(req, function (err, resp) {
        if (err) {
            console.log(err);
            return res.json(err.message);
        }
        return res.render('getOrders', {data: resp});
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

