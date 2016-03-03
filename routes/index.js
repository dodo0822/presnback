var user = require('./user');
var admin = require('./admin');
var feedback = require('./feedback');

module.exports = function(app) {
	user(app);
	admin(app);
	feedback(app);
};