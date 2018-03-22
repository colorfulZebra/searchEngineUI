'use strict';

angular.module('basic').service('tableServe', ['$http', '$q', '$rootScope', 'GLOBAL', function(http, q, $rootScope, GLOBAL) {
  return {
    // Get table list from proxy server
    getTableList: () => {
      let tables = q.defer();
      http.get(`${GLOBAL.host}/table/list`).then((data) => {
        tables.resolve(data);
      }, (err) => {
        tables.reject(err);
      });
      return tables.promise;
    },

    // Get tables of schema
    getTablesBySchema: (schema_name) => {
      let tables = q.defer();
      let user = $rootScope.functions.getUsername();
      if (!user) {
        tables.reject('Unauthorized user');
      }
      let schema_selected = { schema:schema_name, user };
      http.post(`${GLOBAL.host}/table/list`, schema_selected).then((data) => {
        tables.resolve(data);
      }, (err) => {
        tables.reject(err);
      });
      return tables.promise;
    },

    // Delete table by name
    deleteTable: (table_name) => {
      let table = q.defer();
      let table_deleted = { name:table_name };
      http.post(`${GLOBAL.host}/table/delete`, table_deleted).then((data) => {
        table.resolve(data);
      }, (err) => {
        table.reject(err);
      });
      return table.promise;
    },

    // Create table by json object
    createTable: (newtable) => {
      let table = q.defer();
      http.post(`${GLOBAL.host}/table/create`, newtable).then((data) =>  {
        table.resolve(data);
      }, (err) => {
        table.reject(err);
      });
      return table.promise;
    },

    // Get indexer by table
    getIndexerHosts: (tablename) => {
      let table = q.defer();
      let command = {type:'status',indexer:tablename};
      http.post(`${GLOBAL.host}/manager/indexer-status`, command).then((data) => {
        table.resolve(data);
      }, (err) => {
        table.reject(err);
      });
      return table.promise;
    },

    // Get indexer status by table and host
    getIndexerStatus: (tablename, host) => {
      let indexer = q.defer();
      let command = {type:'jmx', indexer:tablename, host:host};
      http.post(`${GLOBAL.host}/manager/indexer-status`, command).then((data) => {
        indexer.resolve(data);
      }, (err) => {
        indexer.reject(err);
      });
      return indexer.promise;
    },

  };
}]);