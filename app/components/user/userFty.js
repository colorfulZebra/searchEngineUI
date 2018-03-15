'use strict';

angular.module('basic').factory('CUser', function() {

  class CUser {
    constructor({name, description='', schemas=[], tables=[], actived=false}) {
      this.name = name;
      this.description = description;
      this.schemas = angular.copy(schemas);
      this.tables = angular.copy(tables);
      this.actived = actived;
    }

    isAdmin() {
      return this.name === 'admin';
    }

    /**
     * data formatter functions
     */
    strSchemaList() {
      return this.schemas.length>0 ? this.schemas.join(' | ') : '';
    }
    strTableList() {
      return this.tables.length>0 ? this.tables.join(' | ') : '';
    }
  }

  return CUser;
});