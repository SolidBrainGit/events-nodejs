let express = require('express');
let router = express.Router();
let moment = require('moment');
let bodyParser = require("body-parser");
let Promise = require('bluebird');

let urlencodedParser = bodyParser.urlencoded({extended: false});

let Line = require('models/Line');


router.post('/line/notification/add',urlencodedParser, function (req, res, next) {

	let body = req.query;

	let newNotification = {
		time: body['notification_time'],
		content: body['notification_content'],
		link: body['notification_link'],
		sender: body['notificationSender'],
		audience: body['notification_audience'],
	};

	Promise.props({
		event: Line.findOneAndUpdate( {id: req.body.id}, { $push: {'notifications': newNotification}}).execAsync()
	}).then(function (results) {
		res.sendStatus(200);
	})
		.catch(function (err) {
			next(err);
		});

});

module.exports = router;