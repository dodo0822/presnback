var tplAdmin = require('../views/admin.html');
var tplAdminInit = require('../views/admin.init.html');
var tplAdminUserList = require('../views/admin.userlist.html');
var tplAdminFeedback = require('../views/admin.feedback.html');
var tplStudent = require('../views/student.html');
var tplStudentFeedbackMine = require('../views/student.feedback.mine.html');
var tplStudentFeedbackGive = require('../views/student.feedback.give.html');
var tplLogin = require('../views/login.html');
var tplRegister = require('../views/register.html');

angular.module('app', [ 'ui.router', 'ngStorage' ]);

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
		});

	$urlRouterProvider.otherwise(function($injector) {
		var $state = $injector.get('$state');
		$state.go('home');
	});

})


.run(function($rootScope, $state) {
	$rootScope.$on('$stateChangeError', function(e, to, toParams, from, fromParams, error) {
		if(error.type === 'redirect') {
			$state.go(error.location);
		}
	});
});