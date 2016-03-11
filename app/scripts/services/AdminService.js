angular.module('app').service('AdminService', function($http, Session) {

	return {

		initGroup: function(num) {
			return $http.get('/api/admin/initGroup', { params: {
				num: num,
				token: Session.token
			} }).then(function(resp) {
				return resp.data;
			});
		},

		initFeedback: function(table) {
			return $http.post('/api/admin/initFeedback', {
				table: table,
				token: Session.token
			}).then(function(resp) {
				return resp.data;
			});
		}

	};

});