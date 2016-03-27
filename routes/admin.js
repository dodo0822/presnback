var db = require('../database');
var auth = require('../auth');
var async = require('async');

module.exports = function(app) {
	app.get('/admin/initGroup', auth.checkAdmin(), function(req, res) {
		if(!req.query.num) {
			res.send({ status: 'error', message: 'invalid request' });
			return;
		}
		db.Feedback.remove({}, function(err) {
			db.User.remove({}, function(err) {
				db.Group.remove({}, function(err){
					var groups = [];
					var num = parseInt(req.query.num);
					for(var i = 1; i <= num; ++i) {
						groups.push({
							groupNum: i,
							needsFeedback: false
						});
					}
					db.Group.create(groups, function(err) {
						res.send({ status: 'ok' });
					});
				});
			});
		});
	});

	app.post('/admin/initFeedback', auth.checkAdmin(), function(req, res) {
		console.log(req.body.table);
		if(!req.body.table) {
			res.send({ status: 'error', message: 'invalid request.' });
			return;
		}
		db.Feedback.remove({}, function(err) {
			var table = req.body.table;
			var waterfall = [];

			function genWaterfall(i) {
				var row = table[i];
				return function(callback) {
					db.Group.update({ _id: row._id }, { $set: {
						needsFeedback: row.needsFeedback,
						topic: ''
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
	});
};