angular.module('app').controller('LoginController', function(AUTH_EVENTS, $state, $rootScope, $scope, UserService, Session) {
	$scope.login = function(credentials) {
		if(!credentials) {
			$scope.error = 'All fields must be filled.';
			return;
		} 
		if(!credentials.username || !credentials.password || !credentials.type) {
			$scope.error = 'All fields must be filled.';
			return;
		}
		credentials.type = parseInt(credentials.type);
		UserService.login(credentials.username, credentials.password, credentials.type).then(function(resp) {
			if(resp.status == 'error') {
				$scope.error = resp.message;
				return;
			}
			$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			$scope.setCurrentUser(resp.user);
			Session.create(resp.token, resp.user._id, credentials.type);
			$state.go('home');
		});
	};
});