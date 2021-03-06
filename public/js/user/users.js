$(document).ready(function () {
	let user_tables = $('#users-list-datatable').DataTable({

		"ajax": "/api/users/",
		"columns": [
			{
				data: 'id',
				width: 65
			},
			{
				data: 'profile_picture_circle',
				render: function (data, type, full, meta) {
					return '<div class="text-center"><img class="profile-picture" src="' + data + '"/></div>';
				},
				width: 50
			},
			{
				data: 'facebook_profile',
				render: function (data) {
					return data ? '<div class="text-center">' +
						'<a target="_blank" href="' + data + '"><img class="facebook-icon" src="/images/icons/facebook-icon.png"></a>' +
						'</div>' : '<div class="text-center">-</div>'
				},
				width: 15
			},
			{
				data: 'active',
				render: function (data, type, full, meta) {
					let content;
					if (data) {
						content = '<div class="text-center"><span class="badge badge-success">Active</span></div>'
					} else {
						content = '<div class="text-center"><span class="badge badge-danger">Disabled</span></div>';
					}
					return content;
				},
				width: 45
			},
			{
				data: 'username',
			},
			{
				data: "realname",
				render: function (data, type, full, meta) {
					return full.firstname + ' ' + full.lastname;
				}
			},
			{
				data: 'lastActivity',
				render: function (data) {
					return '<div class="text-center activity-date" title="' + $(data).text() + '">' + data + '</div>'
				},
				width: 80
			},
			{
				data: 'bars',
				width: 50
			},
			{
				data: 'events',
				width: 50
			},
			{
				data: 'lines',
				width: 50
			},
		],
		"columnDefs": [
			{
				"targets": 'no-sort',
				"orderable": false
			}
		],

		buttons: [
			{extend: 'print', className: 'buttons_print btn dark btn-outline'},
			{extend: 'pdf', className: 'btn green btn-outline'},
			{extend: 'csv', className: 'btn purple btn-outline '}
		],
		scrollY: 500,
		scroller: true,
		responsive: false,
		scrollX: true,
		autoWidth: false,
		sScrollX: "100%",


		//"dom": "<'row content-header' <'col-md-12' <'pull-left group-btn user-btn-group' B > <'pull-right group-input' <'search pull-right'<'fa fa-search'> f > <'fa fa-refresh update-table-users'> > > > t <'row'<'col-md-12'i>>",
		"dom": "<'row content-header' <'col-md-12'   > > t <'row'<'col-md-12'i>>",
	});

	$('.update-table-users').click(function () {
		updateUserTable();
	});

	// -- CROPPIE --
	let $uploadCrop;

	function readFile(input) {
		if (input.files && input.files[0]) {
			let reader = new FileReader();
			reader.onload = function (e) {
				$uploadCrop.croppie('bind', {
					url: e.target.result
				});
				$('.upload-demo').addClass('ready');
			};
			reader.readAsDataURL(input.files[0]);
		}
	}

	$uploadCrop = $('#upload-demo').croppie({
		viewport: {
			width: 200,
			height: 200,
			type: 'circle'
		},
		boundary: {
			width: 300,
			height: 300
		}
	});

	$('#form-profile-pic').on('change', function () {
		readFile(this);
	});
	// -- CROPPIE --


	function updateUserTable() {
		user_tables.clear().draw();
		setTimeout(function () {
			user_tables.ajax.reload();
			user_tables.columns.adjust().draw();
		}, 1000);
	}

	let form = $('#form_add_user');
	let error = $('.alert-danger', form);
	let success = $('.alert-success', form);

	form.validate({
		errorElement: 'span', //default input error message container
		errorClass: 'help-block help-block-error', // default input error message class
		focusInvalid: false, // do not focus the last invalid input
		ignore: "", // validate all fields including form hidden input
		messages: {},
		rules: {
			username: {
				minlength: 3,
				required: true
			},
			email: {
				required: true,
				email: true
			},

			firstname: {
				required: true,
				minlength: 2
			},
			lastname: {
				required: true,
				minlength: 2
			},

			password: "required",
			'repeat-password': {
				equalTo: "#form-password"
			}
		},

		invalidHandler: function (event, validator) { //display error alert on form submit
			success.hide();
			error.show();
			App.scrollTo(error, -200);
		},

		errorPlacement: function (error, element) {
			if (element.is(':checkbox')) {
				error.insertAfter(element.closest(".md-checkbox-list, .md-checkbox-inline, .checkbox-list, .checkbox-inline"));
			} else if (element.is(':radio')) {
				error.insertAfter(element.closest(".md-radio-list, .md-radio-inline, .radio-list,.radio-inline"));
			} else {
				error.insertAfter(element); // for other inputs, just perform default behavior
			}
		},

		highlight: function (element) { // hightlight error inputs
			$(element)
				.closest('.form-group')
				.addClass('has-error'); // set error class to the control group
		},

		unhighlight: function (element) { // revert the change done by hightlight
			$(element)
				.closest('.form-group')
				.removeClass('has-error'); // set error class to the control group
		},

		success: function (label) {
			label.closest('.form-group').removeClass('has-error'); // set success class to the control group
		},

		submitHandler: function (form) {
			success.show();
			error.hide();
		}
	});


	// submit handler
	form.submit(function (e) {
		e.preventDefault();

		let formData = new FormData(form[0]);

		//set hidden cropped image
		$uploadCrop.croppie('result', {
			type: 'blob',
			size: 'viewport',
			circle: true
		}).then(function (resp) {
			let input = $('#form-profile-pic');
			if (input[0].files && input[0].files[0])
				formData.append('userpic', resp, 'userpic.png');

			if (form.valid()) {

				$.ajax({
					url: '/user/add/',
					type: 'POST',
					cache: false,
					contentType: false,
					processData: false,
					data: formData,
					success: function (data) {
						let status = data.status;
						let message = data.message;

						bootbox.alert({
							title: status ? 'Success' : 'Error',
							message: message,
							callback: function () {
								if (status) {
									$('#form_add_user')[0].reset();
									$('#add-new-user-modal').modal('hide');
									updateUserTable();
								}
							}
						});

					},
					error: function (jqXHR, textStatus, err) {
						bootbox.alert('Server error');
					}
				});
			}
		});
		//return false;
	});

	$('#users-list-datatable tbody').on('click', 'tr', function () {
		window.location.href = "/users/" + user_tables.row(this).data().id;
	});

	// datatables search filter
	$('#filter-users-table').keyup(function () {
		user_tables.search($(this).val()).draw();
	});

	$('#btn-add-new-user').click(function () {
		$('#add-new-user-modal').modal('show');
	});

	$('#user-button .export_table_button').click(function () {
		let _export = $(this).data('export');

		user_tables.buttons('.buttons-' + _export).trigger();
	});


});

