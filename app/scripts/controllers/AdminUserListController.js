angular.module('app').controller('AdminUserListController', function($scope, UserService) {
	$scope.table = [];
	$scope.message = '';

	$scope.remove = function(idx) {
		$scope.message = '刪除中..';
		UserService.remove($scope.table[idx]._id).then(function(resp) {
			if(resp.status == 'ok') {
				$scope.message = '完成。';
			}
		});
	};

	UserService.list().then(function(resp) {
		$scope.table = resp.users;
	});
});