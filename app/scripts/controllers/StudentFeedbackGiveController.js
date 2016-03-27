angular.module('app').controller('StudentFeedbackGiveController', function($scope, Session, UserService, FeedbackService, SCORE_DESC, SPECIAL_DESC) {
	$scope.groups = [];
	$scope.to = -1;
	$scope.content = '';
	$scope.score = -1;
	$scope.message = '';
	$scope.topic = '';
	$scope.special = {
		a: false,
		b: false,
		c: false
	};

	$scope.scoreDesc = SCORE_DESC;
	$scope.specialDesc = SPECIAL_DESC;

	$scope.select = function(idx) {
		$scope.to = idx;
		$scope.message = '';
		$scope.score = -1;
		$scope.topic = $scope.groups[idx].topic;
		$scope.special = {
			a: false,
			b: false,
			c: false
		};

		FeedbackService.lookup($scope.groups[idx]._id).then(function(resp) {
			if(resp.found) {
				$scope.content = resp.feedback.content;
				$scope.score = resp.feedback.score;
				$scope.special = resp.feedback.special;
			} else {
				$scope.content = '';
				$scope.scope = -1;
				$scope.special = {
					a: false,
					b: false,
					c: false
				};
			}
		});
	};

	$scope.give = function() {
		if(!$scope.content || $scope.to == -1 || !($scope.score <= 4 && $scope.score >= 1)) {
			$scope.message = '請輸入資料！';
			return;
		}
		if(($scope.score == 4 || $scope.score == 1) && $scope.content.length < 20) {
			$scope.message = '請輸入至少 20 字的評分內容！';
			return;
		}
		var to = $scope.groups[$scope.to]._id;
		FeedbackService.give(to, $scope.content, $scope.score, $scope.special).then(function(resp) {
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
			$scope.groups = list;
		});
	});
});