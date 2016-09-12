var request = require('request');
require('request-debug')(request);

var baseUrl = 'http://localhost:3000/api';

var e = module.exports;

e.restaurant = {
    createRestaurant: createRestaurant,
    createRestaurantAddress: addRestaurantAddr,
    restaurantCreateProduct : restaurantCreateProduct,
    addRestaurantProductImage: addRestaurantProductImage,
    getRestaurantById: getRestaurantById,
    getRestaurantOrders : getRestaurantOrders,
    createOrderForRestaurant:createOrderForRestaurant,
    getOrdersHistory: getRestaurantOrdersHistory
};

function createRestaurant(restaurant, cb) {
    var req = {
        method: 'POST',
        url: baseUrl + '/restaurant',
        headers: {"Content-Type": "application/json"},
        form: restaurant
    };
    return request(req, cb);
}

function addRestaurantAddr(restaurant,address, cb) {
    var req= {
        method: 'POST',
        url: baseUrl + '/restaurant/'+ restaurant + '/addresses',
        form: address
    };
    return request(req, cb);
}

function addRestaurantProductImage(data, cb) {
    var req = {
        method:'POST',
        url: baseUrl +'/restaurant/'+ data.restaurantId + '/products/' + data.productId + '/images',
        form: data.main
    };
    return request(req, cb);
}

function  restaurantCreateProduct(data, cb) {
    var req  = {
        method :'POST',
        url: baseUrl + '/restaurant/'+ data.restaurantId + '/products',
        form: data
    };
    return request(req, cb);
}

function getRestaurantById(data,cb) {
    var req = {
        method:'GET',
        url: baseUrl + '/restaurant/'+data.restaurantId,
        form: data
    };
    return request(req, cb);
}

function getRestaurantOrders(data,cb) {
    var req = {
        method:'GET',
        url: baseUrl + '/restaurant/'+data.restaurantId +'/orders'
    };
    return request(req,null,cb);
}

function createOrderForRestaurant(orders,cb) {
    var req={
        method:'POST',
        url:baseUrl + '/restaurant/:restaurantId/orders/:orderId',
        params:{
            restaurantId: '@restaurantId',
            orderId:'@orderId'
        }
    };
    return request(req,null,cb);
}

function getRestaurantOrdersHistory(data, cb) {
    var req ={
        method:'GET',
        url:baseUrl + '/restaurants/ordersHistory',
        form:data
    };
    return request(req, null,cb);
}