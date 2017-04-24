'use strict';

/**
 * Module dependencies.
 */
var _ = require('underscore');
var express = require('express');
var mongoose = require('mongoose');
var Promise = require('bluebird');

require('rootpath')();

var dir = __dirname;
var appRoot = process.env.PWD;

Promise.promisifyAll(mongoose);

var User = require('models/user');

module.exports = function (req, res, next) {

    Promise.props({
        user: User.findOne({id: req.params.id}).execAsync()
    })
        .then(function (results) {
            var user = results.user;
            var title_page = user.username + "'s Profile";
            var data = {
                title: title_page,
                showMenu: true,
                user: user
            };

            res.render('pages/profile', data);
        })
        .catch(function (err) {
            next(err);
        });

};