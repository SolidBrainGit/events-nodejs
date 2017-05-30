let Event = require('models/Event');
let config = require('config');
let default_image_line = config.get('images:default_image_line');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Promise = require('bluebird');
let fs = require('fs');


Promise.promisifyAll(mongoose);

router.get('/api/events/getAll', function (req, res, next) {
	let search = req.query.q || '';

	let filter_search = [
		{'title_ol': new RegExp(search, "i")},
		{'title_eng': new RegExp(search, "i")},
		{'description_ol': new RegExp(search, "i")},
		{'description_eng': new RegExp(search, "i")},
		{'location.city': new RegExp(search, "i")},
		{'city.country': new RegExp(search, "i")}
	];

	Promise.props({
		events: Event.find({$or: filter_search}).execAsync()
	})
		.then(function (results) {
			let data = [];


			results.events.forEach(function (event, index) {

				data.push({
					id: event.id,
					text: event.title_eng,
				});
			});

			res.json(data);
		})
		.catch(function (err) {
			next(err)
		});
});

module.exports = router;