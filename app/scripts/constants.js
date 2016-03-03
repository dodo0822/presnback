angular.module('app').constant('AUTH_EVENTS', {
	restoreSuccess: 'auth-restore-success',
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	logoutSuccess: 'auth-logout-success',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
});