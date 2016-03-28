angular.module('app').controller('StudentChatController', function($scope, ChatService, CHAT_EVENTS) {
	$scope.state = 0;
	$scope.error = '';
	$scope.messages = [];
	$scope.message = '';

	console.log('init');

	$scope.$on(CHAT_EVENTS.newMessage, function(evt, data) {
		$scope.messages.push(data);
		$scope.$apply();
	});

	$scope.connect = function(nickname) {
		if(!nickname) {
			$scope.error = '請輸入你的暱稱！';
			return;
		}
		$scope.error = '';
		ChatService.connect(nickname);
		$scope.state = 1;
	};

	$scope.emit = function() {
		if(!$scope.message) {
			return;
		}
		ChatService.emit($scope.message);
		$scope.message = '';
	};

	if(ChatService.state == 1) {
		$scope.state = 1;
		$scope.messages = ChatService.messages.slice();
	};
});