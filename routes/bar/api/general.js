let express = require('express');
let Promise = require('bluebird');


let config = require('config');
let fs = require('fs');
let default_image_user = config.get('images:default_image_user');


let Bar = require('models/Bar');
let User = require('models/User');

let router = express.Router();


router.get('/bar/:id/managers', function (req, res, next) {

	Promise.props({
		managers: Bar.findOne({'id': req.params.id}).select('managers').execAsync()
	}).then(function (results) {

		let permissionLevelHashArray = [];
		let userIdArray = [];

		results.managers.managers.forEach(managerId => {
			permissionLevelHashArray[managerId.userId] = managerId.permission_level || 0;
			userIdArray.push(managerId.userId);
		});


		User.find({
			id: {$in: userIdArray}
		}).exec().then((results) => {
			let users = [];

			results.forEach((user) => {


				users.push({
					profile_picture_circle: user.image_circle,
					id: user.id,
					username: user.username,
					permission_level: permissionLevelHashArray[user.id]
				});

			});
			res.status(200).send({data: users});
		});

	})
		.catch(function (err) {
			next(err);
		});
});

router.post('/bar/manager/add', function (req, res, next) {
	let body = req.body;

	Promise.props({
		bar: Bar.update({
			id: body.lineId,
			"managers.userId": {$nin: [body.id]}
		}, {$addToSet: {"managers": {userId: body.id}},}).execAsync()
	}).then(function (results) {
		res.send(200);
	})
		.catch(function (err) {
			next(err);
		});

});

router.post('/bar/manager/delete', function (req, res, next) {
	let body = req.body;
	Promise.props({
		bar: Bar.update({id: body.barId}, {$pull: {managers: {userId: body.userId}}}).execAsync()
	}).then(function (results) {
		res.sendStatus(200);
	})
		.catch(function (err) {
			next(err);
		});
});

router.post('/bar/manager/update', function (req, res, next) {
	let body = req.body;
	Promise.props({
		bar: Bar.findOneAndUpdate({
			id: body.barId,
			'managers': {$elemMatch: {userId: body.pk}}
		}, {'managers.$.permission_level': body['value']}).execAsync()
	}).then(function (results) {
		res.sendStatus(200);
	})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;