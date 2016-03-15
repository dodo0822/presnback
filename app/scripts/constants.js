angular.module('app')
.constant('AUTH_EVENTS', {
	restoreSuccess: 'auth-restore-success',
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	logoutSuccess: 'auth-logout-success',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})
.constant('SCORE_DESC', [
	'',
	'不確定我聽了什麼...',
	'有聽有懂。明天會更好！',
	'嗯～～不錯不錯！',
	'太神啦！！！']);