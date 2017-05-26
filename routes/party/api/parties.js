let express = require('express');
let router = express.Router();
let Promise = require('bluebird');
let moment = require('moment');

let Party = require('models/Party');
let Line = require('models/line');

router.all('/parties', function (req, res, next) {

	let search = req.query.search ? req.query.search : {};
	let addresses = req.query.address;

	let cities = [];

	if (addresses && addresses.length > 0) {
		cities = addresses.map((address) => {
			return JSON.parse(address).city;
		});
	}

	let filter = [];

	if (cities.length > 0) {
		filter.push(
			{
				'location.city': {$in: cities}
			}
		);
	}

	if (filter.length === 0) {
		filter.push({});
	}

	Promise.props({
		parties: Party.find({$and: filter}, null, {sort: {date: -1}}).execAsync(),
		lines: Line.find().select('id line_name_eng').execAsync()
	})
		.then(function (results) {
			let data = [];
			let lines = results.lines;
			let lines_data = {0: ''};

			lines.forEach(function (line_item, index) {
				lines_data[line_item.id] = line_item.line_name_eng;
			});

			results.parties.forEach(function (party) {
				let lineId = party.lineId || 0;
				let line_name_eng = lines_data[lineId];

				data.push({
					party_id: party.id,
					line_name_eng: line_name_eng,
					title_eng: party.title_eng,
					country_name_eng: party.location.country,
					city_name_eng: party.location.city,
					event_name_eng: "test prnt event",
					date: moment(party.date).format('DD/MM/YYYY'),
					open_time: moment(party.date).format('HH:mm'),
					attendees_count: party.attendees.length,
					video_stream_avb: false,
					tkts_avbl_here: false
				});

			});
			let temp = {data: data};
			res.json(temp);
		})
		.catch(function (err) {
			next(err)
		});
});

module.exports = router;
