angular.module('app').controller('StudentLeaderboardController', function($scope, FeedbackService) {
	$scope.leaderboard = { a: [], b: [], c: [] };

	FeedbackService.leaderboard('a').then(function(resp) {
		$scope.leaderboard.a = resp.leaderboard;
	});
	FeedbackService.leaderboard('b').then(function(resp) {
		$scope.leaderboard.b = resp.leaderboard;
	});
	FeedbackService.leaderboard('c').then(function(resp) {
		$scope.leaderboard.c = resp.leaderboard;
	});

});