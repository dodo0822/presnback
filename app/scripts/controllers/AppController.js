angular.module('app').controller('AppController', function(UserService, AUTH_EVENTS, $state, $scope, $location, $rootScope, Session) {
	$scope.currentUser = null;
	$scope.isAuthenticated = UserService.isAuthenticated;
	$scope.setCurrentUser = function(user) {
		$scope.currentUser = user;
	};
	$scope.logout = function() {
		$scope.currentUser = null;
		Session.destroy();
		$state.go('login');
	};
	$scope.isActive = function(path) {
		return $location.path().substr(0, path.length) == path;
	};
	$scope.$on(AUTH_EVENTS.restoreSuccess, function(event, user){
		$scope.setCurrentUser(user);
	});
});