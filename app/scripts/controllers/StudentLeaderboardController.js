angular.module('app').controller('StudentLeaderboardController', function($scope, FeedbackService, SPECIAL_DESC) {
	$scope.leaderboard = { a: [], b: [], c: [], d: [], total: [] };

	FeedbackService.leaderboard('a').then(function(resp) {
		$scope.leaderboard.a = resp.leaderboard;
	});
	FeedbackService.leaderboard('b').then(function(resp) {
		$scope.leaderboard.b = resp.leaderboard;
	});
	FeedbackService.leaderboard('c').then(function(resp) {
		$scope.leaderboard.c = resp.leaderboard;
	});
	FeedbackService.leaderboard('d').then(function(resp) {
		$scope.leaderboard.d = resp.leaderboard;
	});
	FeedbackService.leaderboard('total').then(function(resp) {
		$scope.leaderboard.total = resp.leaderboard;
	});

	$scope.specialDesc = SPECIAL_DESC;

});