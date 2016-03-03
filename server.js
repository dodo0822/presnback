var express = require('express');
var proxy = require('proxy-middleware');
var url = require('url');
var bodyParser = require('body-parser');
var db = require('./database');
var app = express();

app.use(bodyParser.json());

var api = express();

require('./routes')(api);

switch(process.env.NODE_ENV) {
	case 'production':
		app.use('/api', api);
		app.use(express.static(__dirname + '/build'));
		break;
	case 'development':
	default:
		app.use('/api', api);
		app.use('/', proxy(url.parse('http://localhost:8080')));
		break;
}

app.listen('8081', function() {
	console.log('started');
});