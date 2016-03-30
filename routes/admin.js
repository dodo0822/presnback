var db = require('../database');
var auth = require('../auth');
var async = require('async');
var xlsx = require('node-xlsx');
var async = require('async');

module.exports = function(app) {
	app.get('/admin/exportXlsx', auth.checkAdmin(), function(req, res) {
		var data = [['組別','主題','肢體動作','簡報用心','超有梗','印象深刻','總分']];
		var table = {};
		var items = ['a', 'b', 'c', 'd', 'total'];
		db.Feedback.find({}, function(err, f) {
			if(err) {
				res.send('Internal server error.');
				return;
			}
			for(var i = 0; i < f.length; ++i) {
				if(!table.hasOwnProperty(f[i].to)) {
					table[f[i].to] = {
						num: 1
					};
					for(var j = 0; j < items.length; ++j) {
						table[f[i].to][items[j]] = f[i].scores[items[j]];
					}
				} else {
					table[f[i].to].num++;
					for(var j = 0; j < items.length; ++j) {
						table[f[i].to][items[j]] += f[i].scores[items[j]];
					}
				}
			}
			var totals = [];
			for(var id in table) {
				for(var i = 0; i < items.length; ++i) {
					table[id][items[i]] /= table[id].num;
				}
				totals.push({
					id: id,
					total: table[id].total
				});
			}

			totals.sort(function(a, b){ return b.total - a.total; });
			
			function genWaterfall(id) {
				return function(cb) {
					db.Group.findOne({ _id: id }, function(err, group) {
						table[id].groupNum = group.groupNum;
						table[id].topic = group.topic;
						table[id].users = [];
						db.User.find({ group: id }, function(err, users) {
							for(var i = 0; i < users.length; ++i) {
								table[id].users.push(users[i].name);
							}
							cb();
						});
					});
				};
			}
			var waterfall = [];
			for(var id in table) waterfall.push(genWaterfall(id));
			async.parallel(waterfall, function(err, result) {
				for(var i = 0; i < totals.length; ++i) {
					var id = totals[i].id;
					var row = [table[id].groupNum, table[id].topic];
					for(var j = 0; j < items.length; ++j) row[j+2] = table[id][items[j]];
					for(var j = 0; j < table[id].users.length; ++j) row[j+7] = table[id].users[j];
					data.push(row);
				}
				var buffer = xlsx.build([{ name: 'Scores', data: data }]);
				res.setHeader('Content-disposition', 'attachment; filename=physExp.xlsx');
				res.header('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				res.send(buffer);
				return;
			});
		});
	});
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
