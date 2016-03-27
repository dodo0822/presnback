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
	'我到底聽了三小...',
	'還行還行',
	'你真的很棒！',
	'太神啦！！！跪了<(_ _)>'])
.constant('SPECIAL_DESC', {
	a: '肢體語言',
	b: '簡報用心',
	c: '超有梗'
});