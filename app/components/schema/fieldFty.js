'use strict';

// Class for Fields
angular.module('basic').factory('CField', function() {

  class CField {

    /**
     * Constructor
     */
    constructor({name, store_type=null, indexed=false, index_type=null, hbase_column='', hbase_family='', content_field=null, inner_field=null, enable_in_result=false}) {
      this.name = name;
      this.store_type = store_type;
      this.indexed = indexed;
      this.index_type = index_type;
      this.hbase_column = hbase_column;
      this.hbase_family = hbase_family;
      this.content_field = content_field;
      this.inner_field = inner_field;
      this.enable_in_result = enable_in_result;
    }
    emptyField() {
      this.name = '';
      this.store_type = null;
      this.indexed = false;
      this.index_type = null;
      this.hbase_column = '';
      this.hbase_family = '';
      this.content_field = null;
      this.inner_field = null;
      this.enable_in_result = false;
    }
    validate(with_hbase) {
      if (this.name && this.store_type && (((this.indexed || this.content_field) && this.index_type) || !(this.indexed || this.content_field))) {
        if (with_hbase) {
          return (this.hbase_column && this.hbase_family);
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
    equals(another_field) {
      for (let key in this) {
        if (['name', 'store_type', 'indexed', 'index_type', 'hbase_column', 'hbase_family', 'content_field', 'inner_field'].includes(key)) {
          if (!(angular.isDefined(another_field[key]) && another_field[key] === this[key])) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Return useful info of field
     * queryWeight:   Get field weight from given 'query_fields' if field was queried
     * storedJson:    Return json object of field
     */
    queryWeight(query_fields) {
      let weight = 0;
      query_fields.map(qfd => {
        if (qfd.name === this.name) {
          weight = qfd.weight;
        }
      });
      return weight;
    }
    isLinkType() {
      return (this.store_type === CField.STORE_TYPES[6] || this.store_type === CField.STORE_TYPES[7]);
    }
    isIndexedType() {
      return !(this.store_type === CField.STORE_TYPES[5] || this.store_type === CField.STORE_TYPES[6] || this.store_type === CField.STORE_TYPES[7]);
    }
    storedJson() {
      let tmpJsn = {
        name: this.name,
        store_type: this.store_type,
        indexed: this.indexed,
        index_type: this.index_type,
        hbase_column: this.hbase_column,
        hbase_family: this.hbase_family,
        content_field: this.content_field,
        inner_field: this.inner_field,
      };
      if (tmpJsn.index_type === '' || tmpJsn.index_type === null) { delete tmpJsn.index_type; }
      if (tmpJsn.content_field === '' || tmpJsn.content_field === null) { delete tmpJsn.content_field; }
      if (tmpJsn.inner_field === '' || tmpJsn.inner_field === null) { delete tmpJsn.inner_field; }
      if (tmpJsn.hbase_column === '') { delete tmpJsn.hbase_column; }
      if (tmpJsn.hbase_family === '') { delete tmpJsn.hbase_family; }
      return tmpJsn;
    }

    /**
     * Controller
     */
    clearIndexType() {
      if (!this.store_type || !this.indexed && !this.content_field) {
        this.index_type = null;
      }
    }
  }

  /** 
   * Static properties
   */
  CField.STORE_TYPES = ['INT', 'LONG', 'FLOAT', 'DOUBLE', 'STRING', 'BOOLEAN', 'FILE', 'ATTACHMENT'];
  CField.INDEX_TYPES = [
    'int', 'int_d', 'ints', 'tint', 'tint_d', 'tints',
    'double', 'double_d', 'doubles', 'tdouble', 'tdouble_d', 'tdoubles',
    'float', 'float_d', 'floats', 'tfloat', 'tfloat_d', 'tfloats',
    'long', 'long_d', 'longs', 'tlong', 'tlong_d', 'tlongs',
    'string', 'string_d', 'strings', 'lowercase',
    'tdate', 'tdate_d', 'tdates', 'text_en', 'text_general', 'text_ik'
  ];

  /**
   * Static functions
   * typeFilter: filter of store_type by name
   * queryFilter: filter of query field type
   */ 
  CField.typeFilter = {
    CONTENT: function(type) { return /^text/.test(type); },
    INT: function(type) { return /int/.test(type); },
    FLOAT: function(type) { return /float/.test(type); },
    DOUBLE: function(type) { return /double/.test(type); },
    LONG: function(type) { return /long/.test(type); },
    STRING: function(type) { return /(string|date|text|lowercase)/.test(type); },
    BOOLEAN: function() { return false; },
    FILE: function() { return false; },
    ATTACHMENT: function() { return false; }
  };

  CField.queryFilter = function(field) {
    return /^text/.test(field.index_type);
  };

  CField.rule = function(field) {
    if (angular.isString(field)) {
      return /^[a-zA-Z_][a-zA-Z0-9_]{1,}$/.test(field);
    } else {
      return false;
    }
  };

  return CField;
});
