let express = require('express');
let router = express.Router();
let Promise = require('bluebird');
let moment = require('moment');

let config = require('config');
let default_image_user = config.get('images:default_image_user');

let Party = require('models/Party');

router.get('/party/:id/attendees', function (req, res, next) {

	Promise.props({
		party: Party.findOne({id: req.params.id}).execAsync()
	})
		.then(function (results) {
			let attendees = results.party.attendees;
			let data = [];
			attendees.forEach(function (attendee, index) {
				let user = attendee.user;
				if (user !== null) {

					let username = user.username;
					let user_pic = user.image;

					data.push({
						user_picture: user_pic,
						userId: attendee.userId,
						user_name: username,
						attend_mark_time: attendee.attend_mark_time ? moment(attendee.attend_mark_time).format('DD/MM/YYYY HH:mm') : '',
						ticket_purchase: attendee.ticket_purchase,
						ticket_checkin: attendee.ticket_checkin,
						checkin_time: attendee.checkin_time ? moment(attendee.checkin_time).format('DD/MM/YYYY HH:mm') : '',
						location_ver: attendee.location_ver,
						location_ver_time: attendee.location_ver_time ? moment(attendee.location_ver_time).format('DD/MM/YYYY HH:mm') : ''
					});
				}
			});
			let temp = {data: data};
			res.json(temp);
		})
		.catch(function (err) {
			next(err)
		});
});


module.exports = router;

