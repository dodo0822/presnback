var webpack = require('webpack');
var path = require('path');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var APP = __dirname + '/app';

var entry = {};
var output = {};

var plugins = [ new ProgressBarPlugin() ];

switch(process.env.NODE_ENV) {
	case 'production':
		entry = {
			app: [ 'babel-polyfill', './index.js' ]
		};
		plugins.push(new CopyWebpackPlugin([{
			from: 'index.html',
			to: '../build/'
		}]));
		output = {
			path: APP,
			filename: '../build/bundle.js'
		};
		break;
	case 'development':
	default:
		entry = {
			app: [ 'babel-polyfill', 'webpack/hot/dev-server', './index.js' ]
		};
		output = {
			path: APP,
			filename: 'bundle.js'
		};
		plugins.push(new webpack.HotModuleReplacementPlugin());
		break;
}

module.exports = {
	context: APP,
	entry: entry,
	module: {
		loaders: [
			{
				test: /\.scss$/,
				loader: 'style!css!sass'
			},
			{
				test: /\.css$/,
				loader: 'style!css'
			},
			{
				test: /\.js$/,
				loader: 'ng-annotate!babel?presets[]=es2015!jshint?esversion=6',
				exclude: /node_modules|bower_components/
			},
			{
				test: /\.html$/,
				loader: 'ngtemplate!html',
				exclude: /index/
			},
			{
				test: /\.(woff2?|svg)$/,
				loader: 'url?limit=10000'
			},
			{
				test: /\.(ttf|eot)$/,
				loader: 'file'
			}
		]
	},
	plugins: plugins,
	output: output
};
