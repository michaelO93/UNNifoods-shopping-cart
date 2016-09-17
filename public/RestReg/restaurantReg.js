/**
 * Created by michael-prime on 8/23/16.
 */
var express = require('express');
var rests = require('../../models/restaurant');

exports.createRestaurant = function (req, res, next) {
    if(req.body.restaurant){
        var restaurant = req.body.restaurant;
        req.models.rests.create(restaurant, function (err, resp) {
            if(err) return next(new Error('Can\'t create restaurant'));
            res.json({data: resp})
        })
    }
};