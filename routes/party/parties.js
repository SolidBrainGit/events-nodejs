let express = require('express');
let Promise = require('bluebird');


let Party = require('models/Party');

let router = express.Router();

router.get('/parties', function (request, response, next) {

	Promise.props({
		addresses: Party.find({}, 'location').execAsync(),
		partyTotalCount: Party.count().execAsync(),
		partyCountToday: Party.countByDate(),
		partyCountPast: Party.countByDate('lt'),
		partyCountFuture: Party.countByDate('gt')
	}).then(function (results) {

		let addresses = [];
		results.addresses.forEach(function (party) {
			if (party.location.city && party.location.country)
				addresses.push({country: party.location.country, city: party.location.city});
		});

		let map = [];
		let uniqueCountry = new Set(addresses.map(address => address.country));
		let uniqueCountryArray = Array.from(uniqueCountry).sort(alphabetSort);

		for (let country of uniqueCountryArray)
			map.push({
				country: country,
				cities: [...new Set(addresses.filter((address) => address.country == country).map((address) => address.city))]
			});

		let data = {
			title: "Parties",
			showMenu: true,
			partyTotalCount: results.partyTotalCount,
			partyCountToday: results.partyCountToday,
			partyCountPast: results.partyCountPast,
			partyCountFuture: results.partyCountFuture,
			addresses: map
		};

		response.render('pages/party/partiesList', data);
	}).catch(function (err) {
		next(err);
	});

});


let alphabetSort = (firstStr,secondStr) => {
	if (firstStr > secondStr)
		return 1;
	if (firstStr <secondStr)
		return -1;
	return 0;
};

module.exports = router;