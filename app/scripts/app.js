var tplAdmin = require('../views/admin.html');
var tplAdminInit = require('../views/admin.init.html');
var tplAdminUserList = require('../views/admin.userlist.html');
var tplAdminFeedback = require('../views/admin.feedback.html');
var tplStudent = require('../views/student.html');
var tplStudentLeaderboard = require('../views/student.leaderboard.html');
var tplStudentFeedbackMine = require('../views/student.feedback.mine.html');
var tplStudentFeedbackGive = require('../views/student.feedback.give.html');
var tplStudentSettings = require('../views/student.settings.html');
var tplStudentChat = require('../views/student.chat.html');
var tplLogin = require('../views/login.html');
var tplRegister = require('../views/register.html');
var tplFbRegister = require('../views/fbRegister.html');

angular.module('app', [ 'ui.router', 'ngStorage', 'angular-loading-bar', 'ezfb', 'luegg.directives', 'growlNotifications', 'ngAnimate', 'ui.bootstrap' ]);

require('./constants');
require('./controllers/controllers');
require('./services/services');

angular.module('app')
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	var checkAuth = function(type) {
		return {
			protected: [ 'UserService', '$q', function(UserService, $q) {
				return UserService.checkAuth(type);
			} ]
		};
	};

	$stateProvider
		.state('home', {
			url: '/home',
			controller: 'HomeController',
			resolve: checkAuth()
		})
		.state('student', {
			url: '/student',
			templateUrl: tplStudent,
			controller: 'StudentController',
			resolve: checkAuth(1)
		})
		.state('student.feedback', {
			abstract: true,
			template: '<div ui-view></div>',
			url: '/feedback'
		})
		.state('student.feedback.mine', {
			url: '/mine',
			templateUrl: tplStudentFeedbackMine,
			controller: 'StudentFeedbackMineController',
			resolve: checkAuth(1)
		})
		.state('student.feedback.give', {
			url: '/give',
			templateUrl: tplStudentFeedbackGive,
			controller: 'StudentFeedbackGiveController',
			resolve: checkAuth(1)
		})
		.state('student.settings', {
			url: '/settings',
			templateUrl: tplStudentSettings,
			controller: 'StudentSettingsController',
			resolve: checkAuth(1)
		})
		.state('student.leaderboard', {
			url: '/leaderboard',
			templateUrl: tplStudentLeaderboard,
			controller: 'StudentLeaderboardController',
			resolve: checkAuth(1)
		})
		.state('student.chat', {
			url: '/chat',
			templateUrl: tplStudentChat,
			controller: 'StudentChatController',
			resolve: checkAuth(1)
		})
		.state('admin', {
			url: '/admin',
			templateUrl: tplAdmin,
			controller: 'AdminController',
			resolve: checkAuth(2)
		})
		.state('admin.init', {
			url: '/init',
			templateUrl: tplAdminInit,
			controller: 'AdminInitController',
			resolve: checkAuth(2)
		})
		.state('admin.userlist', {
			url: '/userlist',
			templateUrl: tplAdminUserList,
			controller: 'AdminUserListController',
			resolve: checkAuth(2)
		})
		.state('admin.feedback', {
			url: '/feedback',
			templateUrl: tplAdminFeedback,
			controller: 'AdminFeedbackController',
			resolve: checkAuth(2)
		})
		.state('login', {
			url: '/login',
			templateUrl: tplLogin,
			controller: 'LoginController'
		})
		.state('register', {
			url: '/register',
			templateUrl: tplRegister,
			controller: 'RegisterController'
		})
		.state('fbRegister', {
			url: '/fbRegister',
			templateUrl: tplFbRegister,
			controller: 'FbRegisterController'
		});

	$urlRouterProvider.otherwise(function($injector) {
		var $state = $injector.get('$state');
		$state.go('home');
	});

})

.config(function(ezfbProvider) {
	ezfbProvider.setLocale('zh_TW');
	ezfbProvider.setInitParams({
		appId: 1582033655448135
	});
})


.run(function($rootScope, $state, $location) {
	$rootScope.$on('$stateChangeError', function(e, to, toParams, from, fromParams, error) {
		if(error.type === 'redirect') {
			$state.go(error.location);
		}
	});
});
