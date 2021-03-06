/**
 * Created by Nazarii Beseniuk on 5/17/2017.
 */

let SelectedManager = {};
$(document).ready(function () {

	let start_date_div = $('#start_date_div').datetimepicker({
		format: 'dd/mm/yyyy',
		autoclose: true,
		minView: 2,
		useCurrent: true,
	}).on('changeDate', function (ev) {
		let date = {name: 'start_date', value: ev.date, pk: 1};
		$.ajax({
			url: '/event/update/' + event.id,
			type: 'POST',
			dataType: 'json',
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(date)
		});
	});

	let end_date_div = $('#end_date_div').datetimepicker({
		format: 'dd/mm/yyyy',
		autoclose: true,
		useCurrent: true,
		minView: 2,
	}).on('changeDate', function (ev) {
		let date = {name: 'end_date', value: ev.date, pk: 1};
		$.ajax({
			url: '/event/update/' + event.id,
			type: 'POST',
			dataType: 'json',
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(date)
		});
	});

	jQuery(document).ready(function () {
		FormEditable.init();
		initEventManagerTable();
	});

	let loc = window.location.pathname.split('/');
	let id = loc[loc.length - 1];

	//inline edit
	let FormEditable = function () {

		let initEditables = function () {

			//global settings
			$.fn.editable.defaults.inputclass = 'form-control';
			$.fn.editable.defaults.url = '/event/update/' + event.id;
			$.fn.editable.defaults.mode = 'inline';

			$('#title_eng').editable({
				type: 'text',
				pk: 1,
				name: 'title_eng',
				title: 'Enter title',
				success: function (data) {
					$('#english_title').text(data);
				},
				validate: xeditable.validators.notEmpty
			});
			$('#title_ol').editable({
				type: 'text',
				pk: 1,
				name: 'title_ol',
				title: 'Enter title',
				success: function (data) {
					$('#ol_title').text(data);
				},
				validate: xeditable.validators.notEmpty
			});


			$('.lineId').editable({
				pk: 1,
				placeholder: 'Select line',
				url: '/event/update/line/' + event.id,
				name: 'lineId',
				select2: {
					ajax: {
						url: '/api/getAllLines',
						dataType: 'json',
						delay: 250,
						processResults: function (data, params) {
							return {
								results: data
							};
						},
						cache: true
					},
					escapeMarkup: function (markup) {
						return markup;
					},
				},
				tpl: '<select style="width:200px;">',
				type: 'select2',
				display: function (value, sourceData) {


					let line;
					let title = '';
					if (sourceData && sourceData !== null) {
						line = sourceData.line || 0;
						title = (currentLanguage == 'English') ? line.line_name_eng : line.line_name_ol;

					} else {
						title = '';
					}
					if (!title) {
						title = '';
					}

					if (value === '-1') {
						$('.open_link_line').hide();
					} else {
						$('.open_link_line').show();
					}

					if (title.length > 0) {
						//$(this).text(line.id);

						$('#line_title_english').text(line.line_name_eng);
						$('#line_title_original').text(line.line_name_ol);
					}

				}
			})
				.click(function (e) {
					if (e) e.preventDefault();
				});

			$('.eventId').editable({
				pk: 1,
				placeholder: 'Select event',
				url: '/event/update/event/' + event.id,
				name: 'eventId',
				select2: {
					ajax: {
						url: '/api/events/getAll',
						dataType: 'json',
						delay: 250,
						processResults: function (data, params) {
							return {
								results: data
							};
						},
						cache: true
					},
					escapeMarkup: function (markup) {
						return markup;
					},
				},
				tpl: '<select style="width:200px;">',
				type: 'select2',
				display: function (value, sourceData) {

					let event;
					let title;
					if (sourceData) {
						event = sourceData.event || 0;
						title = (currentLanguage == 'English') ? event.title_eng : event.title_ol;

					} else {
						title = '';
					}

					if (event) {
						$('#event_title_english').text(event.title_eng);
						$('#event_title_original').text(event.title_ol);

					}
				}
			})
				.click(function (e) {
					if (e) e.preventDefault();
				});


			$('#facebook_page').editable({
				type: 'text',
				pk: 1,
				name: 'facebook_page',
				title: 'Enter Facebook page link'
			});
			$('#description_eng').editable({
				type: 'text',
				pk: 1,
				name: 'description_eng',
				title: 'Enter description'
			});
			$('#description_ol').editable({
				type: 'text',
				pk: 1,
				name: 'description_ol',
				title: 'Enter description'
			});

			$('#remarks').editable({
				type: 'text',
				pk: 1,
				name: 'remarks',
				title: 'Enter remarks'
			});

			$('#age_range_min').editable({
				pk: 1,
				name: 'age_range.min',
				title: 'Enter age range min',
				validate: xeditable.validators.minMaxRange
			});

			$('#age_range_max').editable({
				pk: 1,
				name: 'age_range.max',
				title: 'Enter age range max',
				validate: xeditable.validators.minMaxRange
			});
		};
		return {
			//main function to initiate the module
			init: function () {
				// init editable elements

				initEditables();

				// init editable toggler
				$('#enable').click(function () {
					$('#user .editable').editable('toggleDisabled');
				});

				// handle editable elements on hidden event fired
				$('#user .editable').on('hidden', function (e, reason) {
					if (reason === 'save' || reason === 'nochange') {
						let $next = $(this).closest('tr').next().find('.editable');
						if ($('#autoopen').is(':checked')) {
							setTimeout(function () {
								$next.editable('show');
							}, 300);
						} else {
							$next.focus();
						}
					}
				});
			}
		};
	}();

	$('#button-open-upload').click(function () {
		$('#upload-picture-modal').modal('show');
	});

	let $uploadCrop;
	$uploadCrop = $('#upload-cover-picture').croppie({
		viewport: {
			width: 555,
			height: 300,
		},
		boundary: {
			width: 555,
			height: 300
		}
	});

	$('#form-line-pic').on('change', function () {
		readFile(this);
	});

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

	$('#button-upload-picture').on('click', function () {
		$uploadCrop.croppie('result', 'base64').then(function (base64) {
			$('#coverpic').attr("src", base64);
			setCoverPicture();
		});
	});

	function setCoverPicture() {
		let formData = new FormData($('#form_change_picture')[0]);
		let progress_bar_j = $('#upload-picture-modal').find('.progress-bar');

		$uploadCrop.croppie('result', {
			type: 'blob',
			size: 'viewport'
		}).then(function (blob) {
			formData.append('cover_picture', blob, 'coverpic.png');
			$.ajax({
				xhr: function () {
					let xhr = new window.XMLHttpRequest();
					xhr.upload.addEventListener("progress", function (evt) {
						if (evt.lengthComputable) {
							let percentComplete = evt.loaded / evt.total;
							progress_bar_j.css({
								width: percentComplete * 100 + '%'
							});
							if (percentComplete === 1) {
								progress_bar_j.parent('.progress').addClass('hide');
							}
						}
					}, false);
					xhr.addEventListener("progress", function (evt) {
						if (evt.lengthComputable) {
							let percentComplete = evt.loaded / evt.total;
							progress_bar_j.css({
								width: percentComplete * 100 + '%'
							});
						}
					}, false);
					return xhr;
				},
				beforeSend: function () {
					progress_bar_j.parent('.progress').removeClass('hide');
					progress_bar_j.css({
						width: 0 + '%'
					});
				},
				url: '/event/update/' + event.id,
				type: 'POST',
				cache: false,
				contentType: false,
				processData: false,
				data: formData,
				success: function () {
					setTimeout(function () {
						$('#upload-picture-modal').modal('hide');
					}, 300);
					toastr.success('Saved!');
				},
				error: function (jqXHR, textStatus, err) {
					toastr.error('Server error!');
				}
			});
		});
	}

	$('#active-switch').on('switchChange.bootstrapSwitch', function (e, state) {
		let active = {name: 'active', value: state, pk: 1};
		$.ajax({
			url: '/event/update/' + event.id,
			type: 'POST',
			dataType: 'json',
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(active)
		});
	});


	$('#language_switch').on('switchChange.bootstrapSwitch', function (event, state) {
		if (state) {
			currentLanguage = 'Original';
		} else {
			currentLanguage = 'English';
		}
		$('.language_switch_container').toggle();
	});

	$('#delete_event').click(function (e) {
		e.preventDefault();
		bootbox.confirm({
			size: "small",
			message: "Are you sure you want to remove this event?",
			callback: function (result) {
				if (result) {
					$.ajax({
						url: '/event/delete/' + event.id,
						type: 'POST',
						success: function () {
							window.location = '/events';
						},
						error: function (jqXHR, textStatus, err) {

						}
					});
				}
			}
		});

		return false;
	});


	let event_managers_table;

	let initEventManagerTable = function () {
		event_managers_table = $('#table_event_managers').DataTable({
			"ajax": "/api/event/" + event.id + "/managers",
			"columns": [
				{
					data: 'delete_button',
					render: function (data, type, full, meta) {
						return '<div class="text-center remove_event_manager_column"><a class="btn-circle"><i class="fa fa-remove"></i></a></div>';
					},
					width: '5%'
				},
				{
					'data': 'id',
					width: '10%'
				},
				{
					data: 'profile_picture_circle',
					render: function (data, type, full, meta) {
						return '<div class="text-center"><img class="profile-picture" src="' + data + '"/></div>';
					},
					width: '20%'
				},
				{
					"data": 'username',
					width: '45%'
				},
				{
					"data": 'permission_level',
					render: function (data, type, full, meta) {
						let className = 'permission_level editable';
						if (!data || data.length < 1 || data === 'Empty') {
							className += ' editable-empty';
						}
						return `<a class="` + className + `" data-pk="${full.id}" data-name="permission_level" data-value="` + data + `" data-original-title="Select permission level">` + (data || 'Empty') + `</a>`;
					},
					width: '20%'
				}
			],
			"columnDefs": [
				{
					"targets": 'no-sort',
					"orderable": false
				}
			],
			scrollY: 200,
			scrollX: true,
			scroller: true,
			responsive: false,
			"dom": "<'row' <'col-md-12'> > t <'row'<'col-md-12'>>",
		});
		initPartyManagerTableEditable('table_event_managers')

	};

	let initPartyManagerTableEditable = function (tableId) {
		let table = $('#' + tableId);

		table.editable({
			mode: 'popup',
			name: 'permission_level',
			container: 'body',
			placement: 'right',
			selector: '.permission_level',
			url: '/api/event/manager/update',
			type: 'select',
			source: sourceOfPermissionLevel,
			title: 'Select permission level',
			params: function (params) {
				params.eventId = event.id;
				return params;
			},
		});
	};

	//user dataset for search
	let users = new Bloodhound({
		datumTokenizer: function (datum) {
			let emailTokens = Bloodhound.tokenizers.whitespace(datum.id);
			let lastNameTokens = Bloodhound.tokenizers.whitespace(datum.name);
			let firstNameTokens = Bloodhound.tokenizers.whitespace(datum.username);

			return emailTokens.concat(lastNameTokens).concat(firstNameTokens);
		},
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		prefetch: {
			url: '/api/users/usersname',
			cache: false,
			transform: function (response) {
				return $.map(response, function (item) {
					return {
						id: item.id,
						name: item.name,
						username: item.username,
						picture: item.picture
					};
				});
			}
		}
	});

	//display searched result
	$('#event_managers_search').typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			name: 'users_dataset',
			display: 'name',
			source: users,
			templates: {
				suggestion: function (item) {
					return '<div class="col-md-12">' +
						'<div class="col-md-4" style="float:left;"><img style="width:50px;height:50px;border-radius: 50%;" src="' + item.picture + '"/></div>' +
						'<div> ID:(' + item.id + ') <strong>' + item.name + '</strong>' + '</div>' +
						'</div>';
				}
			}
		}).bind('typeahead:select', (ev, suggestion) => SelectedManager = suggestion);

	$('#add_event_manager').click(() => {
		SelectedManager.lineId = event.id;
		//let data = JSON.stringify(SelectedManager);
		$.ajax({
			url: '/api/event/manager/add',
			type: 'POST',
			data: SelectedManager,
			success: function (data) {
				updateManagersTable();

				bootbox.confirm({
					size: "small",
					message: "Do you want to add this user as manager to all event's parties?",
					callback: function (result) {
						if (result) {
							addUserToEventParties();
						}
					}
				});
			},
			error: function (jqXHR, textStatus, err) {
			}
		});

	});

	function updateManagersTable() {
		event_managers_table.clear().draw();
		setTimeout(function () {
			event_managers_table.ajax.reload();
			event_managers_table.columns.adjust().draw();
		}, 1000);
	}

	let addUserToEventParties = function () {
		let eventId = event.id;
		let userId = SelectedManager.id;
		let data = {eventId, userId};

		$.ajax({
			url: '/api/event/manager/addToParties',
			type: 'POST',
			data: data,
			success: function (data) {
				let count;
				try {
					count = data.update.nModified;
				} catch (e) {
					count = 0;
				}
				let message = '';
				let start_message = 'User added to ';
				let end_message = 'Event does not contain any parties or user already is manager for these event\'s parties';
				if (count > 0) {
					end_message = (count === 1) ? ' event' : ' events';
					message = start_message + count + end_message;
				} else {
					message = end_message;
				}

				bootbox.alert({
					size: 'small',
					message: message
				});
			}
		});

		SelectedManager = {};
		$('#event_managers_search').val('');

	};


	$('#table_event_managers').on('click', '.remove_event_manager_column', function (e) {
		if ($(e.target).prop("tagName") == "I") {
			let parent = this.parentElement;
			bootbox.confirm({
				size: "small",
				message: "Are you sure you want to remove this user from managers?",
				callback: function (result) {
					if (result) {
						let data = JSON.stringify({
							userId: event_managers_table.row(parent).data().id,
							eventId: event.id
						});
						$.ajax({
							url: '/api/event/manager/delete',
							type: 'POST',
							dataType: 'json',
							contentType: "application/json; charset=utf-8",
							data: data,
							success: function () {
								updateManagersTable();
							},
							error: function () {
								updateManagersTable();
							}
						});
					}
				}
			});
		}
	});

	$('#table_event_managers').on('click', 'td', function (event) {
		let propName = $(event.target).prop("tagName");
		if (propName != "I" && propName != "A") {
			window.location = '/users/' + event_managers_table.row(this).data().id;
		}
	});
});