'use strict';

angular.module('basic').service('searchServe', ['$http', '$q', 'GLOBAL', function(http, q, GLOBAL) {
  return {
    querySearch: (queryContent, queryCondition, start_num, total_num, tables, return_fields) => {
      let dataset = q.defer();
      let queryCommand = {
        'query':          queryContent,
        'condition':      queryCondition,
        'start':          start_num,
        'rows':           total_num,
        'sort':           '',
        'tables':         tables,
        'return_fields':  return_fields,
      };
      http.post(`${GLOBAL.host}/query/search`, queryCommand).then((data) => {
        dataset.resolve(data);
      }, (err) => {
        dataset.reject(err);
      });
      return dataset.promise;
    },

    queryGet: (id, table, fields) => {
      let result = q.defer();
      let queryCommand = {
        'tables': table,
        'ids': id,
        'return_fields': fields,
      };
      http.post(`${GLOBAL.host}/query/get`, queryCommand).then((data) => {
        result.resolve(data);
      }, (err) => {
        result.reject(err);
      });
      return result.promise;
    }
  };
}]);