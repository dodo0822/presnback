var moment = require('moment');

moment.locale('zh-tw');

angular.module('app').controller('AdminFeedbackController', function(FeedbackService, UserService, $scope) {
	$scope.list = [];
	$scope.users = [];
	$scope.moment = moment;
	$scope.editId = -1;

	$scope.condFrom = '-1';
	$scope.condTo = '-1';

	$scope.condition = {};

	$scope.applyCondition = function() {
		$scope.condition = {};
		if($scope.condFrom != -1) {
			$scope.condition.from = $scope.users[$scope.condFrom]._id;
		}
		if($scope.condTo != -1) {
			$scope.condition.to = $scope.users[$scope.condTo]._id;
		}
		$scope.reload();
	};

	$scope.remove = function(idx) {
		var f = $scope.list[idx];
		if(confirm('確定要移除這則評分？')) {
			FeedbackService.remove(f._id).then(function(resp) {
				if(resp.status == 'ok') $scope.reload();
			});
		}
	};

	$scope.edit = function(idx) {
		$scope.editContent = $scope.list[idx].content;
		$scope.editId = $scope.list[idx]._id;
	};

	$scope.doEdit = function(content) {
		$scope.editContent = content;
		FeedbackService.edit($scope.editId, $scope.editContent).then(function(resp) {
			if(resp.status == 'ok') {
				$scope.editId = -1;
				$scope.reload();
			}
		});
	};

	$scope.cancelEdit = function() {
		$scope.editId = -1;
	};

	$scope.reload = function() {
		FeedbackService.list($scope.condition).then(function(resp) {
			if(resp.status == 'ok') {
				$scope.list = resp.feedback;
			}
		});
	};

	UserService.list().then(function(resp) {
		$scope.users = resp.users;
	});

	$scope.reload();
});