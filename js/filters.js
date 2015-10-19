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

filtersModule.filter('dateOnly', function() {
    return function(input) {
        var dateObjectFromInput = new Date(input);
        return moment(dateObjectFromInput).format('MMM DD, YYYY');
    }
});

filtersModule.filter('timeOnly', function() {
    return function(input) {
        var dateObjectFromInput = new Date(input);
        return moment(dateObjectFromInput).format('HH') + 'h' + moment(dateObjectFromInput).format('mm');
    }
});

filtersModule.filter('shorten', function() {
    return function(input) {
        if (!input) return 'None';
        return input.substr(0,30) + ' ...';
    }
});