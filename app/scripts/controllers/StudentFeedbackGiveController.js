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
		var to = $scope.groups[$scope.to]._id;
		FeedbackService.give(to, $scope.content).then(function(resp) {
			if(resp.status == 'ok') {
				$scope.message = '評分成功送出！';
			}
		});
	};

	UserService.userProfile().then(function(profileResp) {
		UserService.listGroup().then(function(resp) {
			var list = resp.groups;
			for(var i = 0; i < list.length; ++i) {
				if(list[i].groupNum == profileResp.user.groupNum || !list[i].needsFeedback) {
					list.splice(i, 1);
					--i;
				}
			}
			console.log(list);
			$scope.groups = list;
		});
	});
});