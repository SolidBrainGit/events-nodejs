let event_pricing_table;
let isEventPricingInit = false;

$(document).ready(function () {

	$('#pricing_tab_btn').on('click', function () {
		if (!isEventPricingInit) {
			initPricingTable();
			isEventPricingInit = true;
		}
	});


	$('body').on('mousedown mouseup', "#event_pricing .row_datetime", function () {
		$(this).datetimepicker({
			format: 'mm/dd/yyyy hh:ii',
			autoclose: true,
			useCurrent: false

		});
		$(this).removeClass('row_datetime');
	}).on('change', '#event_pricing .date, select.price_currency', function () {
		sendUpdateAJAX.call(this)
	})
		.on('blur', '.identity_flag', function () {
			sendUpdateAJAX.call(this)
		})
		.on('click', '.flag_delete_btn', function () {
			sendDeleteAjax.call(this);
			event_pricing_table.ajax.reload();
		});

	$('#event_add_price').click(() => {

		$.ajax({
			url: '/api/event/prices/add',
			type: 'POST',
			data: {eventId: event.id},
			success: function (data) {
				event_pricing_table.row.add({
					id: data
				}).draw();
			},
			error: function (jqXHR, textStatus, err) {
			}
		}).then(function () {
		});
	});
});

let sendUpdateAJAX = function () {

	let myInput = $(this).prop("tagName") == 'SELECT' ? $(this) : $(this).children('input');
	let priceId = myInput.data('id');
	let name = myInput.attr('name');
	let value = myInput.val();
	$.ajax({
		url: '/api/event/prices/update',
		type: 'POST',
		data: {priceId: priceId, name: name, value: value},
		success: function (data) {
		},
		error: function (jqXHR, textStatus, err) {
		}
	}).then(function () {
	});

};

let sendDeleteAjax = function () {

	let priceId = $(this).data('id');
	$.ajax({
		url: '/api/event/prices/delete',
		type: 'POST',
		data: {priceId: priceId},
		success: function (data) {
			event_pricing_table.ajax.reload();

		},
		error: function (jqXHR, textStatus, err) {
		}
	}).then(function () {
	});

};

let initPricingTable = function () {
	event_pricing_table = $('#event_pricing').DataTable({

		"ajax": '/api/event/' + event.id + '/prices',
		"columns": [

			{
				data: 'delete_button',
				render: function (data, type, full, meta) {
					return `<div data-id="${full.id != undefined ? full.id : ''}" class="text-center remove_column flag_delete_btn"><a class="btn-circle"><i class="fa fa-remove"></i></a></div>`;
				},
				width: '5%'
			},
			{
				data: 'start_date',
				render: function (data, type, full, meta) {
					return `
										<div class="input-group date row_datetime">
											<input data-id="${full.id != undefined ? full.id : ''}"  readonly value="${data != undefined ? data : ''}" name="start_date" class="form-control" type="text" style="width: 100%"
												   data-date-format="yyyy/mm/dd hh:ii">
											<span class="input-group-addon"><i class="fa fa-times"></i></span>
											<span class="input-group-addon"><i class="fa fa-calendar"></i></span>
										</div>
				`;
				},
				width: '20%'
			},
			{
				data: 'end_date',
				render: function (data, type, full, meta) {
					return `
										<div  class="input-group date row_datetime">
											<input data-id="${full.id != undefined ? full.id : ''}" readonly value="${data != undefined ? data : ''}" name="end_date" class="form-control" type="text" style="width: 100%"
												   data-date-format="yyyy/mm/dd hh:ii">
											<span class="input-group-addon"><i class="fa fa-times"></i></span>
											<span class="input-group-addon"><i class="fa fa-calendar"></i></span>
										</div>
				`;
				},
				width: '20%'
			},
			{
				data: 'price',
				render: function (data, type, full, meta) {
					return `
								<div class="identity_flag">
									<input data-id="${full.id != undefined ? full.id : ''}" value="${data != undefined ? data : ''}"  name="price" class="form-control" type="text" style="width: 100%">			
								</div>
							`;
				},
				width: '20%'
			},
			{
				data: 'currency',
				render: function (data, type, full, meta) {
					let currencyArray = ['USD', 'EUR', 'UAH', 'RUB', 'ILS'];
					let tmpCurrencyArray = [];

					currencyArray.forEach((currency) => {
						let tmpCurrency;
						if (data == currency) {
							tmpCurrency = '<option selected value="' + currency + '">' + currency + '</option>';
						}
						else {
							tmpCurrency = '<option value="' + currency + '">' + currency + '</option>';
						}
						tmpCurrencyArray.push(tmpCurrency);

					});
					return `
						<select data-id="${full.id != undefined ? full.id : ''}" name="currency" class="bs-select form-control price_currency">
								${tmpCurrencyArray.join("")}                             
						</select>
					`;
				},
				width: '25%'
			}
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