var express = require('express');
var router = express.Router();
var passport = require('passport');

require('rootpath')();

var util = require('util');
var Promise = require('bluebird');

var User = require('models/user');


var middleware = require('middlewares');
var api_router = require('./api');
var home = require('./home');
var users = require('./users');
var profile = require('./user/profile');
var logout = require('./logout');
var lines = require('./line/lines');

var user_add = require('./user/add');


router.use(logout);
router.use(user_add);
router.use(lines);


router.all('*', middleware.all);
router.all('*', middleware.auth);


/* GET home page. */
router.get('/', home);

/* page users . */
router.get('/users', users);
router.all('/users/:id?', profile);


// login
router.get('/login', function (req, res, next) {
    var data = {
        title: 'Login',
        showMenu: false
    };
    res.render('pages/login', data);
});

router.post('/login', function (req, res, next) {
    console.warn('trying to login');

    // passport.authenticate('local', {
    //     successRedirect: '/',
    //     failureRedirect: '/login'
    // })(req, res, next);

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err)
        }
        if (!user) {
            console.log(info);
            return res.redirect('/login')
        }
        // user ok
        req.logIn(user, function (err) {
            console.log(info);
            console.error(user);
            // save login time
            User.setLogInTime(user.id);
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);


});


module.exports = router;
