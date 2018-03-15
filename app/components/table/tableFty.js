'use strict';

angular.module('basic').factory('CTable', function() {

  class CTable {
    constructor({name, schema, hbase={region_num:4,region_split:[]}, solr={shards:1,replicas:2}, actived=false}) {
      this.name = name;
      this.schema = schema;
      this.hbase = hbase;
      this.solr = solr;
      this.actived = actived;
    }
    clearValue() {
      this.hbase.region_num = 4;
      this.hbase.region_split = [];
      this.solr.shards = 1;
      this.solr.replicas = 2;
    }

    /**
     * Data formatter functions
     * storedJson:      Return an object with useful attributes.
     */
    storedJson() {
      return {
        name: this.name,
        schema: this.schema.name,
        hbase: this.hbase,
        solr: this.solr,
      };
    }

    /**
     * Controllers:
     * checkBasicInfo:    validation the parameters of new table.
     */
    checkBasicInfo(existed_tables) {
      let tables = [];
      if (angular.isArray(existed_tables)) {
        tables = existed_tables;
      }
      if (!this.name) {
        return {
          result: false,
          message: 'MODALMSG_FILL_IN_ALL',
        };
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]{3,}$/.test(this.name)) {
        return {
          result: false,
          message: 'MODALMSG_TABLE_INVALIDATE',
        };
      } else if (tables.includes(this.name)) {
        return {
          result: false,
          message: 'MODALMSG_TABLE_IN_USE',
        };
      } else if (!this.schema || !this.schema.name) {
        return {
          result: false,
          message: 'MODALMSG_FILL_IN_ALL',
        };
      } else {
        return {
          result: true,
          message: '',
        };
      }
    }
  }

  return CTable;
});
