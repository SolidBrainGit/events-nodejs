var express = require('express');
var router = express.Router();
var Line = require('../../models/Line');



router.post('/line/delete/:id', function (req, res, next) {


	Line.findOneAndRemove({ id: req.params.id }, function(err) {
		res.send(200);
		if (err)
			next(err);
	});
});

module.exports = router;
