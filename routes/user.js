var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var moment = require('moment');
var validator = require('validator');
var async = require('async');
var db = require('../database');
var auth = require('../auth');

module.exports = function(app) {
	app.get('/group/list', function(req, res) {
		db.Group.find({}, function(err, list) {
			if(err) {
				res.send({ status: 'error', message: 'internal server error.'});
				return;
			}
			res.send({ status: 'ok', groups: list });
		});
	});

	app.post('/user/register', function(req, res) {
		if(!req.body.username || !req.body.password || !req.body.email || !req.body.name || !req.body.groupId) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		if(!validator.isEmail(req.body.email)) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		db.User.findOne({ username: req.body.username }, function(err, exist) {
			if(exist) {
				res.send({ status: 'error', message: 'username already used' });
				return;
			}
			bcrypt.hash(req.body.password, 8, function(err, pw) {
				var user = new db.User({
					username: req.body.username,
					password: pw,
					email: req.body.email,
					name: req.body.name,
					group: req.body.groupId
				});
				user.save(function(err) {
					if(err) {
						res.send({ status: 'error', message: 'internal server error.'});
						return;
					}
					res.send({ status: 'ok' });
				});
			});
		});
	});

	app.post('/user/login', function(req, res) {
		if(!req.body.username || !req.body.password) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		db.User.findOne({ username: req.body.username }).populate('group').exec(function(err, user) {
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
					groupNum: user.group.groupNum,
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
			groupNum: req.user.group.groupNum,
			name: req.user.name
		} });
	});

	app.get('/user/list', function(req, res) {
		db.User.find({}).populate('group').exec(function(err, users) {
			var resp = [];
			for(var i = 0; i < users.length; ++i) {
				resp.push({
					_id: users[i]._id,
					username: users[i].username,
					groupNum: users[i].group.groupNum,
					email: users[i].email,
					name: users[i].name
				});
			}
			res.send({ status: 'ok', users: resp });
		});
	});

	app.get('/user/remove', auth.checkAdmin(), function(req, res) {
		if(!req.query.id) {
			res.send({ status: 'error', message: 'invalid request.' });
			return;
		}
		db.User.findOne({ _id: req.query.id }, function(err, user) {
			if(!user) {
				res.send({ stataus: 'error', message: 'user not found.' });
				return;
			}
			user.remove(function(err) {
				res.send({ status: 'ok' });
			});
		});
	});

	/*app.post('/user/update', auth.checkAdmin(), function(req, res) {
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
	});*/

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