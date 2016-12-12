(function() {
    'use strict';

    angular
        .module('myApp')
        .factory('syncCandidatesList', syncCandidatesList);

    syncCandidatesList.$inject = ['candidatesData', '$q'];

    /* @ngInject */
    function syncCandidatesList(candidatesData, $q) {
        var candidateUpdatedList;
        reloadCandidates();

        var service = {
            candidates: candidates,
            reloadCandidates: reloadCandidates,
        };

        return service;

        function candidates() {
          return candidateUpdatedList;
        }

        function reloadCandidates() {
          var deferred = $q.defer();
          candidateUpdatedList = deferred.promise;
          candidatesData.refreshList().then(function(candidates){
            deferred.resolve(candidates);
          }, function(err){
            deferred.reject(err);
          });
          return candidateUpdatedList;
        }

    }
})();
