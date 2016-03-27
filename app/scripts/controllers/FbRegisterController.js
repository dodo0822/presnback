angular.module('app').controller('FbRegisterController', function($scope, UserService, $location, $state) {
	$scope.accessToken = $location.search().access_token;

	$scope.groups = [];
	$scope.submit = function(data) {
		if(!data) {
			$scope.error = '請輸入全部欄位！';
			return;
		}
		if(!data.group || !data.studentId) {
			$scope.error = '請輸入全部欄位！';
			return;
		}
		UserService.fbRegister($scope.accessToken, data.studentId, data.group).then(function(resp) {
			if(resp.status == 'ok') $state.go('login');
		});
	};

	UserService.listGroup().then(function(resp) {
		if(resp.status == 'ok') $scope.groups = resp.groups;
	});
});