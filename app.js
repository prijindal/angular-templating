angular.module('MyApp',[])
.directive('myDirective', function() {
    return {
        scope:{

        },
        restrict:'AE',
        templateUrl:'template1.html',
        replace:false
    }
})
