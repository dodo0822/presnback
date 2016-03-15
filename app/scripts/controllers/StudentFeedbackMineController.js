var moment = require('moment');

moment.locale('zh-tw');

angular.module('app').controller('StudentFeedbackMineController', function($scope, UserService, FeedbackService, SCORE_DESC) {
	$scope.list = [];
	$scope.moment = moment;

	$scope.scoreDesc = SCORE_DESC;

	FeedbackService.mine().then(function(resp) {
		if(resp.status == 'ok') {
			$scope.list = resp.feedback;
		}
	});
});