var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/presnback');

var Schema = mongoose.Schema;

var groupSchema = new Schema({
	groupNum: Number,
	needsFeedback: Boolean,
	topic: String
});

var userSchema = new Schema({
	username: String,
	password: String,
	email: String,
	group: { type: Schema.Types.ObjectId, ref: 'Group' },
	name: String,
	token: String,
	studentId: String,
	verified: Boolean,
	fbid: String
});

var adminSchema = new Schema({
	username: String,
	password: String,
	email: String,
	lastLogin: Date,
	lastLoginIp: String
});

var feedbackSchema = new Schema({
	from: { type: Schema.Types.ObjectId, ref: 'User' },
	to: { type: Schema.Types.ObjectId, ref: 'Group' },
	time: Date,
	content: String,
	scores: Object
});

module.exports.jwtSecret = 'IF4GhO2i71cCL8HzPn82k9VnBNcQIAP3';

module.exports.Group = mongoose.model('Group', groupSchema);
module.exports.User = mongoose.model('User', userSchema);
module.exports.Admin = mongoose.model('Admin', adminSchema);
module.exports.Feedback = mongoose.model('Feedback', feedbackSchema);