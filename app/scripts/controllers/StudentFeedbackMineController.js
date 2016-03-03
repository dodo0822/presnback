var moment = require('moment');

moment.locale('zh-tw');

angular.module('app').controller('StudentFeedbackMineController', function($scope, UserService, FeedbackService) {
	$scope.list = [];
	$scope.moment = moment;

	FeedbackService.mine().then(function(resp) {
		if(resp.status == 'ok') {
			$scope.list = resp.feedback;
		}
	});
});