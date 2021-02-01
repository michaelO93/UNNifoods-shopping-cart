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
var multer = require('multer');
var validator = require('express-validator');
var MongoStore = require('connect-mongo/es5')(session);

var routes = require('./routes/index');
var userRoutes = require('./routes/user');
var apiRestaurant = require('./routes/restaurant');
var adminDashboard = require('./routes/dashboard');
var  dotenv = require('dotenv');
dotenv.load({path:'.env'});

var app = express();

mongoose.connect(process.env.MONGODB_URI, function (err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log('we are connected to: ', db);
    }
});

require('./config/passport');


// view engine setup
app.engine('.hbs', expressHsb({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
app.use('/restaurant', apiRestaurant);
app.use('/dashboard', adminDashboard);


app.get("https://polar-tundra-70244.herokuapp.com/1mp311b1", function(request, response) {
  /* It is a good idea to log all events received. Add code *
 * here to log the signature and body to db or file       */

   console.log("Webhook Response: ", request);
  
  // retrieve the signature from the header
  var hash = req.headers["verif-hash"];
  
  if(!hash) {
  	// discard the request,only a post with rave signature header gets our attention 
  }
  
  // Get signature stored as env variable on your server
  var secret_hash = process.env.MY_HASH;
  
  // check if signatures match
  
  if(hash !== secret_hash) {
   // silently exit, or check that you are passing the write hash on your server.
  }
  
  // Retrieve the request's body
  var request_json = JSON.parse(request.body);

  // Give value to your customer but don't give any output
// Remember that this is a call from rave's servers and 
// Your customer is not seeing the response here at all

  response.send(200);
});


//RESTful API - RESTAURANTS
/* */
var RestModel = require('./models/restaurant'),
    productModel = require('./models/product'),
    Order = require('./models/order'),

    ObjectId = require('mongoose').ObjectId;

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


//creating product for  a restaurant
app.post('/api/restaurants/:id/products', function (req, res, next) {
    var restaurantId = req.params.id;
    if (restaurantId) {
        return RestModel.findById(restaurantId, function (err, restaurant) {
            if (err) {
                return console.log({error: err});
            }
            console.log(restaurant);
            var product = new productModel({
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                imagePath: req.body.ImagePath,
                restaurantId: restaurantId,
                category: req.body.category,
                quantity: req.body.quantity,
                date: req.body.date

            });

            if (product) {
                product.save(function (err, result) {
                    if (err) {
                        console.log(err.message);
                        if (err.name === "ValidationError") {
                            for (var field in err.errors) {
                                console.log(":::" + err.errors[field].message);
                            }
                        }
                    } else {
                        return res.status(200).send(product);
                    }

                });
                // return res.end("[::::]"+product);
            }

        })
    }
});

//fetching products
app.post('/api/restaurants/:id', function (req, res, next) {
    var restaurantId = req.params.id;
    var obj = {};

    return productModel.findOne({restaurantId: restaurantId}, function (err, response) {
        if (err) {
            console.log("error " + err);
            return err;
        }
        if(response == null){
            var message = 'NO oop';
            var m = JSON.stringify(message);
            return res.status(200).send(m)
        }
        else if (response) {
            obj = response._id;
            console.log("datall:" + obj);
            return res.status(200).send(response);
        }
    })
});

app.get('/api/restaurants/:id', function (req, res) {
    var restaurantId = req.params.id;
    if (restaurantId) {
        RestModel.findById(restaurantId, function (err, restaurant) {
            if (err) {
                console.log(err);
                return res.send(err.message)
            }

            return res.status(200).send(restaurant);

        })
    }
});


app.get('/api/restaurants/getOrders', function (req, res, next) {
    Order.findAll({}, function (err, docs) {
        if (err) {
            console.log(err);
            return res.send(err.message);
        }
        return res.send(null, docs);
    })
});

app.post('/api/restaurants/orders', function (req, res, next) {
    var user = req.body['user'];
    var obj = {
        user: user.id,
        name: user.name,
        address: user.address,
        cart: user.cart,
        paymentId: user.paymentId
    };

    Order = new Order(obj);
    if (obj) {
        Order.save(function (err, docs) {
            if (err) {
                console.log(err);
                return res.send(err.message);
            }
            return res.send(null, docs);
        })
    }
});

app.post('/emails', function (req, res) {
    let ebody = req.body;
    ebody = ebody.split(";");
    res.send((ebody.join("\n")));

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
