angular.module('app').controller('StudentSettingsController', function($scope, UserService, Session) {
	$scope.passwordMessage = '';

	$scope.changePassword = function(pwData) {
		$scope.passwordMessage = '';
		if(!pwData.current || !pwData.n || !pwData.nRepeat) {
			$scope.passwordMessage = 'All fields must not left blank.';
			return;
		}
		if(pwData.n !== pwData.nRepeat) {
			$scope.passwordMessage = 'The new passwords don\'t match.';
			return;
		}
		UserService.changePassword(pwData.current, pwData.n).then(function(resp) {
			if(resp.status == 'error') {
				$scope.passwordMessage = resp.message;
				return;
			} else {
				$scope.passwordMessage = '密碼變更成功。';
				return;
			}
		});
	};
	$scope.Session = Session;
	$scope.host = window.location.host;
});