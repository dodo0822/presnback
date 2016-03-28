angular.module('app').service('ChatService', function($rootScope, CHAT_EVENTS) {
	this.socket = null;
	this.io = require('socket.io-client');
	this.state = 0;

	this.messages = [];

	this.connect = function(nickname) {
		var that = this;

		if(this.state != 0) return;

		this.socket = this.io();
		this.state = 1;
		this.socket.emit('nickname', nickname);

		this.socket.on('users', function(users) {
			$rootScope.$broadcast(CHAT_EVENTS.users, users);
		});
		this.socket.on('broadcast', function(content) {
			that.messages.push({ type: 1, message: content });
			$rootScope.$broadcast(CHAT_EVENTS.newMessage, { type: 1, message: content });
		});
		this.socket.on('message', function(msg) {
			that.messages.push({ type: 0, message: msg.message, from: msg.from });
			$rootScope.$broadcast(CHAT_EVENTS.newMessage, { type: 0, message: msg.message, from: msg.from });
		});
		this.socket.on('reconnect', function() {
			that.socket.emit('nickname', nickname);
		});
	};

	this.disconnect = function() {
		if(this.state != 0) {
			this.socket.disconnect();
			this.state = 0;
		}
	};

	this.emit = function(message) {
		if(!message) return;
		if(this.state == 0) return;

		this.socket.emit('message', message);
	};
	
	return this;
});