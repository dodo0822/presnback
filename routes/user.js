var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var moment = require('moment');
var validator = require('validator');
var async = require('async');
var request = require('request');
var hat = require('hat');
var db = require('../database');
var config = require('../config');
var auth = require('../auth');

module.exports = function(app) {
	app.get('/user/oauth', function(req, res) {
		request({
			url: 'https://graph.facebook.com/v2.3/oauth/access_token',
			qs: {
				redirect_uri: config.siteUrl + '/api/user/oauth',
				client_id: '1582033655448135',
				client_secret: config.fbKey,
				code: req.query.code
			},
			method: 'GET'
		}, function(error, response, body) {
			var body = JSON.parse(body);
			request({
				url: 'https://graph.facebook.com/me',
				qs: {
					access_token: body.access_token,
					locale: 'zh_TW',
					fields: 'name,email'
				}
			}, function(error, response, meBody) {
				meBody = JSON.parse(meBody);
				var id = meBody.id;
				db.User.findOne({ fbid: id }, function(err, user) {
					if(err) {
						res.send({ status: 'error', message: 'internal server error' });
						return;
					}
					if(user) {
						var payload = {
							_id: user._id,
							expire: moment().add(1, 'd').format()
						};
						var token = jwt.encode(payload, db.jwtSecret);
						res.redirect('/#/login?token=' + token);
						return;
					} else {
						res.redirect('/#/fbRegister?access_token=' + body.access_token);
						return;
					}
				});
			});
		});
	});

	app.get('/user/connect', auth.checkUser(), function(req, res) {
		request({
			url: 'https://graph.facebook.com/v2.3/oauth/access_token',
			qs: {
				redirect_uri: config.siteUrl + '/api/user/connect?token=' + req.query.token,
				client_id: '1582033655448135',
				client_secret: config.fbKey,
				code: req.query.code
			},
			method: 'GET'
		}, function(error, response, body) {
			var body = JSON.parse(body);
			request({
				url: 'https://graph.facebook.com/me',
				qs: {
					access_token: body.access_token,
					locale: 'zh_TW',
					fields: 'name,email'
				}
			}, function(error, response, meBody) {
				meBody = JSON.parse(meBody);
				var id = meBody.id;
				if(id === undefined) {
					res.send({ status: 'error', message: 'can\'t get fb info' });
					return;
				}
				db.User.findOne({ fbid: id }, function(err, user) {
					if(err) {
						res.send({ status: 'error', message: 'internal server error' });
						return;
					}
					if(user) {
						res.send({ status: 'error', message: 'already connected to another account' });
						return;
					}
					db.User.findOne({ _id: req.user._id }, function(err, user) {
						user.name = meBody.name;
						user['fbid'] = id;
						user.save(function(err) {
							res.redirect('/#/student/settings');
						});
					});
				});
			});
		});
	});

	app.post('/user/fbRegister', function(req, res) {
		console.log(req.body);
		if(!req.body.access_token || !req.body.groupId || !req.body.studentId) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		request({
			url: 'https://graph.facebook.com/me',
			qs: {
				access_token: req.body.access_token,
				locale: 'zh_TW',
				fields: 'name,email'
			}
		}, function(error, response, body) {
			body = JSON.parse(body);
			if(body.error !== undefined) {
				res.send({ status: 'error', message: 'invalid access token' });
				return;
			}
			db.User.findOne({ fbid: body.id }, function(err, exist) {
				if(exist) {
					res.send({ status: 'error', message: 'connected to fb already' });
					return;
				}
				db.Group.findOne({ _id: req.body.groupId}, function(err, group) {
					if(!group) {
						res.send({ status: 'error', message: 'group not found' });
						return;
					}
					var token = hat();
					var user = new db.User({
						password: 'z',
						email: body.email,
						name: body.name,
						token: token,
						verified: true,
						studentId: req.body.studentId,
						group: req.body.groupId,
						fbid: body.id
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
	});

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
		if(!req.body.username || !req.body.password || !req.body.email || !req.body.name || !req.body.groupId || !req.body.studentId) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		if(!validator.isEmail(req.body.email)) {
			res.send({ status: 'error', message: 'Invalid data.' });
			return;
		}
		db.Group.findOne({ _id: req.body.groupId}, function(err, group) {
			if(!group) {
				res.send({ status: 'error', message: 'group not found' });
				return;
			}
			db.User.findOne({ username: req.body.username }, function(err, exist) {
				if(exist) {
					res.send({ status: 'error', message: 'username already used' });
					return;
				}
				bcrypt.hash(req.body.password, 8, function(err, pw) {
					var token = hat();
					var user = new db.User({
						username: req.body.username,
						password: pw,
						email: req.body.email,
						name: req.body.name,
						token: token,
						verified: false,
						studentId: req.body.studentId,
						group: req.body.groupId
					});
					user.save(function(err) {
						if(err) {
							res.send({ status: 'error', message: 'internal server error.'});
							return;
						}
						request.post('https://api.mailgun.net/v3/' + config.mailgunDomain + '/messages', {
							auth: {
								user: 'api',
								pass: config.mailgunKey
							},
							form: {
								from: 'Presnback Team <presnback@' + config.mailgunDomain + '>',
								to: req.body.email,
								subject: '歡迎加入 Presnback，請驗證您的 Email',
								html: '您好，<br><br>在此歡迎您加入 Presnback，<br>為了完成註冊程序，請點選以下連結驗證您的 Email。<br><a href="' + config.siteUrl + '/api/user/verify?token=' + token + '">' + config.siteUrl + '/api/user/verify?token=' + token + '</a><br><br>Presnback Team'
							}
						}, function(err, response, body) {
							res.send({ status: 'ok' });
						});
					});
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
				if(!user.verified) {
					res.send({ status: 'error', message: 'You havn\'t verified your email yet.'});
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
					group: user.group,
					groupNum: user.group.groupNum,
					name: user.name,
					fbid: user.fbid
				}, token: jwt.encode(payload, db.jwtSecret) });
			});
		});
	});

	app.get('/user/verify', function(req, res) {
		if(!req.query.token) {
			res.send('Invalid request.');
			return;
		}
		db.User.findOne({ token: req.query.token }, function(err, user) {
			if(err) {
				res.send('An internal server error occured, please check later.');
				return;
			}
			if(!user) {
				res.send('Token is invalid.');
				return;
			}
			user.verified = true;
			user.save(function(err, user) {
				if(err) {
					res.send('An internal server error occured, please check later.');
					return;
				}
				res.send('Thank you, your email has been verified. Please go back and log in.');
				return;
			});
		});
	});

	app.get('/user/profile', auth.checkUser(), function(req, res) {
		res.send({ status: 'ok', user: {
			_id: req.user._id,
			username: req.user.username,
			email: req.user.email,
			group: req.user.group,
			groupNum: req.user.group.groupNum,
			name: req.user.name,
			fbid: req.user.fbid
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
					name: users[i].name,
					studentId: users[i].studentId
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

	app.post('/user/changeTopic', auth.checkUser(), function(req, res) {
		if(!req.body.topic) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		db.Group.findOne({ _id: req.user.group._id }, function(err, group) {
			if(err) {
				res.send({ status: 'error', message: 'internal server error' });
				return;
			}
			if(!group) {
				res.send({ status: 'error', message: 'internal server error' });
				return;
			}
			if(!group.needsFeedback) {
				res.send({ status: 'error', message: 'no need' });
				return;
			}
			group.topic = req.body.topic;
			group.save(function(err) {
				if(err) {
					res.send({ status: 'error', message: 'internal server error' });
					return;
				}
				res.send({ status: 'ok' });
			});
		});
	});

	app.post('/user/changePassword', auth.checkUser(), function(req, res) {
		if(!req.body.currentPassword || !req.body.newPassword) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		bcrypt.compare(req.body.currentPassword, req.user.password, function(err, ok) {
			if(!ok) {
				res.send({ status: 'error', message: 'current password is wrong' });
				return;
			}
			bcrypt.hash(req.body.newPassword, 8, function(err, hash) {
				db.User.findOneAndUpdate({ _id: req.user._id }, { $set: { password: hash } }, { upsert: false }, function(err) {
					if(err) {
						res.send({ status: 'error', message: 'internal server error' });
						return;
					}
					res.send({ status: 'ok', message: 'password changed' });
					return;
				});
			});
		})
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