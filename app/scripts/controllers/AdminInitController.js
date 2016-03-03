angular.module('app').controller('AdminInitController', function($scope, AdminService) {
	$scope.doInit = function() {
		var num = $scope.groupNum;
		num = parseInt(num);
		if(isNaN(num)) {
			$scope.message = '請輸入組別數目。';
			return;
		}
		AdminService.init(num).then(function(resp) {
			$scope.message = '初始化完成。';
		});
	};

	$scope.message = '';
});