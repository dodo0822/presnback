angular.module('app').controller('StudentFeedbackGiveController', function($scope, Session, UserService, FeedbackService) {
	$scope.users = [];
	$scope.to = -1;
	$scope.content = '';
	$scope.message = '';

	$scope.select = function(idx) {
		$scope.to = idx;
		$scope.message = '';
	};

	$scope.give = function() {
		if(!$scope.content || $scope.to == -1) {
			$scope.message = '請輸入資料！';
			return;
		}
		var to = $scope.users[$scope.to]._id;
		FeedbackService.give(to, $scope.content).then(function(resp) {
			if(resp.status == 'ok') {
				$scope.message = '評分成功送出！';
			}
		});
	};

	UserService.list().then(function(resp) {
		var list = resp.users;
		for(var i = 0; i < list.length; ++i) {
			if(list[i]._id == Session.userId) {
				list.splice(i, 1);
				break;
			}
		}
		$scope.users = list;
	});
});