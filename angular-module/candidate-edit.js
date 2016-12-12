/**
 * @ngdoc function
 * @name anyandgoApp.controller:CandidateEditCtrl
 * @description
 * # CandidateEditCtrl
 * Controller of the anyandgoApp
 */
angular.module('anyandgoApp')
  .controller('CandidateEditCtrl', function ($sce, $scope, $location, Restangular, candidate, toastr, preSave, utilsCandidateService, Upload, techList, candidatesList) {
  'use strict';
  var utils = utilsCandidateService;
  // variables initialization /-------------------------------------------------
  var original = candidate;
  $scope.candidate = Restangular.copy(original);
  var candidates = candidatesList;
  $scope.disableControl = false;
  $scope.techskills = techList;
  $scope.mainTitle = "Edit "+$scope.candidate.name+" "+$scope.candidate.surname;
  $scope.$watch('candidate.name', function() {
    $scope.mainTitle = "Edit "+$scope.candidate.name+" "+$scope.candidate.surname;
  });
  $scope.$watch('candidate.surname', function() {
    $scope.mainTitle = "Edit "+$scope.candidate.name+" "+$scope.candidate.surname;
  });

  // $scope.techskills = getTechskillsName(techskills.plain());
  $scope.videoUrl = getUrlVideo($scope.candidate.video);
  $scope.portfolioVideoUrl = getUrlVideo($scope.candidate.portfolioVideo);

  //create video for iframe
  $scope.iframeVideoUrl = "";
  $scope.iframePortfolioUrl = "";
  $scope.$watch('videoUrl', function() {
    var newVideoObject = utilsCandidateService.getVideoData($scope.videoUrl);
    $scope.iframeVideoUrl = $sce.trustAsResourceUrl(getIframeUrlVideo(newVideoObject));
  });
  $scope.$watch('portfolioVideoUrl', function() {
    var newVideoObject = utilsCandidateService.getVideoData($scope.portfolioVideoUrl);
    $scope.iframePortfolioUrl = $sce.trustAsResourceUrl(getIframeUrlVideo(newVideoObject));
  });
  //add missing skill periods if any
  addMissingSkillPeriods ();

  // Public Methods (bound to the view) /---------------------------------------
  $scope.isClean = function() {
    return angular.equals(original, $scope.candidate);
  }

  $scope.destroy = function() {
    $scope.disableControl = true;
    original.remove().then(function(candidate) {
      for (var i = 0; i < candidates.length; i++) {
        if (original._id === candidates[i]._id) {
          candidates.splice(i, 1);
          break;
        }
      }
      if(navigator.userAgent.match(/Zombie/)) {
          document.location.hash = "#/crud/candidate";
      } else {
        $location.path('/crud/candidate');
      }
    }, function(error){
        toastr.error("Error status: " + error.status, "An error occur. Please check Candidate List before take further actions");
        $location.path('/candidate/error');
    });
  };

  $scope.save = function() {
    // check at least user has one skill
    $scope.disableControl = true;
    var checkPending = preSave.checkPendingActions($scope.candidate.skills);
    if (checkPending.flag){
      window.alert(checkPending.msg);
      return;
    }
    removeEmptyItems($scope.candidate.skills, 'skills');
    // remove empty Objects
    preSave.removeEmptyObject([{
        array: $scope.candidate.education.degrees,
        key: 'title'
      },
      {
        array: $scope.candidate.education.certifications,
        key: 'title'
      }
    ]);
    // check portfolio url has the right protocol
    if ($scope.candidate.portfolio) {
      preSave.checkUrls({
        github: $scope.candidate.portfolio.github,
        online: $scope.candidate.portfolio.online
      }, $scope.candidate.portfolio);
    }
    // save Candidate
    $scope.candidate.put().then(function() {
      if(navigator.userAgent.match(/Zombie/)) {
          document.location.hash = "#/crud/candidate";
      } else {
        toastr.success('Candidate Successfully saved!');
        $location.path('/candidate');
      }
    }, function(error){
      toastr.error("Error status: " + error.status, "An error occur. Please check Candidate List before take further actions");
      $location.path('/candidate/error');
    });
  };


  /**
   * deleteItem - Delete one Item from a given array at a given index
   *
   * @param  {array} array
   * @param  {number} index array index
   * @return {undefined}
   */
  $scope.deleteItem = function(array, index) {
    array.splice(index, 1);
  };


  /**
   * scope - description
   *
   * @param  {array} array        array to be populated
   * @param  {string} objectType indicate that pushed object to array should contain an array
   * @param  {string} keyForObject key to store the contained array in the new object
   * @return {undefined}
   */
  $scope.addItem = function(array, objectType, keyForObject) {
    var newLength = array.push({});
    if (objectType === 'array'){
      if (typeof keyForObject === 'string'){
        array[newLength -1][keyForObject] = [];
      }
      if (Array.isArray(keyForObject)){
        keyForObject.forEach( function(item){
          array[newLength -1][item] = [];
        });
      }
    }
  };

  /**
   * updateVideoId - update Candidate video ID when UI input change
   *
   * @param  {object} videoObject object reference to video data
   * @param  {string} videoUrl video url modified by user
   * @param  {string} key key name of candidate video object
   * @return {undefined}
   */
  $scope.updateVideoId = function(videoObject, videoUrl, key) {
    var newVideoObject = utils.getVideoData(videoUrl);
    if (newVideoObject && !angular.equals(videoObject, newVideoObject)) {
      $scope.cForm[key].$setValidity("pattern", true);
      $scope.candidate[key] = newVideoObject;
    } else if (angular.equals(videoObject, newVideoObject)) {

      $scope.cForm[key].$setValidity("pattern", true);
    } else {
      $scope.cForm[key].$setValidity("pattern", false);
    }
  };

  /**
  * uploadPortfolio - upload file to be store in the server and bound to candidate profile
  *
  * @param  {string} assetType Determine the url to hit, wich is related to the asset type
  * @return {undefined} invoke Upload library
  */
  $scope.uploadPortfolio = function() {
    console.log($scope.portfolio);
    if ($scope.portfolio) {
      upload($scope.portfolio, 'portfolio');
    }
  };

  /**
   * deleteSelectedFile - remove selected file form view input control
   *
   * @param  {string} model   model name to be cleared
   * @param  {object} formControl form control to set pristine status
   * @return {undefined}
   */
  $scope.removeSelectedFile = function(model, formControl){
    $scope[model] = null;
    formControl.$setPristine();
  };
  // Controller private Methods /--------------------------------------------

  // This function check for an empty key, if it's empty, deletes the element
  function removeEmptyItems (array, checkKey) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][checkKey].length === 0) {
        array.splice(i, 1);
        i--;
      }
    }
  }

  //add
  function addMissingSkillPeriods () {
    var candidateSkills = $scope.candidate.skills;
    var allSkills = [
      { period: '0-2',
        skills: []},
      { period: '2-5',
        skills: []},
      { period: '5-9',
        skills: []},
      { period: '10+',
        skills: []}
    ];

    for (var i = 0; i < allSkills.length; i++) {
      for (var j = 0; j < candidateSkills.length; j++) {
        if(allSkills[i].period == candidateSkills[j].period) {
          allSkills[i].skills = candidateSkills[j].skills;
        }
      }
    }

    $scope.candidate.skills = allSkills;
  }
  /**
   * getIframeUrlVideo - Compose url video from video ID
   *
   * @param  {object} video object containing a video ID an a video provider
   * @return {string} return video url
   */
  function getIframeUrlVideo(video) {
    if (video) {
      if (video.id){
        var url;
        if (video.provider === 'vimeo'){
          url = 'http://player.vimeo.com/video/'
        } else {
          url = 'https://www.youtube.com/embed/'
        }
        return url + video.id;
      }
    }
    return undefined;
  }

  /**
   * getUrlVideo - Compose url video from video ID
   *
   * @param  {object} video object containing a video ID an a video provider
   * @return {string} return video url
   */
  function getUrlVideo(video) {
    if (video) {
      if (video.id){
        var url;
        if (video.provider === 'vimeo'){
          url = 'https://vimeo.com/'
        } else {
          url = 'https://www.youtube.com/watch?v='
        }
        return url + video.id;
      }
    }
    return undefined;
  }


      /**
       * upload - upload asset in server and store its name in candidate model
       *
       * @param  {object} file     an object with a referehce to the asset to be uploaded
       * @param  {string} assetType type of asset. i.e.: 'portfolio'
       * @return {undefined}
       */
      function upload(file, assetType) {
        Upload.upload({
          url: '/upload/' + assetType,
          data: {file: file}
        }).then(function (resp) {
          switch (assetType) {
            case 'portfolio':
            $scope.candidate.portfolio.pdf = resp.data.storedFileName;
            break;
            default:
            $scope.candidate.assets.files.push(resp.data.storedFileName);
          }
          $scope.cForm.portfolioPDF.$setPristine();
          window.alert('Success ' + resp.config.data.file.name + ' uploaded');
        }, function (error) {
          $scope.progress = "File not saved. Please Try again"
          window.alert('File not saved. Error status: ' + error.status);
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
      }

      /**
       * $scope.checkInputUrl - check if url has valid protocol, and update the related model
       *
       * @param  {string} url
       * @param  {object} model object to store url
       * @param  {string} key   key to store url value
       * @return {undefined}       no returning value
       */
      $scope.AddInputUrlProtocol = function (url, model, key) {
        if (url.length > 8 ) {
          model[key] = utilsCandidateService.addUrlProtocol(url);
        }
      };
});
