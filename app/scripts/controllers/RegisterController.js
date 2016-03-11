angular.module('app').controller('RegisterController', function($scope, UserService, $state) {
	$scope.groups = [];
	$scope.submit = function(data) {
		if(!data.username || !data.password || !data.passwordRepeat || !data.email || !data.name || !data.group || data.password !== data.passwordRepeat) {
			$scope.error = '請輸入全部欄位！';
			return;
		}
		UserService.register(data.username, data.password, data.email, data.name, data.group).then(function(resp) {
			if(resp.status == 'ok') $state.go('login');
		});
	};

	UserService.listGroup().then(function(resp) {
		if(resp.status == 'ok') $scope.groups = resp.groups;
	});
});