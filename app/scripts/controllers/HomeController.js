angular.module('app').controller('HomeController', function($state, Session) {
	if(Session.type == 1) {
		$state.go('student.feedback.mine');
	} else {
		$state.go('admin');
	}
});