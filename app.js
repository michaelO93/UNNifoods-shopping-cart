var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHsb = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo/es5')(session);

var routes = require('./routes/index');
var userRoutes = require('./routes/user');
var apiRestaurant = require('./routes/restaurant');
var adminDashboard = require('./routes/dashboard');

var app = express();



// nev.configure({
//     verificationURL: 'http://shoppning-cart.com/email-verification/${URL}',
//     persistentUserModel: User,
//     tempUserCollection: 'shopping-cart-tempUsers',
//
//     transportOptions: {
//         service: 'Gmail',
//         auth: {
//             user: 'michaelonyeforo112@gmail.com',
//             pass: 'michael9481'
//         }
//     },
//     verifyMailOptions: {
//         from: 'Do Not Reply <noreply-shopping-cart@gmail.com>',
//         subject: 'Please confirm account',
//         html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
//         text: 'Please confirm your account by clicking the following link: ${URL}'
// //     }
// // }, function(error, options){
//     if(error) return console.log(error);
// });

// nev.generateTempUserModel(User, function () {
//
// });
// var tempUser = require('./models/tempUser');
// nev.configure({
//    tempUserModel : tempUser
// }, function (err, options) {
//  if(err) return console.log(err);
// });

mongoose.connect(process.env.DB_URI || 'mongodb://192.168.99.100:27017/shopping', function (err, db) {
    if (err) {
        console.log(err);
    }else{
        console.log('we are connected to: ', db);
    }

});
require('./config/passport');


// view engine setup
app.engine('.hbs', expressHsb({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'mnmbjbjbkj098hjboyuu899077898-mkk',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRoutes);
app.use('/', routes);
app.use('/restaurants', apiRestaurant);
app.use('/dashboard', adminDashboard);


app.get('/shopping-cart/auth/facebook/',
    passport.authenticate('facebook.login',{scope:'email'}));

app.get('/shopping-cart/auth/facebook/callback/',
    passport.authenticate('facebook.login',
        {
            successRedirect: '/dashboard',
            failureRedirect: '/user/signin'
        })
);


//RESTful API - RESTAURANTS
/* */
var RestModel = require('./models/restaurants'),
    productModel = require('./models/product'),
    Order = require('./models/order');

app.get('/api', function (req, res, next) {
    res.send('WELCOME TO UNNIFOODS - API');
});

app.post('/api/restaurants', function (req, res, next) {
    if (!req.body) {
        return next("Invalid");
    }

    var restaurant = new RestModel();
    restaurant.name = req.body.name;
    restaurant.address = req.body.address;
    restaurant.email = req.body.email;
    restaurant.phone = req.body.phone;

    if (restaurant) {
        restaurant.save(function (err, results) {
            if (err) {
                return console.log(err);
            } else {
                return console.log("Success:: data inserted successfully!" + {data: results})
            }
        });
        return res.send(restaurant);

    }

});

app.post('/api/restaurants/:id/products', function (req, res, next) {
    var restaurantId = req.params.id;
    if (restaurantId) {
        return RestModel.findById(restaurantId, function (err, restaurant) {
            if (err) {
                return console.log({error: err});
            }
            var product = new productModel({
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                imagePath: "",
                restaurantId: restaurant.id
            });

            if (product) {
                product.save(function (err, result) {
                    if (err) {
                        console.log(err.message);
                        if (err.name === "ValidationError") {
                            for (var field in err.errors) {
                               console.log(":::"+err.errors[field].message);
                            }
                        }
                    } else {
                        return console.log(result)
                    }
                    return res.send(result);
                });
                return res.send(product);
            }

        })
    }
});


app.get('/api/restaurants/:id', function (req, res) {
    var restaurantId = req.params.id;
    if(restaurantId){
        RestModel.findById({_id:restaurantId}, function (err, restaurant) {
            if(err){
                console.log(err);
                return res.send(err.message)
            }
            return res.send('200', restaurant);
        })
    }
});

app.get('/api/restaurants/getOrders', function (req,res,next) {
   Orders.find({}, function (err,docs) {
       if(err) {
           console.log(err);
           return res.send(err.message);
       }
       return res.send(null,docs);
   })
});

app.post('/api/restaurants/orders', function (req,res,next) {
    var user  = req.body['user'];
    var obj = {
       user:user.id,
        name:user.name,
        address: user.address,
        cart : user.cart,
        paymentId : user.paymentId
   };

   Order = new Order(obj);
   if(obj){
       Order.save(function (err,docs) {
           if(err){
               console.log(err);
               return res.send(err.message);
           }
           return res.send(null,docs);
       })
   }
});




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
    // res.render('error',{error:error})
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
