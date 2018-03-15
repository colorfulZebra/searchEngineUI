'use strict';

angular.module('basic').factory('CSchema', ['CUtil', 'CField', function(CUtil, CField) {

  class CSchema {

    /**
     * Constructor 
     */
    constructor({name, with_hbase=false, index_type, rowkey_expression='', table_expression='', 
      id_formatter='com.ngdata.hbaseindexer.uniquekey.StringUniqueKeyFormatter',
      fields=[], content_fields=[], inner_fields=[], query_fields=[], actived=false}) {

      this.name = name;
      this.index_type = index_type;
      this.with_hbase = with_hbase;
      this.rowkey_expression = rowkey_expression;
      this.table_expression = table_expression;
      this.id_formatter = id_formatter;
      this.fields = [];
      fields.map(fd => this.fields.push(new CField(fd)));
      this.content_fields = angular.copy(content_fields);
      this.inner_fields = angular.copy(inner_fields);
      this.query_fields = angular.copy(query_fields);
      this.actived = actived;
    }
    resetval(parameter) {
      if (parameter === 'name') {
        this.name = '';
      } else if (parameter === 'with_hbase') {
        this.with_hbase = false;
      } else if (parameter === 'content_fields') {
        this.content_fields = [];
      } else if (parameter === 'inner_fields') {
        this.inner_fields = [];
      } else if (parameter === 'query_fields') {
        this.query_fields = [];
      } else if (parameter === 'fields') {
        this.fields = [];
      } else if (parameter === 'rowkey_expression') {
        this.rowkey_expression = '';
      } else if (parameter === 'table_expression') {
        this.table_expression = '';
      }
    }
    diffFields(another_schema) {
      let diff_list = {added:[], deleted:[], updated:[]};
      let tfieldnames = [];
      let afieldnames = [];
      // get name list of fields
      this.fields.map(fd => tfieldnames.push(fd.name));
      another_schema.fields.map(afd => afieldnames.push(afd.name));
      // find out added field
      another_schema.fields.map(afd => {
        if (!tfieldnames.includes(afd.name)) {diff_list.added.push(afd.storedJson());}
      });
      // find out deleted field
      this.fields.map(fd => {
        if (!afieldnames.includes(fd.name)) {diff_list.deleted.push(fd.storedJson());}
      });
      // find out updated fields
      this.fields.map(fd => {
        another_schema.fields.map(afd => {
          if (fd.name === afd.name) {
            if (!fd.equals(afd)) {diff_list.updated.push(afd.storedJson());}
          }
        });
      });
      return diff_list;
    }

    /**
     * Fields display-enabled in search result related methods
     * initialDisplayStatusByFile:  Initial display status of fields in search result by configuration info from server file
     * displayStatus:               Show current fields display status (All, Indetermine, None 3 status)
     * changeDisplayStatus:         Change fields display status according to current status (None -> All, Indetermine -> All, All -> None)
     */
    initialDisplayStatusByFile(schema_display) {
      if (angular.isDefined(schema_display[this.name])){
        this.fields.map(fd => {
          if(angular.isDefined(schema_display[this.name][fd.name]) && schema_display[this.name][fd.name]){
            fd.enable_in_result=true;
          }
        });
      }
    }
    initialDisplayStatusByMysql(schemas) {
      if (angular.isArray(schemas)) {
        schemas.map(sc => {
          if (sc.name === this.name) {
            this.fields.map(fd => {
              if (sc.showfields.split(',').includes(fd.name)) {
                fd.enable_in_result=true;
              }
            });
          }
        });
      }
    }
    displayStatus() {
      let show_count = 0;
      let show_flag = false;
      let show_indeter_flag = false;
      this.fields.map(fd => {if(fd.enable_in_result){show_count += 1;}});
      if (show_count === 0) { // None
        show_flag = false;
        show_indeter_flag = false;
      } else if (show_count === this.fields.length) { // All
        show_flag = true;
        show_indeter_flag = false;
      } else {                // Indetermine
        show_flag = false;
        show_indeter_flag = true;
      }
      return [show_flag, show_indeter_flag];
    }
    changeDisplayStatus() {
      let [show_flag, show_indeter_flag] = this.displayStatus();
      if (!show_flag && !show_indeter_flag) { // None -> All
        this.fields.map(fd => fd.enable_in_result=true);
      } else if (!show_flag && show_indeter_flag) { // Indetermine -> All
        this.fields.map(fd => fd.enable_in_result=true);
      } else if (show_flag && !show_indeter_flag) { // All -> None
        this.fields.map(fd => fd.enable_in_result=false);
      } else { // Unknown status, make all disabled in result
        this.fields.map(fd => fd.enable_in_result=false);
      }
      return this.displayStatus();
    }

    /**
     * Data formatter functions
     * indexType:     Return index type name instead of value
     * withHbase:     Return translation string of 'with_hbase'
     * storedJson:    Return object that can be stored
     */
    indexType() {
      let index_name = '';
      CSchema.INDEX_TYPES.map(idtype => {
        if (idtype.val === this.index_type) {
          index_name = idtype.display;
        }
      });
      return index_name;
    }
    withHbase() {
      return this.with_hbase ? 'YES' : 'NO';
    }
    storedJson() {
      let storedFields = [];
      this.fields.map(fd => { // map to get json object of fields
        storedFields.push(fd.storedJson());
      });
      return {
        name: this.name,
        index_type: this.index_type,
        with_hbase: this.with_hbase,
        id_formatter: this.id_formatter,
        rowkey_expression: this.rowkey_expression,
        table_expression: this.table_expression,
        fields: storedFields,
        content_fields: this.content_fields,
        inner_fields: this.inner_fields,
        query_fields: this.query_fields,
      };
    }

    /**
     * Add and Remove item on "content_fields, inner_fields, query_fields, fields"
     * addContentField / removeContentField:    For "content_fields"
     * addInnerField / removeInnerField:        For "inner_fields"
     * addQueryField / removeQueryField:        For "query_fields"
     * addFields / removeFields:                For "fields"
     */
    addContentField(new_content_field) {
      this.content_fields.push(angular.copy(new_content_field));
      new_content_field.name = null;
      new_content_field.type = null;
    }
    removeContentField(index) {
      this.content_fields.splice(index,1);
    }
    addInnerField(new_inner_field) {
      this.inner_fields.push(angular.copy(new_inner_field));
      new_inner_field.name = null;
      new_inner_field.separator = null;
    }
    removeInnerField(index) {
      this.inner_fields.splice(index,1);
    }
    addQueryField(new_query_field) {
      this.query_fields.push(angular.copy(new_query_field));
      new_query_field.name = null;
      new_query_field.weight = null;
    }
    removeQueryField(index) {
      this.query_fields.splice(index,1);
    }
    addField(new_field) {
      this.fields.push(angular.copy(new_field));
      new_field.emptyField();
    }
    removeField(index) {
      this.fields.splice(index,1);
    }
    updateField(index, update_field) {
      this.fields[index] = angular.copy(update_field);
    }

    /**
     * Validation functions
     */
    checkIndexType() {
      let index_type_vals = [];
      CSchema.INDEX_TYPES.map(t => index_type_vals.push(t.val));
      if (index_type_vals.includes(this.index_type)) {
        return {
          result: true,
          message: '',
        };
      } else {
        return {
          result: false,
          message: 'MODALMSG_CHOOSE_SCHEMA_INDEX_TYPE',
        };
      }
    }

    checkBasicInfo(schemas) {
      if (!angular.isArray(schemas)) {
        schemas = [];
      }
      if (!this.name) {
        return {
          result: false,
          message: 'MODALMSG_FILL_IN_ALL',
        };
      } else if (schemas.includes(this.name)) {
        return {
          result: false,
          message: 'MODALMSG_SCHEMA_IN_USE',
        };
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]{3,}$/.test(this.name)) {
        return {
          result: false,
          message: 'MODALMSG_SCHEMA_INVALIDATE',
        };
      } else {
        return {
          result: true,
          message: '',
        };
      }
    }
    checkFields() {
      let success_msg = {result:true,message:''};
      let nofield_msg = {result:false,message:'MODALMSG_NO_FIELDS'};
      let innernouse_msg = {result:false,message:'MODALMSG_INNER_NO_USE'};
      if (this.fields.length===0) {
        return nofield_msg;
      } else if (this.inner_fields.length > 0) {
        let inner_used = [];
        this.inner_fields.map(ifd => inner_used.push({name:ifd.name,used:false}));
        this.fields.map(f => {
          if (f.inner_field.length > 0) {
            inner_used.map(iused => {
              if (f.inner_field === iused.name) {
                iused.used = true;
              }
            });
          }
        });
        let used_flag = true;
        inner_used.map(iused => {
          if (!iused.used) {
            used_flag = false;
          }
        });
        if (!used_flag) {
          return innernouse_msg;
        } else {
          return success_msg;
        }
      } else {
        return success_msg;
      }
    }

    disableWithHbase() {
      return this.inner_fields.length === 0 ? false : true;
    }
    disableContentField(index) {
      let flag = false;
      let content_field_name = this.content_fields[index].name;
      this.fields.map(f => {
        if (f.content_field === content_field_name) { flag = true; }
      });
      this.query_fields.map(qf =>  {
        if (qf.name === content_field_name) { flag = true; } 
      });
      return flag;
    }
    disableInnerField(index) {
      let flag = false;
      let inner_field_name = this.inner_fields[index].name;
      this.fields.map(f => { 
        if (f.inner_field === inner_field_name) { flag = true; } 
      });
      return flag;
    }
    disableField(index) {
      let flag = false;
      let field_name = this.fields[index].name;
      this.query_fields.map(qf => {
        if (qf.name === field_name) { flag = true; } 
      });
      if (this.rowkey_expression.indexOf(field_name) > -1) {
        flag = true;
      }
      if (this.table_expression.indexOf(field_name) > -1) {
        flag = true;
      }
      return flag;
    }
  }

  /**
   * Static properties
   */
  CSchema.INDEX_TYPES = [
    { val: 0, display: 'hbase+indexer+solr' },
    { val: -1, display: 'hbase only' },
    { val: 1, display: 'hbase+phoenix' },
    { val: 2, display: 'hbase+phoenix+solr' }
  ];
  CSchema.ID_FORMATTERS = [
    'com.ngdata.hbaseindexer.uniquekey.HexUniqueKeyFormatter', 
    'com.ngdata.hbaseindexer.uniquekey.StringUniqueKeyFormatter'
  ];

  return CSchema;
}]);