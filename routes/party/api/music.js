let express = require('express');
let router = express.Router();
let Promise = require('bluebird');
let moment = require('moment');

let Party = require('models/Party');
let User = require('models/user');

router.get('/party/:id/music/stages', function (req, res, next) {

	Promise.props({
		parties: Party.findOne({id: req.params.id}).select('stage').execAsync()
	})
		.then(function (results) {
			let data = [];
			results.parties.stage.forEach((stage) => {
				data.push({
					_id: stage._id,
					stage_name: stage.stage_name ? stage.stage_name : ''
				});
			});

			res.json(data);
		})
		.catch(function (err) {
			next(err)
		});
});

router.post('/party/music/stage/update', function (req, res, next) {

	let body = req.body;
	Promise.props({
		party: Party.update({'stage': {$elemMatch: {_id: body.pk}}}, {'$set': {['stage.$.' + body.name]: body['value'],}}).execAsync()
	}).then(function (results) {
		res.status(200).send(body['value']);
	})
		.catch(function (err) {
			next(err);
		});
});

router.post('/party/music/stage/add', function (req, res, next) {

	let body = req.body;

	Promise.props({
		party: Party.findOneAndUpdate({id: body.partyId}, {$push: {'stage': {}}}).execAsync()
	}).then(function (results) {

		Party.findOne({id: body.partyId}).select('stage')
			.then(function (doc) {
				res.status(200).send({
					stage_name: '',
					_id: doc.stage[doc.stage.length - 1]._id
				});
			})
			.catch(function (err) {
				next(err);
			});

	})
		.catch(function (err) {
			next(err);
		});


});

router.post('/party/music/stage/delete', function (req, res, next) {

	let body = req.body;

	Promise.props({
		party: Party.update({'stage': {$elemMatch: {_id: body._id}}}, {$pull: {stage: {_id: body._id}}}).execAsync()
	}).then(function (results) {
		console.warn('asdasdasdasdas');
		res.status(200).send('OK');
	})
		.catch(function (err) {
			next(err);
		});

});

router.get('/party/music/stage/:id/djs', function (req, res, next) {

	Promise.props({
		stage: Party.find({'stage': {$elemMatch: {_id: req.params.id}}}).select('stage').execAsync()
	}).then(function (results) {

		let array = [];

		if (Array.isArray(results.stage.djs)) {
			results.stage.djs.forEach((dj) => {
				array.push(dj.userId);
			});
		}

		User.find({
			id: {$in: array}
		})
			.select(['id', 'username', 'profile_picture_circle', 'realname', 'username'])
			.exec(function (err, users) {

				console.warn(users);

				res.json({data: users});
			});


	})
		.catch(function (err) {
			next(err);
		});
});

router.post('/party/music/stage/djs/add', function (req, res, next) {

	//TODO fix: add only one user
	let body = req.body;

	console.warn(body);

	Promise.props({
		line: Party.findOneAndUpdate( {'stage._id' : body.stageId, "stage.djs.userId": { $nin: [ body.id ] } }, { $push : { "stage.0.djs" : { userId: body.id} },  }).execAsync()
	}).then(function (results) {
		console.warn(results);
		res.send(200);
	})
		.catch(function (err) {
			next(err);
		});

});


module.exports = router;