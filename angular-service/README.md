# Angular Service

This code snippet shows an angular service "data.service" that handles back end request, with $q promises and Restangular library.

The other service is rely on the mentioned above, and its responsability is to keep controllers in sync with the data provided by "data.service" file.

"SkillData.service" file expose a service with public and private methods.

The pattern use to provide public method on services is module revealed:
https://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript
