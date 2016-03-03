angular.module('app').controller('AdminUserListController', function($scope, UserService) {
	$scope.table = [];
	$scope.message = '';

	$scope.submit = function() {
		$scope.message = '';
		UserService.update($scope.table).then(function(resp) {
			$scope.message = 'OK.';
		});
	};

	UserService.list().then(function(resp) {
		$scope.table = resp.users;
	});
});