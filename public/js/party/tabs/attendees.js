let attendees_table;
let isAttendeesInit = false;


$(document).ready(function () {

	$('#attendees_tab_btn').on('click',function () {
		if(!isAttendeesInit){
			initAttendeesTable();
			isAttendeesInit = true;
		}
	});

});



let initAttendeesTable = function () {

	attendees_table = $('#party_attendees').DataTable({
		"ajax": '/api/party/'+ party.id +'/attendees',
		"columns": [
			{
				'data': 'user_picture',
				render: function (data, type, full, meta) {
					return `<div class="text-center"><img class="profile-picture" src="${data}"/></div>`;
				},
				width: '10%'
			},
			{
				'data': 'userId',
				render: function (data, type, full, meta) {
					return `<div class="text-center">${data}</div>`;
				},
				width: '10%'
			},
			{
				'data': 'user_name',
				render: function (data, type, full, meta) {
					return `<div class="text-center">${data}</div>`;
				},
				width: '10%'
			},
			{
				'data': 'attend_mark_time',
				render: function (data, type, full, meta) {
					return `<div class="text-center">${data}</div>`;
				},
				width: '10%'
			},
			{
				'data': 'ticket_purchase',
				render: function (data, type, full, meta) {
					return `<div class="text-center"><input disabled type="checkbox" ${data == true ? 'checked' : ''} ></div>`;
				},
				width: '10%'
			},
			{
				'data': 'ticket_checkin',
				render: function (data, type, full, meta) {
					return `<div class="text-center"><input disabled type="checkbox" ${data == true ? 'checked' : ''} ></div>`;
				},
				width: '10%'
			},
			{
				'data': 'checkin_time',
				render: function (data, type, full, meta) {
					return `<div class="text-center">${data}</div>`;
				},
				width: '10%'
			},
			{
				'data': 'location_ver',
				render: function (data, type, full, meta) {
					return `<div class="text-center"><input disabled type="checkbox" ${data == true ? 'checked' : ''} ></div>`;
				},
				width: '10%'
			},
			{
				'data': 'location_ver_time',
				render: function (data, type, full, meta) {
					return `<div class="text-center">${data}</div>`;
				},
				width: '10%'
			},

		],
		"columnDefs": [
			{
				"targets": 'no-sort',
				"orderable": false
			}
		],
		autoWidth: false,
		scrollY: 400,
		scroller: true,


		"dom": "<'row' <'col-md-12'> > t <'row'<'col-md-12'>>",
	});
};