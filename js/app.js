var dkmhApp = angular.module('dkmhApp', [
	'firebase',
	'ngRoute',
	'dkmhApp.Services',
	'dkmhApp.Filters',
	'dkmhApp.Controllers',
	'dkmhApp.Directives',
	'timer',
	'angular-filepicker'
]);

dkmhApp.constant('CONSTANTS', (function() {
	return {
		FIREBASE_REF : 'https://ass1-ec-online-auction.firebaseio.com'
	}
})());

dkmhApp.config(['$routeProvider', '$locationProvider', 'filepickerProvider', function($routeProvider, $locationProvider, filepickerProvider){
	filepickerProvider.setKey('AuTMB8HLQteT89VQVQvguz');
	
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});

	$routeProvider
		.when('/', {
			templateUrl: 'templates/active-bids.html'
		})
		.when('/expired-bids', {
			templateUrl: 'templates/expired-bids.html'
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