let stageCount = 0;
let usersSet;
let isMusicInit = false;
let selectedResults;
let djs_title_length = 10;
let partyGenres = ["Rock", "Pop", "Hip-Hop", "Rap", "Jazz", "Metal"];

$(document).ready(function () {

	usersSet = initUsersDataSet();

	$('#music_tab_btn').on('click', function () {
		if (!isMusicInit) {
			initStages();
			isMusicInit = true;
		}
	});


	$('#party_add_stage').on('click', () => {
		collapseAllStageTab();
		generateStageTab();
	});


	$('body').on('click', '.collapse_accordion', function (e) {
		if ($(e.target).prop("tagName") == 'DIV') {
			collapseAnimatedStageTab.call(this);
		}
	}).on('click', '.delete_stage_btn_flag', function () {
		deleteStage.apply(this);
	}).on('click', '.add_dj_btn_flag', function () {
		addDjs.apply(this);
	}).on('click', '.init_table_flag', function () {
		fixTableLayout.apply(this);
		$(this).removeClass('init_table_flag')
	}).on('change', 'select[name="genres"]', function () {
		updateStageGenres($(this).closest('.tab_flag').attr('id'));
	}).on('click', '.add_genres_btn_flag', function () {
		let stage = $(this).closest('.tab_flag');
		stage.find('.select_container').append(generateDefaultSelect(stage.attr('id')));
		updateStageGenres(stage.attr('id'));
	}).on('click', '.remove_djs_btn_flag', function (event) {
		deleteDjs.apply(this);
	}).on('click', '.remove_genres_btn_flag', function () {
		deleteGenre($(this).closest('.tab_flag').attr('id'));
	});
});

let collapseAllStageTab = function () {
	$('#music_accordion_container div.panel-collapse').slideUp(300);
};

let collapseAnimatedStageTab = function () {
	$(this).closest('div.panel-group.accordion').find('.panel-collapse').not($(this).siblings('.panel-collapse')).slideUp(300);
	$(this).siblings('.panel-collapse').slideToggle(300);
};

let fixTableLayout = function () {
	let parent = $(this).closest('.tab_flag');
	let table = parent.find('table').DataTable().columns.adjust().draw();
};

let deleteGenre = function (stageId) {

	let parent = $('#' + stageId);
	if (parent.find('select[name="genres"]').length <= 0)
		return null;

	parent.find('select[name="genres"]').last().remove();
	updateStageGenres(stageId);
};

let deleteDjs = function () {

	let stage = $(this).closest('.tab_flag');
	let parent = this.parentElement;
	let table = $(stage.find('table')[1]);
	let tableInstance = $('#' + table.attr('id')).DataTable();

	bootbox.confirm({
		size: "small",
		message: "Are you sure you want to remove this user from djs?",
		callback: function (result) {
			if (result) {
				let data = {
					partyId: party.id,
					userId: tableInstance.row(parent).data().id,
					stageId: stage.attr('id')
				};
				$.ajax({
					url: '/api/party/music/stage/djs/delete',
					type: 'POST',
					data: data,
					//TODO fix this KOSTYL
					success: function () {
						updateTable(table.attr('id'));
					},
					error: function () {
						updateTable(table.attr('id'));
					}
				});
			}
		}
	});
};

let updateStageGenres = function (stageId) {

	let genresArray = [];
	let selectedItems = $('#' + stageId).find('select[name="genres"]');

	selectedItems.each(function () {
		genresArray.push($(this).val());
	});

	$.ajax({
		url: '/api/party/music/stage/update',
		type: 'POST',
		data: {pk: stageId, name: 'music_genres', value: genresArray},
		success: function (data) {
		},
		error: function (jqXHR, textStatus, err) {
		}
	});
};

let generateDefaultSelect = function (stageId) {
	if (stageId && $("#" + stageId).find('select').length > 4)
		return null;

	let tmpGenres = [];
	let selectItem = $('<select></select>').addClass('form-control').attr('name', 'genres');
	partyGenres.forEach((item) => tmpGenres.push('<option value="' + item + '">' + item + '</option>'));
	return selectItem.html(tmpGenres.join(""));


};

let generateStageTab = function () {

	$.ajax({
		url: '/api//party/music/stage/add',
		type: 'POST',
		data: {partyId: party.id},
		success: function (item) {
			let stageTemplate = getStageTabTemplate(stageCount, item, false);
			$('#music_accordion_container').append(stageTemplate);
			setStageNameEditable(stageCount);
			setStageTable('party_stage_' + stageCount + '_djs', item._id);
			setTypeahead('party_stage_' + stageCount + '_djs_search');
			stageCount += 1;

		}
	});


};

let setStageNameEditable = function (counter) {

	$('#party_stage_' + counter + '_name').editable({
		url: '/api/party/music/stage/update',
		type: 'text',
		title: 'Enter title',
	});
};

let setStageTable = function (stage_table_id, _id) {

	let tmpTable = $('#' + stage_table_id).DataTable({

		"ajax": "/api/party/music/stage/" + _id + "/djs",

		"columns": [
			{
				data: 'delete_button',
				render: function (data, type, full, meta) {
					return `<div data-id="${full.id}" class="text-center remove_djs_btn_flag"><a class="btn-circle"><i class="fa fa-remove"></i></a></div>`;
				},
				width: '5%'
			},
			{
				data: 'profile_picture_circle',
				render: function (data, type, full, meta) {
					return '<div class="text-center"><img class="profile-picture" src="' + data + '"/></div>';
				},
				width: '20%'
			},
			{
				"data": 'id',
				width: '15%'
			},
			{
				"data": 'username',
				render: function (data, type, full, meta) {
					let text = data.length > djs_title_length ? data.substr(0, djs_title_length) + '...' : data;
					return '<span title="' + data + '">' + text + '</span>'
				},
				width: '20%'
			},
			{
				"data": 'name',
				render: function (data, type, full, meta) {
					let text = data.length > djs_title_length ? data.substr(0, djs_title_length) + '...' : data;
					return '<span title="' + data + '">' + text + '</span>'
				},
				width: '20%'
			},
			{
				"data": 'soundcloud',
				render: function (data, type, full, meta) {
					let text = data.length > djs_title_length ? data.substr(0, djs_title_length) + '...' : data;
					return `<div class="text-center"><a title="${data}" href="#">${text}</a></div>`;
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

	$('#' + stage_table_id).on('click', 'td', function (event) {
		if ($(event.target).prop("tagName") != "I") {
			window.location = '/users/' + tmpTable.row(this).data().id;
		}
	});

};

let initStages = function () {

	$.ajax({
		url: '/api/party/' + party.id + '/music/stages',
		type: 'GET',
		success: function (data) {
			data.forEach((item) => {
				let stageTemplate = getStageTabTemplate(stageCount, item);
				$('#music_accordion_container').append(stageTemplate);
				setStageNameEditable(stageCount);
				setTypeahead('party_stage_' + stageCount + '_djs_search');
				setStageTable('party_stage_' + stageCount + '_djs', item._id);
				stageCount += 1;

			});
		}
	});

};

let deleteStage = function () {
	let stageItemId = $(this).data('id');
	bootbox.confirm({
		size: "small",
		message: "Are you sure you want to remove this stage?",
		callback: function (result) {
			if (result) {
				$.ajax({
					url: '/api/party/music/stage/delete',
					type: 'POST',
					data: {_id: stageItemId},
					success: function (data) {
						$('#' + stageItemId).remove();
					},
				});
			}
		}
	});


};

let initUsersDataSet = function () {

	//user dataset for search
	return new Bloodhound({
		datumTokenizer: function (datum) {
			let idTokens = Bloodhound.tokenizers.whitespace(datum.id);
			let lastNameTokens = Bloodhound.tokenizers.whitespace(datum.name);
			let firstNameTokens = Bloodhound.tokenizers.whitespace(datum.username);

			return idTokens.concat(lastNameTokens).concat(firstNameTokens);
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
};

let setTypeahead = function (inputId) {

	$('#' + inputId).typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			display: 'name',
			source: usersSet,
			templates: {
				suggestion: function (item) {
					return '<div class="col-md-12">' +
						'<div class="col-md-4" style="float:left;"><img style="width:50px;height:50px;border-radius: 50%;" src="' + item.picture + '"/></div>' +
						'<div> ID:(' + item.id + ') <strong>' + item.name + '</strong>' + '</div>' +
						'</div>';
				}
			}
		}).bind('typeahead:select', (ev, suggestion) => selectedResults = suggestion);
};

let addDjs = function () {

	let parent = $(this).closest('.tab_flag');
	selectedResults.stageId = parent.attr('id');
	let table = parent.find('table')[1];
	let input = parent.find('input[name=djs_search]');

	$.ajax({
		url: '/api/party/music/stage/djs/add',
		type: 'POST',
		data: selectedResults,
		success: function (data) {
			updateTable($(table).attr('id'));
		},
		error: function (jqXHR, textStatus, err) {
		}
	}).then(function () {
	});
	input.val('');
	selectedResults = {};

};

let updateTable = function (tableId) {
	let table = $('#' + tableId).DataTable();
	table.clear().draw();
	setTimeout(function () {
		table.ajax.reload();
		table.columns.adjust().draw();
	}, 1000);
};

let generateSelectTemplate = function (genresArray) {
	let selectTemplate = $('<div></div>');

	if (genresArray.music_genres && genresArray.music_genres.length > 0) {
		genresArray.music_genres.forEach((selectedGenre) => {
			let select = $('<select name="genres" value="' + selectedGenre + '" class="form-control"></select>');
			partyGenres.forEach((genre) => {
				let optionGenre = $('<option value="' + genre + '">' + genre + '</option>');
				if (genre == selectedGenre)
					optionGenre.attr('selected', true);
				select.append(optionGenre);
			});
			selectTemplate.append(select);
		});
	}
	else {
		//selectTemplate.append(generateDefaultSelect());
	}
	return selectTemplate.html();

};

let getStageTabTemplate = function (counter, tabItem, isCollapsed = true) {

	let musicTemplate = `
									<div class="col-md-6">
					                
					                	 <div class="border-line">
					                        <div class="portlet-title">
					                            <div class="title-block caption font-red">
					                                <i class="fa fa-user" aria-hidden="true"></i>
					                                <span class="caption-subject bold">Music</span>
					                            </div>
					                        </div>
					
					                        <div class="portlet-body table-both-scroll">
												<div class="row offset-top-xs-2">
												<div class="col-xs-12">
													<div class="block-music form-group form-md-line-input has-info wrapper-line border-line">
													
														<div class="col-md-5 select_container">
															${generateSelectTemplate(tabItem)}
														</div>
														
														<div class="col-md-1">
															<button type="button"
																	class="btn btn-circle btn-icon-only green add_genres_btn_flag">
																<i class="fa fa-plus"></i>
															</button>
															<button type="button"
															        class="btn btn-circle btn-icon-only red remove_genres_btn_flag">
																<i class="fa fa-remove"></i>
															</button>
														</div>
													</div>
												</div>
											</div>
					                        </div>
					                    </div>
					                
									</div>
	
	`;

	return $(`
					<div id="${tabItem._id}" class="panel panel-default tab_flag">

					    <div class="panel-heading collapse_accordion init_table_flag">
					    
					        <a id="party_stage_${counter}_name" class="editable editable-click" data-name="stage_name"
					           href="#" 
					           style="margin:10px;display: inline-block" data-type="text" data-pk="${tabItem._id}" data-counter="${counter}"
					           data-parent="#music_accordion_container">${tabItem.stage_name ? tabItem.stage_name : 'Stage ' + ($('#music_accordion_container').find('.tab_flag').length + 1) }</a>
					       
					        <button id="enable_stage_${counter}_delete" data-id="${tabItem._id}" class="delete_stage_btn_flag" type="button">
					            <i class="fa fa-trash-o"></i>
					        </button>
					        
					    </div>
					    
					
					    <div id="stage_${counter}_body" class="panel-collapse ${isCollapsed ? 'collapse' : ''}">
					
					        <div class="accordion-content">
					
					            <div class="row">
					
					                <div class="col-md-6">
					
					                    <div class="border-line">
					                        <div class="portlet-title">
					                            <div class="title-block caption font-red">
					                                <i class="fa fa-user" aria-hidden="true"></i>
					                                <span class="caption-subject bold">DJs</span>
					                            </div>
					                        </div>
					
					                        <div class="portlet-body table-both-scroll">
					                            <table class="table table-striped table-bordered table-hover order-column"
					                                   id="party_stage_${counter}_djs">
					                                <thead>
					                                <th class="no-sort"></th>
					                                <th>Pic</th>
					                                <th>User ID</th>
					                                <th>User Name</th>
					                                <th>Name</th>
					                                <th>Soundcloud</th>
					                                </thead>
					                            </table>
					
					                            <div class="input-add">
					                                <div class="input-group">
														<span class="input-group-addon">
															<i class="fa fa-search" aria-hidden="true"></i>
														</span>
							                                    <input type="text" id="party_stage_${counter}_djs_search" placeholder="DJs name"
							                                           name="djs_search" class="form-control"/>
							                                           
							                            <span class="input-group-addon btn-manager_user">
															<button id="party_stage_${counter}_djs_add"
                                                                    type="button"
                                                                    class="btn btn-icon-only green pull-right add_dj_btn_flag">
																<i class="fa fa-plus"></i>
															</button>
														</span>
														
					                                </div>
					                                <div class="col-md-2">
					
					                                </div>
					                            </div>
					
					                        </div>
					                    </div>
					                    				                 			                    
					
					                </div>
					                
					                ${musicTemplate}
					
					            </div>
					
					        </div>
					
					    </div>

					</div>
			`);
};
