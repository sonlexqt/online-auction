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
		.when('/register', {
			templateUrl: 'templates/register.html'
		})
		.when('/sign-in', {
			templateUrl: 'templates/sign-in.html'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);