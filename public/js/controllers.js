var controllersModule = angular.module('dkmhApp.Controllers', []);

controllersModule.controller('DKMHAppController',
    ['$scope', '$rootScope', 'AuthService',
    function($scope, $rootScope, AuthService){
        $scope.doSignOut = function(){
            AuthService.signOut();
        }
    }]);

controllersModule.controller('RegisterController', ['$scope', 'AuthService', function($scope, AuthService){
    $scope.doRegister = function(){
        AuthService.register($scope.registerEmail, $scope.registerPassword);
    }
}]);

controllersModule.controller('SignInController', ['$scope', 'AuthService', function($scope, AuthService){
    $scope.doSignIn = function(){
        AuthService.signIn($scope.signInEmail, $scope.signInPassword);
    }
}]);