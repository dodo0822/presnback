angular.module('app').service('UserService', function(AUTH_EVENTS, $http, $q, $rootScope, Session, $localStorage) {
	var userService = {

		list: function() {
			return $http.get('/api/user/list', { params: { token: Session.token } }).then(function(resp) {
				return resp.data;
			});
		},

		update: function(table) {
			return $http.post('/api/user/update', {
				table: table,
				token: Session.token
			}).then(function(resp) {
				return resp.data;
			});
		},

		login: function(username, password, type) {
			var promise;
			if(type == 1) {
				promise = $http.post('/api/user/login', {
					username: username,
					password: password
				}).then(function(resp) {
					return resp.data;
				});
				return promise;
			} else {
				promise = $http.post('/api/admin/login', {
					username: username,
					password: password
				}).then(function(resp) {
					return resp.data;
				});
				return promise;
			}
		},

		restore: function(token, type) {
			var promise;
			if(type == 1) {
				promise = $http.get('/api/user/profile', { params: {
					token: token
				} }).then(function(resp) {
					return resp.data;
				}, function(resp) {
					return resp.data;
				});
				return promise;
			} else {
				promise = $http.get('/api/admin/profile', { params: {
					token: token
				} }).then(function(resp) {
					return resp.data;
				}, function(resp) {
					return resp.data;
				});
				return promise;
			}
		},

		isAuthenticated: function(type) {
			if(type !== undefined) {
				return (!!Session.userId && Session.type == type);
			}
			return !!Session.userId;
		},

		checkAuth: function(type) {
			var deferred = $q.defer();
			if(userService.isAuthenticated()) {
				if(!userService.isAuthenticated(type)) {
					deferred.reject({ type: 'redirect', location: 'home', message: 'Access denied.' });
				} else {
					deferred.resolve();
				}
			} else if($localStorage.token) {
				userService.restore($localStorage.token, $localStorage.type).then(function(resp) {
					if(resp.status == 'error') {
						delete $localStorage.token;
						deferred.reject({ type: 'redirect', location: 'login', message: resp.message });
						return;
					}
					$rootScope.$broadcast(AUTH_EVENTS.restoreSuccess, resp.user);
					Session.create($localStorage.token, resp.user._id, $localStorage.type);
					if(type !== undefined && $localStorage.type != type) {
						deferred.reject({ type: 'redirect', location: 'home', message: 'Access denied.' });
					} else {
						deferred.resolve();
					}
				});
			} else {
				deferred.reject({ type: 'redirect', location: 'login', message: 'Please log in.' });
			}
			return deferred.promise;
		}
	};
	return userService;
});