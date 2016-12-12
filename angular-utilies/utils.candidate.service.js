(function() {
  'use strict';

  angular
    .module('myApp')
    .factory('utilsCandidateService', utilsCandidateService);

  utilsCandidateService.$inject = [];

  /* @ngInject */
  function utilsCandidateService() {
    var service = {
      getIdfromVideoUrl: getIdfromVideoUrl,
      checkVideoChange: checkVideoChange,
      addUrlProtocol: addUrlProtocol,
      getVideoData: getVideoData
    };

    return service;

    /**
    * getIdfromVideoUrl - get Vidro Id from youtube URL
    *
    * @param  {string} url youtube video url
    * @return {string} video ID
    */
    function getIdfromVideoUrl(url) {
      return url.split('?v=')[1];
    }

    /**
     * checkVideoChange - Compare videos ID
     *
     * @param  {string} original video ID
     * @param  {string} modified video ID
     * @return {boolean} true if params are different
     */
    function checkVideoChange(original, modified){
      if (original === modified){
        return false;
      }
      return true;
    }

    /**
     * addUrlProtocol - add url protocol, if url hasn't protocol
     *
     * @param  {string} url string url
     * @return {string} a string url with http protocol added
     */
    function addUrlProtocol(url) {
      if (url.search(/^http[s]?:\/\//) === -1) {
        return 'http://' + url;
      }
      return url;
    }

    /**
     * getVideoData - Extract from url the video ID and the provider, and return thema as an object
     * @param  {string} url video url (youtube and vimeo supported)
     * @return {object}     object containing video id, and video provider, both as an object key
     */
    function getVideoData(url) {
      var regex, matchingArray, videoProvider, videoID;
      regex = /\bhttp(s)?:..(www\.)?(youtu(\.)?(be)|vimeo)(\.com)?/g;
      matchingArray = regex.exec(url);
      if (matchingArray) {
        videoProvider = matchingArray[3];
        videoID = getVideoID(videoProvider, url);
        if (videoID) {
          return {
            id: videoID,
            provider: videoProvider
          };
        }
      } else {
        return false;
      }
    }

    /**
     * getVideoID - get video ID from provided url, according to the given provider, and return it.
     * @param  {string} provider the provider name: youtube or vimeo
     * @param  {string} url      video url
     * @return {string}          video ID
     */
    function getVideoID(provider, url){
      var videoID, regEx, matchingArray;
      if (provider === 'youtube'){
        videoID = url.split('?v=')[1];
      }
      if (provider === 'vimeo'){
        regEx = /vimeo.com\/(video\/|channels\/|album\/\d+\/\w+\/|groups\/\w+\/\w+\/|)(\d{8,9})/g;
        matchingArray = regEx.exec(url);
        if (matchingArray){
          videoID = matchingArray[2];
        } else {
          videoID = false;
        }
      }
      return videoID;
    }

  }
})();
