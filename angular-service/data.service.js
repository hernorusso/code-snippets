(function() {
  'use strict';

  angular
  .module('myApp')
  .factory('candidatesData', candidatesData);

  candidatesData.$inject = ['Restangular', '$q'];

  /* @ngInject */
  function candidatesData(Restangular, $q) {

    var service = {
      refreshList: refreshList
    }

    return service;

    function refreshList(){
      var deferred = $q.defer();
      Restangular.all('candidates').getList().then(function(candidates){
        deferred.resolve(candidates);
      }, function(err){
        console.log(err, 'dataService');
        deferred.reject(err);
      });
      return deferred.promise;
    }
  }
})();
