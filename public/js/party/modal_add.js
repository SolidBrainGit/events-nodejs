/**
 * Created by tegos on 16.05.2017.
 */

$(document).ready(function () {

	$('#party_datetime_input').datetimepicker({
		format: 'yyyy-mm-dd hh:ii',
		autoclose: true,
		useCurrent: false,
		setDate: Date.now()
	});

	$('#modal_add_party, [id^=line_][id$=_add_party]').on('shown.bs.modal', function () {
		initGeoAddParty();
	});


});


window.initGeoAddParty = function () {


	let geocomplete_line_add = $('#geocomplete_party_add').geocomplete({
		details: '.geo-data',
		//types: ['(cities)']

	}).on('geocode:result', function (e, result) {
		let geo_data = $('.geo-data');
		let data = {
			lat: $('#lat').val(),
			lng: $('#lng').val(),
			locality: $('#locality').val(),
			country: $('#country').val(),
			country_short: $('#country_short').val(),
			route: $('#route').val(),
			street_number: $('#street_number').val(),
		};

	});
};