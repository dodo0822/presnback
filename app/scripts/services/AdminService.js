angular.module('app').service('AdminService', function($http, Session) {

	return {

		init: function(num) {
			return $http.get('/api/admin/init', { params: {
				num: num,
				token: Session.token
			} }).then(function(resp) {
				return resp.data;
			});
		}

	};

});