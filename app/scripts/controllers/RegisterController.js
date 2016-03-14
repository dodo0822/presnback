var validator = require('validator');

angular.module('app').controller('RegisterController', function($scope, UserService, $state) {
	$scope.groups = [];
	$scope.submit = function(data) {
		if(!data) {
			$scope.error = '請輸入全部欄位！';
			return;
		}
		if(!data.username || !data.password || !data.passwordRepeat || !data.email || !data.name || !data.group || !data.studentId) {
			$scope.error = '請輸入全部欄位！';
			return;
		}
		if(data.password !== data.passwordRepeat) {
			$scope.error = '兩次輸入的密碼不符合！';
			return;
		}
		if(!validator.isEmail(data.email)) {
			$scope.error = 'Email 格式錯誤！';
			return;
		}
		UserService.register(data.username, data.password, data.email, data.name, data.studentId, data.group).then(function(resp) {
			if(resp.status == 'ok') $state.go('login');
		});
	};

	UserService.listGroup().then(function(resp) {
		if(resp.status == 'ok') $scope.groups = resp.groups;
	});
});