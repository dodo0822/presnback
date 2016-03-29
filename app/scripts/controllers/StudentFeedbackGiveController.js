angular.module('app').controller('StudentFeedbackGiveController', function($rootScope, $scope, Session, UserService, FeedbackService, SCORE_DESC, SPECIAL_DESC, CHAT_EVENTS) {
	$scope.groups = [];
	$scope.to = -1;
	$scope.content = '';
	$scope.scores = {
		a: -1,
		b: -1,
		c: -1,
		d: -1
	};
	$scope.message = '';
	$scope.topic = '';

	$scope.scoreDesc = SCORE_DESC;
	$scope.specialDesc = SPECIAL_DESC;

	$scope.select = function(idx) {
		$scope.to = idx;
		$scope.message = '';
		$scope.scores = {
			a: -1,
			b: -1,
			c: -1,
			d: -1
		};
		$scope.topic = $scope.groups[idx].topic;

		FeedbackService.lookup($scope.groups[idx]._id).then(function(resp) {
			if(resp.found) {
				$scope.content = resp.feedback.content;
				$scope.scores = resp.feedback.scores;
			} else {
				$scope.content = '';
				$scope.scores = {
					a: -1,
					b: -1,
					c: -1,
					d: -1
				};
			}
		});
	};

	$scope.give = function() {
		if(!$scope.content || $scope.to == -1) {
			$scope.message = '請輸入資料！';
			return;
		}
		if(!($scope.scores.a >= 1 && $scope.scores.a <= 4)) {
			$scope.message = '資料不合法！';
			return;
		}
		if(!($scope.scores.b >= 1 && $scope.scores.b <= 4)) {
			$scope.message = '資料不合法！';
			return;
		}

		if(!($scope.scores.c >= 1 && $scope.scores.c <= 4)) {
			$scope.message = '資料不合法！';
			return;
		}

		if(!($scope.scores.d >= 1 && $scope.scores.d <= 4)) {
			$scope.message = '資料不合法！';
			return;
		}

		var to = $scope.groups[$scope.to]._id;
		FeedbackService.give(to, $scope.content, $scope.scores).then(function(resp) {
			if(resp.status == 'ok') {
				$scope.message = '評分成功送出！';
				$rootScope.$broadcast(CHAT_EVENTS.newMessage, { type: 2 });
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
