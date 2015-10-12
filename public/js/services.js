var servicesModule = angular.module('dkmhApp.Services', []);

servicesModule.factory("AuthService", ["$firebaseAuth", '$rootScope', '$location', '$firebaseObject', function($firebaseAuth, $rootScope, $location, $firebaseObject){
    var ref = new Firebase('https://dkmh-online-auction.firebaseio.com');
    var firebaseAuth = $firebaseAuth(ref);

    var _register = function(registerEmail, registerPassword){
        firebaseAuth.$createUser({
            email: registerEmail,
            password: registerPassword
        }).then(function(userData) {
            $rootScope.successMsg = 'Done creating new user !';
            $rootScope.errorMsg = null;
            //ref.child("users").child(authData.uid).set({
            //    provider: authData.provider,
            //    name: getName(authData)
            //});
            _signIn(registerEmail, registerPassword, true);
        }).catch(function(error) {
            $rootScope.successMsg = null;
            $rootScope.errorMsg = error;
        });
    };

    var _signIn = function(registerEmail, registerPassword, isNewlyCreatedUser){
        firebaseAuth.$authWithPassword({
            email: registerEmail,
            password: registerPassword
        }).then(function(user) {
            if (isNewlyCreatedUser){
                ref.child('users').child(user.auth.uid).set({
                    uid: user.auth.uid,
                    email: user.password.email,
                    balance: 100 // initial balance
                });
            }
            $rootScope.currentUser = $firebaseObject(ref.child('users').child(user.auth.uid));
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