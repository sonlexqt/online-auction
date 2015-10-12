var filtersModule = angular.module('dkmhApp.Filters', []);

filtersModule.filter('timeLeft', function() {
    return function(input) {
        var dateObjectFromInput = new Date(input);
        return moment(dateObjectFromInput).from(new Date());
    };
});

filtersModule.filter('readableDate', function() {
    return function(input) {
        var dateObjectFromInput = new Date(input);
        return moment(dateObjectFromInput).format('YYYY-MM-DD, h:mm:ss a');
    };
});

filtersModule.filter('semanticValue', function() {
    return function(input) {
        if (!input){
            return "None";
        } else {
            return input;
        }
    };
});