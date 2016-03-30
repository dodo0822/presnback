angular.module('app').controller('AdminController', function($scope, Session) {
	$scope.token = Session.token;
});
