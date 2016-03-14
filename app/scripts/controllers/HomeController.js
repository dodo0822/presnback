angular.module('app').controller('HomeController', function($state, Session) {
	if(Session.type == 1) {
		$state.go('student.feedback.give');
	} else {
		$state.go('admin');
	}
});