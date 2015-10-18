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

controllersModule.controller('MyItemsController', ['$scope', '$rootScope', '$firebaseArray', 'CONSTANTS', function($scope, $rootScope, $firebaseArray, CONSTANTS) {
    var firebaseRef = new Firebase(CONSTANTS.FIREBASE_REF);

    $scope.myItems = $firebaseArray(firebaseRef.child('items').orderByChild("ownerId").equalTo($rootScope.currentUser.uid));
}]);

controllersModule.controller('NewItemController', ['$scope', '$rootScope', '$firebaseArray', 'filepickerService', 'CONSTANTS', function($scope, $rootScope, $firebaseArray, filepickerService, CONSTANTS) {
    var firebaseRef = new Firebase(CONSTANTS.FIREBASE_REF);
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
        $rootScope.loadingMessage = 'Adding new item';
        $firebaseArray(firebaseRef.child('items')).$add(item).then(function(ref) {
            $scope.itemName = '';
            $scope.itemDescription = '';
            $scope.itemStartingPrice = '';
            $scope.itemExpiredDate = '';
            $scope.itemImage = '';
            $rootScope.loadingMessage = null;
            swal({
                title: 'Success',
                text: 'Your new item is ready for bidding!',
                type: 'success'
            });
        });
    };
}]);

controllersModule.controller('MainController', ['$scope', '$rootScope', '$firebaseArray', '$location', '$timeout', 'CONSTANTS', '$firebaseObject', function($scope, $rootScope, $firebaseArray, $location, $timeout, CONSTANTS, $firebaseObject) {
    var firebaseRef = new Firebase(CONSTANTS.FIREBASE_REF);

    $scope.allItems = $firebaseArray(firebaseRef.child('items').orderByChild("expiredDate"));

    $rootScope.loadingMessage = 'Loading item list';

    $scope.allItems.$loaded(function(data) {
        $rootScope.loadingMessage = null;
        $timeout(function() {
            // TODO need to detect precisely when the DOM is fully rendered
            $(".scroll-wheel").jCarouselLite({
                mouseWheel: true,
                speed: 500,
                circular: false,
            });
            $(".info-button").on("click", function() {
                if ($(this).parent().parent().find(".flipper").css("transform") == "none")
                    $(this).parent().parent().find(".flipper").css({"transform": "rotateY(180deg)"});
                else
                    $(this).parent().parent().find(".flipper").css({"transform": "none"});
            });
            $(".card").mouseout(function() {
                $(this).find('.flipper').css({"transform": "none"});
            })
        });
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
                html: true
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
    };

    $scope.moveToExpired = function(itemId){
        // TODO need a better way to retrieve the about-to-expired item
        var itemToBeExpired = null;
        for (var i = 0; i<$scope.allItems.length; i++){
            if ($scope.allItems[i].$id == itemId){
                itemToBeExpired = $scope.allItems[i];
                break;
            }
        }
        if (itemToBeExpired.status == 'active' && itemToBeExpired.currentBuyerId && !itemToBeExpired.isProcessing && !itemToBeExpired.isFinished){
            // TODO XIN
            console.log('Current item price: ' + itemToBeExpired.currentPrice);
            var currentBuyerId = itemToBeExpired.currentBuyerId;
            var ownerId = itemToBeExpired.ownerId;
            // Check if currentBuyerId's balance is more than current item price
            firebaseRef.child('items').child(itemId).update({
                isProcessing: true
            }, function(err){
                if (err) console.error(err);
                var buyerObject = $firebaseObject(firebaseRef.child('users').child(currentBuyerId));
                buyerObject.$loaded(function(data){
                    if (buyerObject.balance > itemToBeExpired.currentPrice){
                        // Update item status to 'expired'
                        firebaseRef.child('items').child(itemId).update({
                            status: 'expired'
                        }, function(err){
                            if (err) console.error(err);
                            else {
                                var ownerObject= $firebaseObject(firebaseRef.child('users').child(ownerId));
                                ownerObject.$loaded(function(data){
                                    var newOwnerBalance = ownerObject.balance + itemToBeExpired.currentPrice;
                                    // TODO XIN
                                    console.log('oldOwnerBalance: ' + ownerObject.balance);
                                    console.log('newOwnerBalance: ' + newOwnerBalance);
                                    firebaseRef.child('users').child(ownerId).update({
                                        balance: newOwnerBalance
                                    }, function (err){
                                        if (err) console.error(err);
                                        else {
                                            var newBuyerBalance = buyerObject.balance - itemToBeExpired.currentPrice;
                                            // TODO XIN
                                            console.log('oldBuyerBalance: ' + buyerObject.balance);
                                            console.log('newBuyerBalance: ' + newBuyerBalance);
                                            firebaseRef.child('users').child(currentBuyerId).update({
                                                balance: newBuyerBalance
                                            }, function(err){
                                                if (err) console.error(err);
                                                firebaseRef.child('items').child(itemId).update({
                                                    isProcessing: false,
                                                    isFinished: true
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    } else {
                        // TODO handle this case: the buyer doesn't have enough funds
                    }
                });
            });
        }
    }
}]);

controllersModule.controller('DepositController', ['$scope', '$rootScope', 'CONSTANTS',function($scope, $rootScope, CONSTANTS) {
    var firebaseRef = new Firebase(CONSTANTS.FIREBASE_REF);

    $scope.updateDeposit = function() {
        var newBalance = $rootScope.currentUser.balance + $scope.depositAmount;
        $rootScope.loadingMessage = 'Topping-up your balance';
        firebaseRef.child('users').child($rootScope.currentUser.uid).update({
            balance: newBalance
        }, function(err) {
            if (err) {
                $rootScope.loadingMessage = null;
                swal({
                    title: 'Error',
                    text: JSON.stringify(error),
                    type: 'error'
                });
            } else {
                $rootScope.loadingMessage = null;
                swal({
                    title: 'Success',
                    text: 'Topped-up your balance!',
                    type: 'success'
                });
                $scope.depositAmount = '';
            }
        });
    };
}]);
