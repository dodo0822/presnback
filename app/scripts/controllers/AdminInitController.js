angular.module('app').controller('AdminInitController', function($scope, AdminService, UserService) {
	$scope.refresh = function() {
		UserService.listGroup().then(function(resp) {
			if(resp.status == 'ok') {
				$scope.table = resp.groups;
			}
		});
	};

	$scope.doInitGroup = function(num) {
		num = parseInt(num);
		if(isNaN(num)) {
			$scope.groupMessage = '請輸入組別數目。';
			return;
		}
		AdminService.initGroup(num).then(function(resp) {
			$scope.groupMessage = '初始化完成。';
			$scope.refresh();
		});
	};

	$scope.doInitFeedback = function(table) {
		AdminService.initFeedback($scope.table).then(function(resp) {
			$scope.feedbackMessage = '初始化完成。';
			$scope.refresh();
		});
	};

	$scope.table = [];
	$scope.groupMessage = '';
	$scope.feedbackMessage = '';

	$scope.refresh();
});