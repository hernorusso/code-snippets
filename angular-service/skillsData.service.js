(function() {
  'use strict';

  angular
  .module('myApp')
  .factory('techSkillsData', techSkillsData);

  techSkillsData.$inject = ['Restangular'];

  /* @ngInject */
  function techSkillsData(Restangular) {
    var list;

    return {
      sortedPlainList: sortedPlainList,
      reloadTechList: reloadTechList
    }

  // Private Methods ===================================
  /**
   * getTechskillsName - get Techskills name from mongo db to show them in ui
   *
   * @param  {array} techskillsArray mongo documents array
   * @return {array} newTechskillsArray an array of Techskill's name strings
   */
  function getTechskillsName(techskillsArray) {
    var newTechskillsArray = [];
    techskillsArray.forEach(function(item){
      newTechskillsArray.push(item.name);
    });
    return newTechskillsArray.sort();
  }

  function sortedPlainList() {
    if (!list) reloadTechList();
    return list.then(function(techSkills) {
      return getTechskillsName(techSkills.plain());
    });
  }

  function reloadTechList() {
    list = Restangular.service('techskills').getList();
    return list;
  }
}
})();
