module.exports = function() {
	global.$ = global.jQuery = require('jquery');
	require('angular');
	require('angular-ui-router');
	require('ngstorage');
	require('bootstrap-loader');
	require('angular-loading-bar');
	require('angular-easyfb');
	require('angularjs-scroll-glue');
	require('angular-animate');
	require('angular-growl-notifications');
};