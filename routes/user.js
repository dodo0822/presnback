var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var moment = require('moment');
var validator = require('validator');
var async = require('async');
var db = require('../database');
var auth = require('../auth');

module.exports = function(app) {
	app.post('/user/login', function(req, res) {
		if(!req.body.username || !req.body.password) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		db.User.findOne({ username: req.body.username }, function(err, user) {
			if(err) {
				res.send({ status: 'error', message: 'Internal server error.' });
				console.log('E: error finding user during login', err);
				return;
			}
			if(!user) {
				res.send({ status: 'error', message: 'Username or password is wrong.'});
				return;
			}
			bcrypt.compare(req.body.password, user.password, function(err, result) {
				if(err) {
					res.send({ status: 'error', message: 'Internal server error.' });
					console.log('E: error comparing password', err);
					return;
				}
				if(!result) {
					res.send({ status: 'error', message: 'Username or password is wrong.'});
					return;
				}
				var payload = {
					_id: user._id,
					expire: moment().add(1, 'd').format()
				};
				res.send({ status: 'ok', user: {
					_id: user._id,
					username: user.username,
					email: user.email,
					groupNum: user.groupNum,
					name: user.name
				}, token: jwt.encode(payload, db.jwtSecret) });
			});
		});
	});

	app.get('/user/profile', auth.checkUser(), function(req, res) {
		res.send({ status: 'ok', user: {
			_id: req.user._id,
			username: req.user.username,
			email: req.user.email,
			groupNum: req.user.groupNum,
			name: req.user.name
		} });
	});

	app.get('/user/list', function(req, res) {
		db.User.find({}, function(err, users) {
			var resp = [];
			for(var i = 0; i < users.length; ++i) {
				resp.push({
					_id: users[i]._id,
					username: users[i].username,
					groupNum: users[i].groupNum,
					name: users[i].name
				});
			}
			res.send({ status: 'ok', users: resp });
		});
	});

	app.post('/user/update', auth.checkAdmin(), function(req, res) {
		if(!req.body.table) {
			res.send({ status: 'error', message: 'invalid request.' });
			return;
		}
		var table = req.body.table;
		var waterfall = [];

		function genWaterfall(i) {
			var row = table[i];
			return function(callback) {
				db.User.update({ _id: row._id }, { $set: {
					name: row.name
				}}, { multi: false }, function(err, upd) {
					callback(err, upd);
				});
			};
		}

		for(var i = 0; i < table.length; ++i) {
			waterfall.push(genWaterfall(i));
		}

		async.series(waterfall, function(err, results) {
			res.send({ status: 'ok' });
		});
	});

	app.get('/admin/profile', auth.checkAdmin(), function(req, res) {
		res.send({ status: 'ok', user: {
			_id: req.user._id,
			username: req.user.username,
			email: req.user.email
		} });
	});

	app.post('/admin/login', function(req, res) {
		if(!req.body.username || !req.body.password) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		db.Admin.findOne({ username: req.body.username }, function(err, user) {
			if(err) {
				res.send({ status: 'error', message: 'Internal server error.' });
				console.log('E: error finding user during login', err);
				return;
			}
			if(!user) {
				res.send({ status: 'error', message: 'Username or password is wrong.'});
				return;
			}
			bcrypt.compare(req.body.password, user.password, function(err, result) {
				if(err) {
					res.send({ status: 'error', message: 'Internal server error.' });
					console.log('E: error comparing password', err);
					return;
				}
				if(!result) {
					res.send({ status: 'error', message: 'Username or password is wrong.'});
					return;
				}
				var payload = {
					_id: user._id,
					expire: moment().add(1, 'd').format()
				};
				res.send({ status: 'ok', user: {
					_id: user._id,
					username: user.username,
					email: user.email
				}, token: jwt.encode(payload, db.jwtSecret) });
			});
		});
	});

};