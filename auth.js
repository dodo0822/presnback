var db = require('./database');
var moment = require('moment');
var jwt = require('jwt-simple');
var fs = require('fs');

module.exports = {
	checkUser: function(uploads) {
		return function(req, res, next) {
			var token = req.param('token', '');
			if(!token) {
				if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
				res.status(403).send({ status: 'error', message: 'Forbidden' });
				return;
			}
			var payload = [];
			try {
				payload = jwt.decode(token, db.jwtSecret);
			} catch(err) {
				if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
				res.status(403).send({ status: 'error', message: 'Forbidden' });
				return;
			}
			if(!payload.expire || !payload._id) {
				if(uploads) fs.unlinkSync(__dirname  + '/'+ req.file.path);
				res.status(403).send({ status: 'error', message: 'Forbidden' });
				return;
			}
			if(moment(payload.expire).isBefore(moment())) {
				if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
				res.status(401).send({ status: 'error', message: 'Session expired.' });
				return;
			}
			db.User.findOne({ _id: payload._id }).populate('group').exec(function(err, user) {
				if(err) {
					if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
					res.status(500).send({ status: 'error', message: 'Internal server error.' });
					console.log('E: cannot find user when checking token');
					return;
				}
				if(!user) {
					if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
					res.status(403).send({ status: 'error', message: 'Invalid token.' });
					return;
				}
				req.user = user;
				next();
			});
		};
	},

	checkAdmin: function(uploads) {
		return function(req, res, next) {
			var token = req.param('token', '');
			if(!token) {
				if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
				res.status(403).send({ status: 'error', message: 'Forbidden' });
				return;
			}
			var payload = [];
			try {
				payload = jwt.decode(token, db.jwtSecret);
			} catch(err) {
				if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
				res.status(403).send({ status: 'error', message: 'Forbidden' });
				return;
			}
			if(!payload.expire || !payload._id) {
				if(uploads) fs.unlinkSync(__dirname  + '/'+ req.file.path);
				res.status(403).send({ status: 'error', message: 'Forbidden' });
				return;
			}
			if(moment(payload.expire).isBefore(moment())) {
				if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
				res.status(401).send({ status: 'error', message: 'Session expired.' });
				return;
			}
			db.Admin.findOne({ _id: payload._id }, function(err, user) {
				if(err) {
					if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
					res.status(500).send({ status: 'error', message: 'Internal server error.' });
					console.log('E: cannot find user when checking token');
					return;
				}
				if(!user) {
					if(uploads) fs.unlinkSync(__dirname + '/' + req.file.path);
					res.status(403).send({ status: 'error', message: 'Invalid token.' });
					return;
				}
				req.user = user;
				next();
			});
		};
	}
};