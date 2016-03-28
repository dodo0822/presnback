angular.module('app').controller('AppController', function(UserService, ChatService, CHAT_EVENTS, AUTH_EVENTS, $state, $scope, $location, $rootScope, Session) {
	$scope.currentUser = null;
	$scope.isAuthenticated = UserService.isAuthenticated;
	$scope.notificationIndex = 1;
	$scope.notifications = {};

	//$scope.chatMessages = [];

	$scope.addNotification = function(n) {
		var i = $scope.notificationIndex++;
		$scope.notifications[i] = n;
		$scope.$apply();
	};
	$scope.$on(CHAT_EVENTS.newMessage, function(evt, msg) {
		//$scope.chatMessages.push(msg);
		//$scope.$apply();
		if($scope.isActive('/student/chat')) return;
		console.log(msg);
		if(msg.type == 0) {
			$scope.addNotification({
				important: 0,
				message: msg.from + ' 說：' + msg.message
			});
		} else {
			$scope.addNotification({
				important: 1,
				message: '主宰者：' + msg.message
			});
		}
	});
	$scope.setCurrentUser = function(user) {
		$scope.currentUser = user;
	};
	$scope.logout = function() {
		$scope.currentUser = null;
		Session.destroy();
		$state.go('login');
		ChatService.disconnect();
	};
	$scope.isActive = function(path) {
		return $location.path().substr(0, path.length) == path;
	};
	$scope.$on(AUTH_EVENTS.restoreSuccess, function(event, user){
		$scope.setCurrentUser(user);
	});
/*
	$scope.socket = null;
	$scope.io = require('socket.io-client');
	$scope.state = 0;

	$scope.messages = [];

	$scope.chatConnect = function(nickname) {
		var that = $scope;

		if($scope.state != 0) return;

		$scope.socket = $scope.io();
		$scope.state = 1;
		$scope.socket.emit('nickname', nickname);

		$scope.socket.on('users', function(users) {
			$rootScope.$broadcast(CHAT_EVENTS.users, users);
		});
		$scope.socket.on('broadcast', function(content) {
			that.messages.push({ type: 1, message: content });
			$rootScope.$broadcast(CHAT_EVENTS.newMessage, { type: 1, message: content });
		});
		$scope.socket.on('message', function(msg) {
			that.messages.push({ type: 0, message: msg.message, from: msg.from });
			$rootScope.$broadcast(CHAT_EVENTS.newMessage, { type: 0, message: msg.message, from: msg.from });
		});
	};

	$scope.chatEmit = function(message) {
		if(!message) return;
		if($scope.state == 0) return;

		$scope.socket.emit('message', message);
	};
*/
});