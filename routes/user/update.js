var express = require('express');
var router = express.Router();

var path = require('path');
var crypto = require('crypto');
var multer = require('multer');

var User = require('../../models/User');
var util = require('../../util');

var Promise = require('bluebird');
var moment = require('moment');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, util.getAbsolutePath('users'))
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) {
                return cb(err);
            }
            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
});

var upload = multer({storage: storage});

router.post('/user/update/:id?', upload.any(), function (req, res, next) {
    let body = {};
    let files = req.files;


    let picture = {};

    if (files) {
        files.forEach(function (file) {
            if (file.fieldname === 'profile-image') {
                picture.original = util.getRelativePath(file.path);
            }
            if (file.fieldname === 'userpic') {
                picture.circle = util.getRelativePath(file.path);
            }
        });
        Promise.props({
            user: User.findOne({ id: req.params.id }).execAsync()
        }).then(function (results) {
            if (picture.original)
                results.user.profile_picture = picture.original;
            if (picture.circle)
                results.user.profile_picture_circle = picture.circle;
            results.user.save();
        });
    }
    else {
        body = req.body;
        
        if (body.name == 'date_of_birth')
            body.value = util.stringToDate(body.value, 'dd.mm.yyyy', '.');
    }

    let val;
    if (body['value'])
        val = body['value'];
    else
        val = body['value[]'];

    Promise.props({
        user: User.update({ id: req.params.id }, { [body.name]: val }).execAsync()
    }).then(function (results) {     
        res.status(200).send(body['value']);
    }).catch(function (err) {
        next(err);
    });

});

module.exports = router;
