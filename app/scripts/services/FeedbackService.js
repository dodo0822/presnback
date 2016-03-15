angular.module('app').service('FeedbackService', function($http, Session) {

	return {

		mine: function() {
			return $http.get('/api/feedback/mine', { params: {
				token: Session.token
			} }).then(function(resp) {
				return resp.data;
			});
		},

		lookup: function(to) {
			return $http.get('/api/feedback/lookup', { params: {
				to: to,
				token: Session.token
			} }).then(function(resp) {
				return resp.data;
			});
		},

		give: function(to, content, score) {
			return $http.post('/api/feedback/give', {
				token: Session.token,
				to: to,
				content: content,
				score: score
			}).then(function(resp) {
				return resp.data;
			});
		},

		list: function(condition) {
			var cond = {};
			if(condition.from) cond.from = condition.from;
			if(condition.to) cond.to = condition.to;
			return $http.post('/api/feedback/list', {
				token: Session.token,
				condition: cond
			}).then(function(resp) {
				return resp.data;
			});
		},

		remove: function(id) {
			return $http.get('/api/feedback/remove', { params: {
				token: Session.token,
				id: id
			} }).then(function(resp) {
				return resp.data;
			});
		},

		edit: function(id, content) {
			return $http.post('/api/feedback/edit', {
				token: Session.token,
				id: id,
				content: content
			}).then(function(resp) {
				return resp.data;
			});
		}

	};

});