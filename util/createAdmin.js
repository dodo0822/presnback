var db = require('../database');
var bcrypt = require('bcrypt');
var prompt = require('prompt');

prompt.start();

prompt.get({
	properties: {
		username: {},
		password: {
			hidden: true
		},
		email: {}
	}
}, function(err, result) {
	bcrypt.hash(result.password, 8, function(err, pw) {
		var admin = new db.Admin({
			username: result.username,
			password: pw,
			email: result.email
		});
		admin.save(function(err, admin) {
			if(err) {
				console.log(err);
			} else {
				console.log('saved.');
			}
			process.exit();
		});
	});
});