var dkmhApp = angular.module('dkmhApp', [
	'firebase',
	'ngRoute',
	'dkmhApp.Services',
	'dkmhApp.Filters',
	'dkmhApp.Controllers',
	'dkmhApp.Directives'
]);

dkmhApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});

	$routeProvider
		.when('/', {
			templateUrl: 'templates/main.html'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);