var dkmhApp = angular.module('dkmhApp', [
	'firebase',
	'ngRoute',
	'dkmhApp.Services',
	'dkmhApp.Filters',
	'dkmhApp.Controllers',
	'dkmhApp.Directives',
	'timer'
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
		.when('/sign-up', {
			templateUrl: 'templates/sign-up.html'
		})
		.when('/sign-in', {
			templateUrl: 'templates/sign-in.html'
		})
		.when('/my-items', {
			templateUrl: 'templates/my-items.html'
		})
		.when('/new-item', {
			templateUrl: 'templates/new-item.html'
		})
		.when('/history', {
			templateUrl: 'templates/history.html'
		})
		.when('/top-up', {
			templateUrl: 'templates/top-up.html'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);