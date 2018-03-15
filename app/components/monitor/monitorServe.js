'use strict';

angular.module('basic').service('monitorServe', ['$http', '$q', 'GLOBAL', function(http, q, GLOBAL) {
  return {
    monitor: () => {
      let info = q.defer();
      http.get(`${GLOBAL.host}/manager/ocsearch-status`).then((data) => {
        info.resolve(data);
      }, (err) => {
        info.reject(err);
      });
      return info.promise;
    }
  };
}]);