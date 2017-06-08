let mongoose = require('mongoose'),
	Schema = mongoose.Schema;

let autoIncrement = require('mongoose-auto-increment');
let mongoosePaginate = require('mongoose-paginate');
let moment = require('moment');
let util = require('util/index');

let config = require('config');
let default_image_bar = config.get('images:default_image_line');

autoIncrement.initialize(mongoose.connection);

let BarSchema = new Schema({
	id: {type: Number, required: true, index: {unique: true}},
	bar_name_eng: {type: String},
	bar_name_ol: {type: String},
	description_eng: {type: String},
	description_ol: {type: String},
	location: {
		country:{type: String},
		city:{type: String},
		address:{type: String},
		longitude: {
			lat: {type: Number},
			lng: {type: Number}
		}
	},
	facebook_page: {type: String},
	website: {type: String},
	phone_number: {type: String},
	cover_picture: {type: String},
	managers: [ 
		{userId: {type: Number},} 
	],
	attendees: [{
		user: {type: Object},
		userId: {type: Number},
		ticket_purchase: {type: Boolean},
		purchase_priceId: {type: String},
		ticket_checkin: {type: Boolean},
		checkin_time: {type: Date},
		attend_mark_time: {type: Date},
		here_mark_time: {type: Date},
		location_ver: {type: Boolean},
		location_ver_time: {type: Date}
	}],
	followers: [{
		userId:{type: Number},
		mark_time: {type: Date}
	}],
	music: [{
		date: {type: Date},
		music_genres: [{type: String}],
		music_sample: {type: String},
		djs: [{
			name: {type: String},
			userId: {type: Number},
			soundcloud: {type: String}
		}]
	}],
	notifications: [{
		notificationId: {type: Number},
		time: {type: Date},
		content: {type: String},
		link: {type: String},
		sender: {type: Number},
		audience: []
	}],
	opening_times: {
		sunday:{
			open:{type: String},
			close: {type: String},
			notes: {type: String}
		},
		monday:{
			open:{type: String},
			close: {type: String},
			notes: {type: String}
		},
		tuesday:{
			open:{type: String},
			close: {type: String},
			notes: {type: String}
		},
		wednesday:{
			open:{type: String},
			close: {type: String},
			notes: {type: String}
		},
		thursday:{
			open:{type: String},
			close: {type: String},
			notes: {type: String}
		},
		friday:{
			open:{type: String},
			close: {type: String},
			notes: {type: String}
		},
		saturday:{
			open:{type: String},
			close: {type: String},
			notes: {type: String}
		}
	},
	active: {type: Boolean}
});


BarSchema.plugin(autoIncrement.plugin, {
	model: 'Bar',
	field: 'id',
	startAt: 1
});

BarSchema.virtual('image_circle').get(function () {
	return util.getImage(this, 'cover_picture', default_image_bar);
});

BarSchema.virtual('attendees.user', {
	ref: 'User',
	localField: 'attendees.userId',
	foreignField: 'id',
	justOne: true // for many-to-1
});

let autoPopulateUser = function (next) {
	this.populate('attendees.user');
	next();
};

BarSchema.pre('findOne', autoPopulateUser).pre('find', autoPopulateUser);

BarSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Bar', BarSchema);