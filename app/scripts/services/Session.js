angular.module('app').service('Session', function($localStorage){
	this.create = function(token, userId, type){
		this.token = token;
		this.userId = userId;
		this.type = type;
		$localStorage.token = token;
		$localStorage.type = type;
	};
	this.destroy = function(){
		this.token = null;
		this.userId = null;
		this.type = null;
		delete $localStorage.token;
		delete $localStorage.type;
	};
	return this;
});