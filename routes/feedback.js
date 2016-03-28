var async = require('async');
var db = require('../database');
var auth = require('../auth');

module.exports = function(app) {
	app.get('/feedback/leaderboard', auth.checkUser(), function(req, res) {
		if(!req.query.item) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		var item = req.query.item;
		if(!(item == 'a' || item == 'b' || item == 'c' || item == 'd' || item == 'total')) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		var nums = {};
		var as = {};
		db.Feedback.find({}).exec(function(err, f) {
			for(var i = 0; i < f.length; ++i) {
				var to = f[i].to;
				if(!nums.hasOwnProperty(to)) {
					nums[to] = 1;
					as[to] = f[i].scores[item];
				} else {
					nums[to]++;
					as[to] += f[i].scores[item];
				}
			}

			var leaderboard = [];

			for(var id in nums) {
				leaderboard.push({ id: id, score: as[id] });
			}

			leaderboard.sort(function(a, b) { return b.score-a.score; });

			if(leaderboard.length > 3) leaderboard.splice(2, leaderboard.length-3);

			var waterfall = [];

			function genWaterfall(i) {
				var row = leaderboard[i];
				return function(callback) {
					db.Group.findOne({ _id: row.id }, function(err, group) {
						var topic = group.topic;
						db.User.find({ group: group._id }, function(err, users) {
							var list = [];
							for(var j = 0; j < users.length; ++j) {
								list.push({
									_id: users[j]._id,
									name: users[j].name,
									fbid: users[j].fbid
								});
							}
							callback(err, { topic: topic, groupNum: group.groupNum, users: list });
						});
					});
				};
			}

			for(var i = 0; i < leaderboard.length; ++i) {
				waterfall.push(genWaterfall(i));
			}

			async.parallel(waterfall, function(err, results) {
				for(var i = 0; i < leaderboard.length; ++i) {
					leaderboard[i].topic = results[i].topic;
					leaderboard[i].groupNum = results[i].groupNum;
					leaderboard[i].users = results[i].users;
				}
				res.send({ status: 'ok', leaderboard: leaderboard });
			});
		});
	});

	app.get('/feedback/mine', auth.checkUser(), function(req, res) {
		var group = req.user.group._id;
		db.Feedback.find({ to: group }).sort('-time').exec(function(err, f) {
			if(err) {
				res.send({ status: 'error', message: 'internal server error' });
				return;
			}
			var ret = [];
			for(var i = 0; i < f.length; ++i) {
				ret.push({
					time: f[i].time,
					content: f[i].content,
					scores: f[i].scores
				});
			}
			res.send({ status: 'ok', feedback: ret });
		});
	});

	app.get('/feedback/lookup', auth.checkUser(), function(req, res) {
		if(!req.query.to) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		db.Feedback.findOne({ to: req.query.to, from: req.user._id }, function(err, f) {
			if(!f) {
				res.send({ status: 'ok', found: false });
				return;
			}
			res.send({ status: 'ok', found: true, feedback: f });
		});
	})

	app.post('/feedback/give', auth.checkUser(), function(req, res) {
		if(!req.body.to || !req.body.content || !req.body.scores) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		if(!Number.isInteger(req.body.scores.a) || !Number.isInteger(req.body.scores.b) || !Number.isInteger(req.body.scores.c) || !Number.isInteger(req.body.scores.d)) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		if(req.body.scores.a > 4 || req.body.scores.a < 1) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		if(req.body.scores.b > 4 || req.body.scores.b < 1) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		if(req.body.scores.c > 4 || req.body.scores.c < 1) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		if(req.body.scores.d > 4 || req.body.scores.d < 1) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		var from = req.user._id;
		var to = req.body.to;
		var content = req.body.content;
		var scores = {
			a: req.body.scores.a,
			b: req.body.scores.b,
			c: req.body.scores.c,
			d: req.body.scores.d,
			total: (req.body.scores.a + req.body.scores.b + req.body.scores.c + req.body.scores.d) / 4
		};
		
		if(from == to) {
			res.send({ status: 'error', message: 'you cannot give yourself a feedback' });
			return;
		}
		db.Group.findOne({ _id: to }, function(err, toUser) {
			if(!toUser) {
				res.send({ status: 'error', message: 'user does not exist' });
				return;
			}
			db.Feedback.findOneAndUpdate({
				from: from,
				to: to
			}, {
				content: content,
				scores: scores,
				time: new Date()
			}, { upsert: true }, function(err, f) {
				if(err) {
					res.send({ status: 'error', message: 'internal server error' });
					return;
				}
				res.send({ status: 'ok' });
			});
		});
	});

	app.post('/feedback/list', auth.checkAdmin(), function(req, res) {
		var cond = {};
		if(req.body.condition) cond = req.body.condition;
		var condFrom = {};
		if(cond.to) condFrom['to'] = cond.to;
		if(cond.from) {
			db.User.find({ group: cond.from }, { _id: 1 }, function(err, users) {
				if(err) {
					res.send({ status: 'error', message: 'internal server error' });
					return;
				}
				var ids = users.map(function(user) { return user._id; });
				condFrom['from'] = {
					$in: ids
				};
				db.Feedback.find(condFrom).populate({
					path: 'from',
					select: 'username group',
					populate: {
						path: 'group',
						model: db.Group
					}
				}).populate('to').exec(function(err, list) {
					if(err) {
						res.send({ status: 'error', message: 'internal server error' });
						return;
					}
					res.send({ status: 'ok', feedback: list });
				});
			})
		} else {
			db.Feedback.find(condFrom).populate({
				path: 'from',
				select: 'username group',
				populate: {
					path: 'group',
					model: db.Group
				}
			}).populate('to').exec(function(err, list) {
				if(err) {
					res.send({ status: 'error', message: 'internal server error' });
					return;
				}
				res.send({ status: 'ok', feedback: list });
			});
		}
	});

	app.get('/feedback/remove', auth.checkAdmin(), function(req, res) {
		if(!req.query.id) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		db.Feedback.findOne({ _id: req.query.id }, function(err, f) {
			if(err) {
				res.send({ status: 'error', message: 'internal server error' });
				return;
			}
			if(!f) {
				res.send({ status: 'error', message: 'not found' });
				return;
			}
			f.remove(function(err) {
				res.send({ status: 'ok' });
			});
		});
	});

	app.post('/feedback/edit', auth.checkAdmin(), function(req, res) {
		if(!req.body.id || !req.body.content) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		var cond = { _id: req.body.id };
		var upd = { $set: {
			content: req.body.content
		} };
		var opt = { multi: false, upsert: false };
		db.Feedback.update(cond, upd, opt, function(err) {
			if(err) {
				res.send({ status: 'error', message: 'internal server error' });
				return;
			}
			res.send({ status: 'ok' });
		});
	});
};