var user = require('./user');
var admin = require('./admin');
var feedback = require('./feedback');
var chat = require('./chat');

module.exports = function(app, io) {
	user(app);
	admin(app);
	feedback(app);
	chat(io);
};