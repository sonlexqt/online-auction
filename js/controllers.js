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
        AuthService.signIn($scope.signInEmail, $scope.signInPassword, false);
    }
}]);

controllersModule.controller('MyItemsController', ['$scope', '$rootScope', '$firebaseArray', function($scope, $rootScope, $firebaseArray){
    var firebaseRef = new Firebase('https://dkmh-online-auction.firebaseio.com');

    $scope.myItems = $firebaseArray(firebaseRef.child('items').orderByChild("ownerId").equalTo($rootScope.currentUser.uid));
    console.log('$scope.myItems');
    console.log($scope.myItems);

    angular.element('#item-image').change(function(e){
        var imageFile = this.files[0];
        var fileReader = new FileReader();
        fileReader.readAsDataURL(imageFile);
        fileReader.onloadend = function () {
            $scope.itemImage = fileReader.result;
        }
    });

    $scope.addNewItem = function(){
        var expiredDate = new Date($scope.itemExpiredDate).getTime();
        var item = {
            name: $scope.itemName,
            description: $scope.itemDescription,
            image: $scope.itemImage,
            category: $scope.itemCategory,
            expiredDate: expiredDate,
            startingPrice: $scope.itemStartingPrice,
            currentPrice: $scope.itemStartingPrice,
            ownerId: $rootScope.currentUser.uid,
            ownerEmail: $rootScope.currentUser.email,
            status: 'active'
        };

        $firebaseArray(firebaseRef.child('items')).$add(item).then(function(ref) {
            $('#add-new-item-modal').modal('hide');
        });
    };
}]);

controllersModule.controller('MainController', ['$scope', '$rootScope', '$firebaseArray', '$location', function($scope, $rootScope, $firebaseArray, $location){
    var firebaseRef = new Firebase('https://dkmh-online-auction.firebaseio.com');

    $scope.allItems = $firebaseArray(firebaseRef.child('items').orderByChild("expiredDate"));

    $scope.setCurrentItem = function(itemId, itemName, itemNewPrice, itemCurrentPrice){
        if (!$rootScope.currentUser){
            sweetAlert({
                title: 'Error',
                text: 'Please sign in before bidding for items !',
                type: 'error'
            }, function() {
                console.log('after error');
                $location.path('/sign-in');
            });
        } else if (itemNewPrice > $rootScope.currentUser.balance){
            sweetAlert({
                title: 'Error',
                text: 'Not enough budget. Please deposit before continuing.',
                type: 'error'
            });
        } else if (itemNewPrice <= itemCurrentPrice){
            sweetAlert({
                title: 'Error',
                text: 'Please bid a value greater than current item price !',
                type: 'error'
            });
        }
        else {
            $scope.currentItem = {
                id: itemId,
                name: itemName,
                value: itemNewPrice
            };
            $('#submit-bid-modal').modal('show');
        }

    };

    $scope.submitBid = function(){
        firebaseRef.child('items').child($scope.currentItem.id).update({
            currentPrice: $scope.currentItem.value,
            currentBuyerId: $rootScope.currentUser.uid,
            currentBuyerEmail: $rootScope.currentUser.email
        });
        $('#submit-bid-modal').modal('hide');
    };
}]);

controllersModule.controller('DepositController', ['$scope', '$rootScope', function($scope, $rootScope){
    var firebaseRef = new Firebase('https://dkmh-online-auction.firebaseio.com');

    $scope.updateDeposit = function(depositAmount){
        var newBalance = $rootScope.currentUser.balance + depositAmount;
        firebaseRef.child('users').child($rootScope.currentUser.uid).update({
            balance: newBalance
        }, function(err){
            if (err){
                $rootScope.errorMsg = err;
            } else {
                $rootScope.successMsg = 'Deposit successfully !';
            }
        });
    };
}]);