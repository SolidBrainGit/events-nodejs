let mongoose = require('mongoose'),
	Schema = mongoose.Schema;
let Promise = require('bluebird');
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
		country: {type: String},
		city: {type: String},
		address: {type: String},
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
		{
			userId: {type: Number},
			permission_level: {type: Number}
		}
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
		user: {type: Object},
		userId: {type: Number},
		times_attended: {type: Number},
		last_attendence: {type: Date}
	}],
    likes: [{
        userId: {type: Schema.Types.ObjectId},
        likeTime: {type: Date}
    }],
    comments:[{
        commentId: {type: Schema.Types.ObjectId},
        userId: {type: Schema.Types.ObjectId},
        createdAt: {type: Date},
        deletedAt: {type: Date},
        content: {type: String},
        likes: [{type: Schema.Types.ObjectId}]
    }],
    announcements: [{
        announcementId: {type: Number, required: true, index: {unique: true}},
        userId: {type: Schema.Types.ObjectId},
        createdAt: {type: Date},
        deletedAt: {type: Date},
        content: {type: String},
        likes: [{type: Schema.Types.ObjectId}]
    }],
    pictures: [{
        picture: {type: Schema.Types.ObjectId},
        pictureUrl: {type: String},
        uploadedAt: {type: Date},
        uploader: {type: Schema.Types.ObjectId},
        isPrivate: {type: Boolean},
        isOfficial: {type: Boolean},
        comments: [{
            commentId: {type: Schema.Types.ObjectId},
            userId: {type: Schema.Types.ObjectId},
            createdAt: {type: Date},
            deletedAt: {type: Date},
            content: {type: String},
            liked: [{type: Schema.Types.ObjectId}]
        }],
        tagged: [{type: Schema.Types.ObjectId}],
        likes: [{type: Schema.Types.ObjectId}]

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
		sunday: {
			open: {type: String, default: '-'},
			close: {type: String, default: '-'},
			notes: {type: String, default: ''}
		},
		monday: {
			open: {type: String, default: '-'},
			close: {type: String, default: '-'},
			notes: {type: String, default: ''}
		},
		tuesday: {
			open: {type: String, default: '-'},
			close: {type: String, default: '-'},
			notes: {type: String, default: ''}
		},
		wednesday: {
			open: {type: String, default: '-'},
			close: {type: String, default: '-'},
			notes: {type: String, default: ''}
		},
		thursday: {
			open: {type: String, default: '-'},
			close: {type: String, default: '-'},
			notes: {type: String, default: ''}
		},
		friday: {
			open: {type: String, default: '-'},
			close: {type: String, default: '-'},
			notes: {type: String, default: ''}
		},
		saturday: {
			open: {type: String, default: '-'},
			close: {type: String, default: '-'},
			notes: {type: String, default: ''}
		}
	},
	active: {type: Boolean},
	remarks: {type: String, trim: true},
	age_range: {
		min: {type: String},
		max: {type: String}
	}
});


BarSchema.plugin(autoIncrement.plugin, {
	model: 'Bar',
	field: 'id',
	startAt: 2213
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

BarSchema.virtual('followers.user', {
	ref: 'User',
	localField: 'followers.userId',
	foreignField: 'id',
	justOne: true // for many-to-1
});

let autoPopulateUser = function (next) {
	this.populate('attendees.user');
	this.populate('followers.user');
	next();
};

BarSchema.statics.countByDate = function () {
	let date = Date.now();
	let barModel = this.model('Bar');
	let todayDate = new Date(date);
	let dayArrays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

	let field = 'opening_times.' + dayArrays[todayDate.getDay()];

	return barModel.find({}, [field, 'id']).exec()
};

BarSchema.virtual('image').get(function () {
	return util.getImage(this, 'cover_picture', default_image_bar);
});

BarSchema.pre('findOne', autoPopulateUser).pre('find', autoPopulateUser);

BarSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Bar', BarSchema);
