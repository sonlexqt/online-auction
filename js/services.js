var servicesModule = angular.module('dkmhApp.Services', []);

servicesModule.factory("AuthService", ["$firebaseAuth", '$rootScope', '$location', '$firebaseObject', function($firebaseAuth, $rootScope, $location, $firebaseObject){
    var ref = new Firebase('https://ass1-ec-online-auction.firebaseio.com');
    var firebaseAuth = $firebaseAuth(ref);

    var _register = function(registerEmail, registerPassword, registerRetypePassword){
        if (registerPassword !== registerRetypePassword) {
            swal({
                title: 'Error',
                text: 'Passwords Missmatch!',
                type: 'error'
            });
            console.log('a');
            return;
        }
        $rootScope.loadingMessage = 'Creating new user';
        firebaseAuth.$createUser({
            email: registerEmail,
            password: registerPassword
        }).then(function(userData) {
            $rootScope.loadingMessage = null;
            swal({
                title: 'Success',
                text: 'Created new user!',
                type: 'success'
            }, function() {
                _signIn(registerEmail, registerPassword, true);
            });
        }).catch(function(error) {
            $rootScope.loadingMessage = null;
            swal({
                title: 'Error',
                text: JSON.stringify(error),
                type: 'error'
            });
        });
    };

    var _signIn = function(registerEmail, registerPassword, isNewlyCreatedUser){
        $rootScope.loadingMessage = 'Signing In';
        console.log('Signing In');
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
            $rootScope.loadingMessage = null;
            $location.path('/');
        }, function(error) {
            $rootScope.loadingMessage = null;
            swal({
                title: 'Error',
                text: JSON.stringify(error),
                type: 'error'
            });
        });
    };

    var _signOut = function(){
        firebaseAuth.$unauth();
        $rootScope.currentUser = null;
        $location.path('/');
    };

    return {
        register: _register,
        signIn: _signIn,
        signOut: _signOut
    }
}]);