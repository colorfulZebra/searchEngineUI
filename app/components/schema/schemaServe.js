'use strict';

angular.module('basic').service('schemaServe', ['$http', '$q', '$rootScope', 'GLOBAL', function(http, q, $rootScope, GLOBAL) {
  return {
    // Get schema list from proxy server
    getSchemaList: () => {
      let schemas = q.defer();
      let token = $rootScope.functions.getToken();
      http.get(`${GLOBAL.host}/schema/list?token=${token}`).then((data) => {
        schemas.resolve(data);
      }, (err) => {
        schemas.reject(err);
      });
      return schemas.promise;
    },

    // Get schema list by user name
    getUserSchemaList: (user_name) => {
      let schemas = q.defer();
      http.get(`/api/schema/get/${user_name}`).then((data) => {
        schemas.resolve(data);
      }, (err) => {
        schemas.reject(err);
      });
      return schemas.promise;
    },

    // Get schema by table name
    getSchemaByTable: (table_name) => {
      let schema = q.defer();
      let token = $rootScope.functions.getToken();
      let table_info = { params: { type: 'table', name: table_name } };
      http.get(`${GLOBAL.host}/schema/get?token=${token}`, table_info).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    // Delete schema by name
    deleteSchema: (schema_name) => {
      let schema = q.defer();
      let token = $rootScope.functions.getToken();
      let schema_deleted = { name:schema_name };
      http.post(`${GLOBAL.host}/schema/delete?token=${token}`, schema_deleted).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    // Add schema by json object
    addSchema: (newschema) => {
      let schema = q.defer();
      let token = $rootScope.functions.getToken();
      http.post(`${GLOBAL.host}/schema/add?token=${token}`, newschema).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    // Update schema by name
    updateSchema: (update_command) => {
      let schema = q.defer();
      let token = $rootScope.functions.getToken();
      http.post(`${GLOBAL.host}/schema/update?token=${token}`, update_command).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    // Services of local mysql
    addSchemaLocal: (schemaname, showfields, owner) => {
      let schema = q.defer();
      http.post('/api/schema/add', {name: schemaname, showfields: showfields, owner: owner}).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    deleteSchemaLocal: (schemaname) => {
      let schema = q.defer();
      http.delete(`/api/schema/delete/${schemaname}`).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    getSchemaLocal: () => {
      let schema = q.defer();
      http.get('/api/schema/list').then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    getSchemaLocalByUser: (owner) => {
      let schema = q.defer();
      http.get(`/api/schema/get/${owner}`).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    },

    updateSchemaLocal: (schemaname, showfields) => {
      let schema = q.defer();
      http.put(`/api/schema/update/${schemaname}`, {showfields: showfields}).then((data) => {
        schema.resolve(data);
      }, (err) => {
        schema.reject(err);
      });
      return schema.promise;
    }
  };
}]);