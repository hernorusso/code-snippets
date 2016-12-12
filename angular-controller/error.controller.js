(function() {
    'use strict';

    angular
        .module('anyandgoApp')
        .controller('ErrorController', ErrorController);

    ErrorController.$inject = ['$timeout', 'syncCandidatesList', '$location', '$interval', '$window', 'techSkillsData'];

    /* @ngInject */
    function ErrorController($timeout, syncCandidatesList, $location, $interval, $windowđ, techSkillsData) {
        var vm = this;
        var interval = 7;
        vm.counter = interval;

        activate(interval);

        function activate(intervalParam) {
          reverseChrono(intervalParam);
        }

        function checkCandidatesData(intervalParam) {
          syncCandidatesList.reloadCandidates()
            .then(techSkillsData.reloadTechList)
            .then(function(){
              $location.path('/candidate');
            }, function() {
              vm.counter = intervalParam;
              reverseChrono(intervalParam);
            });
        }

        function reverseChrono(intervalParam) {
          $timeout(counter, 1000, true, checkCandidatesData, intervalParam);
        }

        function counter(cb, intervalParam) {
          if (!vm.counter) {
            vm.counter = 'Fetching data From server';
            cb(intervalParam);
            return;
          }
          vm.counter--;
          $timeout(counter, 1000, true, cb, intervalParam);
        }
    }
})();
