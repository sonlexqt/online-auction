var controllersModule = angular.module('dkmhApp.Controllers', []);

controllersModule.controller('DKMHAppController', ['$scope', '$rootScope', 'AuthService',
    function($scope, $rootScope, AuthService) {
        $scope.doSignOut = function() {
            AuthService.signOut();
        }
    }
]);

controllersModule.controller('RegisterController', ['$scope', 'AuthService', function($scope, AuthService) {
    $scope.doRegister = function() {
        AuthService.register($scope.registerEmail, $scope.registerPassword, $scope.registerRetypePassword);
    }
}]);

controllersModule.controller('SignInController', ['$scope', 'AuthService', function($scope, AuthService) {
    $scope.doSignIn = function() {
        AuthService.signIn($scope.signInEmail, $scope.signInPassword, false);
    }
}]);

controllersModule.controller('MyItemsController', ['$scope', '$rootScope', '$firebaseArray', function($scope, $rootScope, $firebaseArray) {
    var firebaseRef = new Firebase('https://ass1-ec-online-auction.firebaseio.com');

    $scope.myItems = $firebaseArray(firebaseRef.child('items').orderByChild("ownerId").equalTo($rootScope.currentUser.uid));
}]);

controllersModule.controller('NewItemController', ['$scope', '$rootScope', '$firebaseArray', 'filepickerService', function($scope, $rootScope, $firebaseArray, filepickerService) {
    var firebaseRef = new Firebase('https://ass1-ec-online-auction.firebaseio.com');
    $scope.pickImage = function() {
        filepickerService.pick({
                mimetype: 'image/*',
                services: ['COMPUTER']
            },
            function(result) {
                $scope.itemImage = result.url;
                console.log($scope.itemImage);
                $scope.$apply();
            }
        );
    };

    $scope.addNewItem = function() {
        var expiredDate = new Date($scope.itemExpiredDate).getTime();
        var item = {
            name: $scope.itemName,
            description: $scope.itemDescription,
            image: $scope.itemImage,
            // category: $scope.itemCategory,
            startDate: Date.now(),
            expiredDate: expiredDate,
            startingPrice: $scope.itemStartingPrice,
            currentPrice: $scope.itemStartingPrice,
            ownerId: $rootScope.currentUser.uid,
            ownerEmail: $rootScope.currentUser.email,
            status: 'active'
        };
        $firebaseArray(firebaseRef.child('items')).$add(item).then(function(ref) {
            $scope.itemName = '';
            $scope.itemDescription = '';
            $scope.itemImage = '';
            $scope.itemStartingPrice = '';
            $scope.itemExpiredDate = '';
            swal({
                title: 'Success',
                text: 'Your new item is ready for bidding!',
                type: 'success',
            });
        });
    };
}]);

controllersModule.controller('MainController', ['$scope', '$rootScope', '$firebaseArray', '$location', function($scope, $rootScope, $firebaseArray, $location) {
    var firebaseRef = new Firebase('https://ass1-ec-online-auction.firebaseio.com');

    $scope.allItems = $firebaseArray(firebaseRef.child('items').orderByChild("expiredDate"));

    $scope.loadingItems = true;

    $scope.allItems.$loaded(function(data) {
        $scope.loadingItems = false;
    });
    $scope.setCurrentItem = function(itemId, itemName, itemNewPrice, itemCurrentPrice) {
        if (!$rootScope.currentUser) {
            swal({
                title: 'Not signed-in',
                text: 'Please sign in before bidding for items !',
                type: 'error'
            }, function() {
                $rootScope.$apply(function() {
                    $location.path('/sign-in');
                });
            });
        } else if (!itemNewPrice) {
            swal({
                title: 'Invalid Value',
                text: 'Please enter a valid value!',
                type: 'error'
            });
        } else if (itemNewPrice > $rootScope.currentUser.balance) {
            swal({
                title: 'Not enough budget',
                text: 'Please deposit before continuing!',
                type: 'error'
            });
        } else if (itemNewPrice <= itemCurrentPrice) {
            swal({
                title: 'Invalid value',
                text: 'Please bid a value greater than current item price!',
                type: 'error'
            });
        } else {
            $scope.currentItem = {
                id: itemId,
                name: itemName,
                value: itemNewPrice
            };
            swal({
                title: "Are you sure?",
                text: 'Submit bid for <b>' + $scope.currentItem.name + '</b> for <b>$' + $scope.currentItem.value + '</b>?',
                type: 'info',
                showCancelButton: true,
                // confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, Place my Bid!",
                closeOnConfirm: false,
                html: true,
            }, function() {
                $scope.submitBid();
                swal({
                    title: 'Success',
                    text: 'Your bid has been placed!',
                    type: 'success'
                });
            });
        }

    };

    $scope.submitBid = function() {
        firebaseRef.child('items').child($scope.currentItem.id).update({
            currentPrice: $scope.currentItem.value,
            currentBuyerId: $rootScope.currentUser.uid,
            currentBuyerEmail: $rootScope.currentUser.email
        });
        // $scope.$apply();
    };
}]);

controllersModule.controller('DepositController', ['$scope', '$rootScope', function($scope, $rootScope) {
    var firebaseRef = new Firebase('https://ass1-ec-online-auction.firebaseio.com');

    $scope.updateDeposit = function() {
        var newBalance = $rootScope.currentUser.balance + $scope.depositAmount;
        firebaseRef.child('users').child($rootScope.currentUser.uid).update({
            balance: newBalance
        }, function(err) {
            if (err) {
                $rootScope.errorMsg = err;
            } else {
                $rootScope.successMsg = 'Deposit successfully !';
                $scope.depositAmount = '';
            }
        });
    };
}]);
