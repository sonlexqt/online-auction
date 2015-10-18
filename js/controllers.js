var controllersModule = angular.module('dkmhApp.Controllers', []);
// var loaded = false;
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

    $scope.myActiveItems = $firebaseArray(firebaseRef.child('active-items').orderByChild("ownerId").equalTo($rootScope.currentUser.uid));

    $scope.myExpiredItems = $firebaseArray(firebaseRef.child('expired-items').orderByChild("ownerId").equalTo($rootScope.currentUser.uid));
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
            ownerEmail: $rootScope.currentUser.email
        };
        $rootScope.loadingMessage = 'Adding new item';
        $firebaseArray(firebaseRef.child('active-items')).$add(item).then(function(ref) {
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

controllersModule.controller('ExpiredBidsController', ['$scope', '$rootScope', '$firebaseArray', 'CONSTANTS', '$timeout',function($scope, $rootScope, $firebaseArray, CONSTANTS, $timeout){
    var firebaseRef = new Firebase(CONSTANTS.FIREBASE_REF);

    $scope.allExpiredItems = $firebaseArray(firebaseRef.child('expired-items').orderByChild("expiredDate"));

    $rootScope.loadingMessage = 'Loading item list';

    $scope.allExpiredItems.$loaded(function(data) {
        $rootScope.loadingMessage = null;
        $timeout(function() {
            // TODO need to detect precisely when the DOM is fully rendered
            $(".scroll-wheel").jCarouselLite({
                mouseWheel: true,
                speed: 500,
                circular: false
            });
            $(".info-button").on("click", function() {
                if ($(this).parent().parent().find(".flipper").css("transform") == "none"){
                    $(this).parent().parent().find(".flipper").css({"transform": "rotateY(180deg)"});
                    $(this).parent().parent().find(".bid-btn").css({"transform": "rotateY(180deg)"});
                }
                else{
                    $(this).parent().parent().find(".flipper").css({"transform": "none"});
                    $(this).parent().parent().find(".bid-btn").css({"transform": "none"});
                }
            });
            $(".card").mouseout(function() {
                $(this).find('.flipper').css({"transform": "none"});
                $(this).find('.bid-btn').css({"transform": "none"});
            })
        });
});
// <<<<<<< HEAD
//     $scope.allItems.$watch(function(event) {
//         console.log(event.event)
//         // $scope.$apply();
//         // if (event.event != "child_added") {
//             // $timeout(function() {
//             //     $(".scroll-wheel").jCarouselLite({
//             //         mouseWheel: true,
//             //         speed: 500,
//             //         circular: false,
//             //     });
//             //     $(".info-button").on("click", function() {
//             //         debugger;
//             //         if ($(this).parent().parent().find(".flipper").css("transform") == "none")
//             //             $(this).parent().parent().find(".flipper").css({"transform": "rotateY(180deg)"});
//             //         else
//             //             $(this).parent().parent().find(".flipper").css({"transform": "none"});
//             //     });
//             //     $(".card").mouseout(function() {
//             //         $(this).find('.flipper').css({"transform": "none"});
//             //     })
//             // }, 5000);
//         // }

// =======
}]);

controllersModule.controller('ActiveBidsController', ['$scope', '$rootScope', '$firebaseArray', '$location', '$timeout', 'CONSTANTS', '$firebaseObject', function($scope, $rootScope, $firebaseArray, $location, $timeout, CONSTANTS, $firebaseObject) {
    var firebaseRef = new Firebase(CONSTANTS.FIREBASE_REF);

    $scope.allActiveItems = $firebaseArray(firebaseRef.child('active-items').orderByChild("expiredDate"));

    $rootScope.loadingMessage = 'Loading item list';

    $scope.allActiveItems.$loaded(function (data) {
        $rootScope.loadingMessage = null;

        // When a user login, do a check to all of the currently active items to get the expired ones
        var itemsIdToBeExpired = [];
        for (var i = 0; i < $scope.allActiveItems.length; i++){
            if ($scope.allActiveItems[i].expiredDate < Date.now()){
                itemsIdToBeExpired.push($scope.allActiveItems[i].$id);
            }
        }
        // ... and move them to the 'expired_items' collection
        for (var i = 0; i < itemsIdToBeExpired.length; i++){
            $scope.moveToExpired(itemsIdToBeExpired[i]);
        }

        $timeout(function () {
            // TODO need to detect precisely when the DOM is fully rendered
            $(".scroll-wheel").jCarouselLite({
                mouseWheel: true,
                speed: 500,
                circular: false
            });
            $(".info-button").on("click", function () {
                if ($(this).parent().parent().find(".flipper").css("transform") == "none"){
                    $(this).parent().parent().find(".flipper").css({"transform": "rotateY(180deg)"});
                    $(this).parent().parent().find(".bid-btn").css({"transform": "rotateY(180deg)"});
                }
                else {
                    $(this).parent().parent().find(".flipper").css({"transform": "none"});
                    $(this).parent().parent().find(".bid-btn").css({"transform": "none"});
                }
                    
            });
            $(".card").mouseout(function () {
                $(this).find('.flipper').css({"transform": "none"});
                $(this).find(".bid-btn").css({"transform": "none"});
            })
        });
        loaded = true;
// >>>>>>> 3893ff74152c17c401eeefd19f8b9d5aa8832d8e
});
// $scope.allActiveItems.$watch(function(event) {
       // $scope.$apply();
    // $timeout(function() {
        // if (event.event == "child_added" && loaded == true) {
        //     // debugger;
        //     console.log("zozo")
        //     $(".scroll-wheel").jCarouselLite({
        //         mouseWheel: true,
        //         speed: 500,
        //         circular: false
        //     });
        //     $(".info-button").on("click", function() {
        //         if ($(this).parent().parent().find(".flipper").css("transform") == "none"){
        //             $(this).parent().parent().find(".flipper").css({"transform": "rotateY(180deg)"});
        //             $(this).parent().parent().find(".bid-btn").css({"transform": "rotateY(180deg)"});
        //         }
        //         else {
        //             $(this).parent().parent().find(".flipper").css({"transform": "none"});
        //             $(this).parent().parent().find(".bid-btn").css({"transform": "none"});
        //         }
        //     });
        //     $(".card").mouseout(function() {
        //         $(this).find('.flipper').css({"transform": "none"});
        //         $(this).find(".bid-btn").css({"transform": "none"});
        //     })
        // }

    // }, 1500);
   // });
$scope.setCurrentItem = function (itemId, itemName, itemNewPrice, itemCurrentPrice) {
    if (!$rootScope.currentUser) {
        swal({
            title: 'Not signed-in',
            text: 'Please sign in before bidding for items !',
            type: 'error'
        }, function () {
            $rootScope.$apply(function () {
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
            }, function () {
                $scope.submitBid();
                swal({
                    title: 'Success',
                    text: 'Your bid has been placed!',
                    type: 'success'
                });
            });
    }

};

$scope.submitBid = function () {
    firebaseRef.child('active-items').child($scope.currentItem.id).update({
        currentPrice: $scope.currentItem.value,
        currentBuyerId: $rootScope.currentUser.uid,
        currentBuyerEmail: $rootScope.currentUser.email
    });
};

// <<<<<<< HEAD
// $scope.moveToExpired = function (itemId) {
//         // TODO need a better way to retrieve the about-to-expired item
// =======
    $scope.moveToExpired = function (itemId) {
        // TODO need a better way to retrieve the itemToBeExpired
// >>>>>>> 5e91e5083225d0190802b6c54e5f0b7226c386d5
        var itemToBeExpired = null;
        for (var i = 0; i < $scope.allActiveItems.length; i++) {
            if ($scope.allActiveItems[i].$id == itemId) {
                itemToBeExpired = $scope.allActiveItems[i];
                break;
            }
        }
        // Case I: No one bid for this item
        if (!itemToBeExpired.currentBuyerId && !itemToBeExpired.isProcessing){
            firebaseRef.child('active-items').child(itemId).update({
                isProcessing: true
            }, function (err) {
                firebaseRef.child('active-items').child(itemId).remove(function (err) {
                    if (err) console.error(err);
                    // Remove some firebase's keys
                    var newExpiredItem = itemToBeExpired;
                    delete newExpiredItem["__proto__"];
                    delete newExpiredItem["$id"];
                    delete newExpiredItem["$$hashKey"];
                    delete newExpiredItem["$priority"];
                    // Push the toBeExpired item to the 'expired-items' collection
                    firebaseRef.child('expired-items').push(newExpiredItem, function (err) {
                        if (err) console.log(error);
                    });
                });
            });
        }
        // Case 2: Someone bid for this item
        if (itemToBeExpired.currentBuyerId && !itemToBeExpired.isProcessing) {
            console.log('Current item price: ' + itemToBeExpired.currentPrice);
            var currentBuyerId = itemToBeExpired.currentBuyerId;
            var ownerId = itemToBeExpired.ownerId;
            // Check if currentBuyerId's balance is more than current item price
            firebaseRef.child('active-items').child(itemId).update({
                isProcessing: true
            }, function (err) {
                if (err) console.error(err);
                var buyerObject = $firebaseObject(firebaseRef.child('users').child(currentBuyerId));
                buyerObject.$loaded(function (data) {
                    if (buyerObject.balance > itemToBeExpired.currentPrice) {
                        var ownerObject = $firebaseObject(firebaseRef.child('users').child(ownerId));
                        ownerObject.$loaded(function (data) {
                            var newOwnerBalance = ownerObject.balance + itemToBeExpired.currentPrice;
                            console.log('oldOwner(' + itemToBeExpired.ownerEmail + ') balance: ' + ownerObject.balance);
                            console.log('newOwnerBalance: ' + newOwnerBalance);
                            firebaseRef.child('users').child(ownerId).update({
                                balance: newOwnerBalance
                            }, function (err) {
                                if (err) console.error(err);
                                else {
                                    var newBuyerBalance = buyerObject.balance - itemToBeExpired.currentPrice;
                                    console.log('oldBuyer(' + itemToBeExpired.currentBuyerEmail + ') balance: ' + buyerObject.balance);
                                    console.log('newBuyerBalance: ' + newBuyerBalance);
                                    firebaseRef.child('users').child(currentBuyerId).update({
                                        balance: newBuyerBalance
                                    }, function (err) {
                                        if (err) console.error(err);
                                        // Remove the toBeExpired item from the 'active-items' collection
                                        firebaseRef.child('active-items').child(itemId).remove(function (err) {
                                            if (err) console.error(err);
                                            // Remove some firebase's keys
                                            var newExpiredItem = itemToBeExpired;
                                            delete newExpiredItem["__proto__"];
                                            delete newExpiredItem["$id"];
                                            delete newExpiredItem["$$hashKey"];
                                            delete newExpiredItem["$priority"];
                                            // Push the toBeExpired item to the 'expired-items' collection
                                            firebaseRef.child('expired-items').push(newExpiredItem, function (err) {
                                                if (err) console.log(error);
                                            });
                                        });
                                    });
}
});
})
} else {
                        // TODO handle this case: the buyer doesn't have enough funds
                    }
                });
});
}
};
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
