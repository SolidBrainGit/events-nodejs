let express = require('express');
let bodyParser = require("body-parser");

let Notification = require('models/Notification');

let router = express.Router();
let urlencodedParser = bodyParser.urlencoded({extended: false});


router.post('/notification/add', urlencodedParser, function (request, response, next) {

	let query = request.query;
	console.log(query['notification_time']);
	let date = new Date(query['notification_time']);


	console.log(date);

	let newNotification = new Notification({
		time: date.getDate(),
		content: query['notification_content'],
		link: query['notification_link'],
		sender: query['notificationSender'],
		audience: query['notification_audience'],
	});

	newNotification.save()
		.then(function (doc) {
			console.log(doc);
			response.send(200);
		})
		.catch(function (err) {
			console.log(err);
		});


});

module.exports = router;