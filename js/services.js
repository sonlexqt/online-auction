var servicesModule = angular.module('dkmhApp.Services', []);

servicesModule.factory("AuthService", ["$firebaseAuth", '$rootScope', '$location', '$firebaseObject', function($firebaseAuth, $rootScope, $location, $firebaseObject){
    var ref = new Firebase('https://ass1-ec-online-auction.firebaseio.com');
    var firebaseAuth = $firebaseAuth(ref);

    var _register = function(registerEmail, registerPassword, registerRetypePassword){
        if (registerPassword !== registerRetypePassword) {
            swal({
                title: 'Invalid Value',
                text: 'Password Missmatch !',
                type: 'error'
            });
            return;
        }
        firebaseAuth.$createUser({
            email: registerEmail,
            password: registerPassword
        }).then(function(userData) {
            swal({
                title: 'Success',
                text: 'Done creating new user!',
                type: 'success'
            });
            _signIn(registerEmail, registerPassword, true);
        }).catch(function(error) {
            swal({
                title: 'Register Error',
                text: error,
                type: 'error'
            });
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
            $location.path('/');
        }, function(error) {
            swal({
                title: 'Sign In Error',
                text: error,
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