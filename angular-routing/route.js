angular
  .module('myApp', [
    'toastr',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'restangular',
    'ui.select',
    'ngFileUpload'
  ])
  .config(function ($routeProvider, $locationProvider, RestangularProvider, hotkeysProvider, toastrConfig) {

    // Hotkeys killswitch
    // see https://github.com/chieffancypants/angular-hotkeys#configuration
    hotkeysProvider.includeCheatSheet = true;

    //$locationProvider.html5Mode(true).hashPrefix('!');
    $routeProvider
      .when('/', {
        redirectTo: '/login'
      })
      .when('/login', {
        templateUrl: '/scripts/admin/views/common/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .when('/candidate', {
        templateUrl: '/scripts/admin/views/candidate/candidate.html',
        controller: 'CandidateCtrl',
        resolve: {
          candidatesList: getCandidatesList,
          techList: getTechlist,
          online: online
        }
      })
      .when('/candidate-new', {
        templateUrl: '/scripts/admin/views/candidate/candidate-edit.html',
        controller: 'CandidateNewCtrl',
        resolve: {
          candidatesList: getCandidatesList,
          techList: getTechlist,
          online: online
        }
      })
      .when('/candidate-edit/:id', {
        templateUrl: '/scripts/admin/views/candidate/candidate-edit.html',
        controller: 'CandidateEditCtrl',
        resolve: {
          candidate: getCandidate,
          techList: getTechlist,
          candidatesList: getCandidatesList
        }
      })
      .when('/candidate/error', {
        templateUrl: 'error-page.html',
        controller: 'ErrorController',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });

      /**
       * getCandidate - Get updated Candidate list
       *
       * @param  {type} Restangular        description
       * @param  {type} $route             description
       * @param  {type} syncCandidatesList description
       * @param  {type} $location          description
       * @param  {type} toastr             description
       * @param  {type} $q                 description
       * @return {object}                    promise object
       */
      function getCandidate(Restangular, $route, syncCandidatesList, $location, toastr, $q) {
        var deferred = $q.defer();
        Restangular.one('candidates', $route.current.params.id).get().then(function(cand){
          deferred.resolve(cand);
        }, function(err){
          toastr.error("Error status: " + err.status, "The requested candidate is not available. Please, try again later");
          if (err.status === 404) {
            syncCandidatesList.reloadCandidates();
            $location.path('/candidate');
          } else {
            $location.path('/candidate/error');
          }
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * online - Check browser conectivity before new template
       *
       * @param  {type} $q        description
       * @param  {type} $location description
       * @param  {type} $window   description
       * @return {type}           resolved/rejected promise
       */
      function online($q, $location, $window) {
        if ($window.navigator.onLine) {
          $q.resolve();
        } else {
          $location.path('/candidate/error');
          $q.reject();
        }
      }

      /**
       * getTechlist - Get a collection of technologies
       *
       * @param  {type} techSkillsData servie
       * @return {array}  sorted array of technologies
       */
      function getTechlist(techSkillsData, $q, $location, toastr) {
        var deferred = $q.defer();
        techSkillsData.sortedPlainList().then(function(techSkillsSorted){
          deferred.resolve(techSkillsSorted);
        }, function(err) {
          toastr.error("Error status: " + err.status, 'Tech List is not available')
          $location.path('/candidate/error');
          deferred.reject();
        });
        return deferred.promise;
      }


/**
 * getCandidatesList - A list of candidates
 *
 * @param  {type} syncCandidatesList description
 * @param  {type} $location          description
 * @param  {type} toastr             description
 * @param  {type} $q                 description
 * @return {object}   a collection of candidates
 */
function getCandidatesList(syncCandidatesList, $location, toastr, $q) {
  var deferred = $q.defer();
  syncCandidatesList.candidates().then(function(candidates){
    deferred.resolve(candidates);
  }, function(err) {
    toastr.error("Error status: " + err.status, 'The requested information is not available')
    $location.path('/candidate/error');
    deferred.reject();
  });
  return deferred.promise;
}
