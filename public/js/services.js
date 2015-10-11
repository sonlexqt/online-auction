var servicesModule = angular.module('dkmhApp.Services', []);

servicesModule.factory("AuthService", ["$firebaseAuth", '$rootScope', '$location', function($firebaseAuth, $rootScope, $location){
    var ref = new Firebase('https://dkmh-online-auction.firebaseio.com');
    var firebaseAuth = $firebaseAuth(ref);

    var _register = function(registerEmail, registerPassword){
        firebaseAuth.$createUser({
            email: registerEmail,
            password: registerPassword
        }).then(function(userData) {
            $rootScope.successMsg = 'Done creating new user !';
            $rootScope.errorMsg = null;
            _signIn(registerEmail, registerPassword);
        }).catch(function(error) {
            $rootScope.successMsg = null;
            $rootScope.errorMsg = error;
        });
    };

    var _signIn = function(registerEmail, registerPassword){
        firebaseAuth.$authWithPassword({
            email: registerEmail,
            password: registerPassword
        }).then(function(user) {
            $rootScope.currentUser = {
                email: user.password.email,
                uid: user.auth.uid
            };
            $rootScope.errorMsg = null;
            $rootScope.successMsg = null;
            $location.path('/');
        }, function(error) {
            $rootScope.successMsg = null;
            $rootScope.errorMsg = error;
        });
    };

    var _signOut = function(){
        firebaseAuth.$unauth();
        $rootScope.currentUser = null;
        $rootScope.errorMsg = null;
        $rootScope.successMsg = null;
    };

    return {
        register: _register,
        signIn: _signIn,
        signOut: _signOut
    }
}]);