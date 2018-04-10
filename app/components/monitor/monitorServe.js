'use strict';

angular.module('basic').service('monitorServe', ['$http', '$q', '$rootScope', 'GLOBAL', function(http, q, $rootScope, GLOBAL) {
  return {
    monitor: () => {
      let info = q.defer();
      let token = $rootScope.functions.getToken();
      http.get(`${GLOBAL.host}/manager/ocsearch-status?token=${token}`).then((data) => {
        info.resolve(data);
      }, (err) => {
        info.reject(err);
      });
      return info.promise;
    }
  };
}]);