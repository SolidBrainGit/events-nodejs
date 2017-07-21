let express = require('express');
let Promise = require('bluebird');
let path = require('path');
let crypto = require('crypto');
let config = require('config');
let multer = require('multer');
let util = require('../../util/index');
let Party = require('models/Party');
let Line = require('models/Line');
let Event = require('models/Event');

let router = express.Router();


let text = {
	'empty': config.get('text:empty'),
	'not_selected': config.get('text:not_selected'),
};

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, util.getAbsolutePath('parties'))
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

let upload = multer({storage: storage});


router.post('/party/update/:id', upload.any(), function (req, res, next) {

	let body = {};
	let files = req.files;
	let error_message = 'Problem with update values';

	let picture = {};

	if (files) {
		files.forEach(function (file) {
			if (file.fieldname === 'cover-image') {
				picture.original = util.getRelativePath(file.path);
			}
			if (file.fieldname === 'cover_picture') {
				picture.circle = util.getRelativePath(file.path);
			}
		});
		Promise.props({
			party: Party.findOne({id: req.params.id}).execAsync()
		}).then(function (results) {
			if (picture.original)
				results.party.cover_picture_original = picture.original;
			if (picture.circle)
				results.party.cover_picture = picture.circle;

			results.party.save();
		});
	}
	else {
		body = req.body;
	}


	let val;
	if (body['value'])
		val = body['value'];
	else
		val = body['value[]'];



	Promise.props({
		party: Party.update({id: req.params.id}, {[body.name]: val}).execAsync()
	}).then(function (results) {
		res.status(200).send(body['value']);
	})
		.catch(function (err) {
			res.status(500);
			res.send(error_message);
			//res.send(err.message);
		});
});

// save address
router.post('/party/update/address/:id', function (req, res, next) {

	let body = req.body;
	let result = {status: true};

	let location = {
		club_name: '',
		country: body.country,
		city: body.locality,
		address: '',
		longitude: {
			lat: body.lat,
			lng: body.lng
		}
	};

	if (!location.city || !location.country) {
		result.status = false;
		result.msg = 'Please, select correct city or country.';
	}

	if (result.status) {

		Promise.props({
			party: Party.update({id: req.params.id}, {location: location}).execAsync()
		}).then(function () {

			result.status = true;
			result.msg = 'Address saved.';
			res.json(result);
		})
			.catch(function (err) {
				next(err);
			});
	} else {
		res.json(result);
	}
});

// save line id
router.post('/party/update/line/:id', function (req, res, next) {

	let body = req.body;

	let result = {
		line: {
			line_name_eng: text.not_selected,
			line_name_ol: text.not_selected,
		}
	};

	let lineId = body.value || 0;

	if (!isNaN(lineId)) {

		Promise.props({
			party: Party.update({id: req.params.id}, {lineId: lineId}).execAsync(),
			line: Line.findOne({id: lineId}).execAsync()
		}).then(function (result_p) {

			if (result_p.line) {
				result.msg = 'Party updated.';
				result.line = result_p.line;
			}

			res.json(result);
		})
			.catch(function (err) {
				next(err);
			});
	} else {
		res.json(result);
	}
});

// save event id
router.post('/party/update/event/:id', function (req, res, next) {

	let body = req.body;

	let result = {
		event: {
			title_eng: text.not_selected,
			title_ol: text.not_selected,
		}
	};

	let eventId = body.value || 0;

	if (!isNaN(eventId)) {

		Promise.props({
			party: Party.update({id: req.params.id}, {eventId: eventId}).execAsync(),
			event: Event.findOne({id: eventId}).execAsync()
		}).then(function (result_p) {

			if (result_p.event) {
				result.msg = 'Event updated.';
				result.event = result_p.event;
			}

			res.json(result);
		})
			.catch(function (err) {
				next(err);
			});
	} else {
		res.json(result);
	}
});


module.exports = router;