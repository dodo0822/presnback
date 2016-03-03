var db = require('../database');
var auth = require('../auth');
var bcrypt = require('bcrypt');

module.exports = function(app) {
	app.get('/admin/init', auth.checkAdmin(), function(req, res) {
		if(!req.query.num) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		db.Feedback.remove({}, function(err) {
			db.User.remove({}, function(err) {
				var users = [];
				var num = parseInt(req.query.num);
				for(var i = 1; i <= num; ++i) {
					var username = 'group' + i;
					var password = bcrypt.hashSync(username, 8);
					users.push({
						username: username,
						password: password,
						groupNum: i,
						name: '不知道'
					});
				}
				db.User.create(users, function(err) {
					res.send({ status: 'ok' });
				});
			});
		});
	});
};