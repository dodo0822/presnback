var db = require('../database');
var auth = require('../auth');

module.exports = function(app) {
	app.get('/feedback/mine', auth.checkUser(), function(req, res) {
		var userId = req.user._id;
		db.Feedback.find({ to: userId }, function(err, f) {
			if(err) {
				res.send({ status: 'error', message: 'internal server error' });
				return;
			}
			var ret = [];
			for(var i = 0; i < f.length; ++i) {
				ret.push({
					time: f[i].time,
					content: f[i].content
				});
			}
			res.send({ status: 'ok', feedback: ret });
		});
	});

	app.post('/feedback/give', auth.checkUser(), function(req, res) {
		if(!req.body.to || !req.body.content) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		var from = req.user._id;
		var to = req.body.to;
		var content = req.body.content;
		if(from == to) {
			res.send({ status: 'error', message: 'you cannot give yourself a feedback' });
			return;
		}
		db.User.findOne({ _id: to }, function(err, toUser) {
			if(!toUser) {
				res.send({ status: 'error', message: 'user does not exist' });
				return;
			}
			var f = new db.Feedback({
				from: from,
				to: to,
				content: content,
				time: new Date()
			});
			f.save(function(err) {
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
		db.Feedback.find(cond).populate('from').populate('to').exec(function(err, list) {
			if(err) {
				res.send({ status: 'error', message: 'internal server error' });
				return;
			}
			res.send({ status: 'ok', feedback: list });
		});
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