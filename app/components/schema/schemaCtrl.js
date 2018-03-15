'use strict';

angular.module('basic').controller('SchemaCtrl', ['$scope', '$http', '$q', 'GLOBAL', '$translate', '$rootScope', '$stateParams', 'schemaServe', 'tableServe', 'CField', 'CSchema', 'CUtil', /*'CExpression', 'CExpfunction',*/ function ($scope, $http, $q, GLOBAL, $translate, $rootScope, $stateParams, schemaServe, tableServe, CField, CSchema, CUtil/*, CExpression, CExpfunction*/) {

  $rootScope.global.tab = 'schema';
  /**
   * Translation infos
   */
  //let yes_text = $translate.instant('YES');
  //let no_text = $translate.instant('NO');
  //let ok_text = $translate.instant('OK');
  //let warn_text = $translate.instant('WARNING');
  //let confirmation_text = $translate.instant('CONFIRMATION');

  /**
   * Const variables
   * $scope.index_type:         Index Type of Schema
   * $scope.id_formatter_type:  ID Formatter Type of Schema
   */
  $scope.index_type = CSchema.INDEX_TYPES;
  $scope.id_formatter_type = CSchema.ID_FORMATTERS;
  let schemaDlg = UIkit.modal('#schemaDlg', {bgclose: false});

  /**
   * Utility functions
   * $scope.initial:      Initial 'Schema' page:
   *                      1, Get schema list; 
   *                      2, Get schema display configuration and map to schema list;
   *                      3, Set current page schema.
   * $scope.limitLen:     Cut String if length more than 15.
   * $scope.$on($destory) Event function to save configuration of fields displayed in search result
   * $scope.modalDlg:     Modal Dialog that help to add or edit Schema. 
   */

  $scope.initial = function() {
    if (!$rootScope.functions.initial()) { return; }
    if ($rootScope.functions.isAdmin()) { $rootScope.functions._logout(); }
    $scope.page = {
      schema: {},
      tables: [],
      schema_display: false,
      schema_display_indeter: false,
    };
    $scope.username = $rootScope.functions.getUsername();
    $scope.existed_schemas = [];
    // Get schema list & schema display info from configuration file
    $q.all([schemaServe.getSchemaList(), schemaServe.getSchemaLocalByUser($scope.username)]).then(function(data) {
      $scope.schemas = [];
      let userschemas = [];
      if (angular.isArray(data[1].data)) {
        data[1].data.map(lsc => userschemas.push(lsc.name));
      }
      if (angular.isArray(data[0].data.schemas)) {
        if (data[0].data.schemas.length > 0) {
          data[0].data.schemas.map(sc => {
            if (userschemas.includes(sc.name)) {
              $scope.schemas.push(new CSchema(sc));
            }
            $scope.existed_schemas.push(sc.name);
          });
        }
      }
      // old: initialDisplayStatusByFile -> new: initialDisplayStatusByMysql
      $scope.schemas.map(sc => sc.initialDisplayStatusByMysql(data[1].data));
      if (!$stateParams.linkschema || $stateParams.linkschema === '') {
        $scope.selectSchema(0);
      } else {
        $scope.selectSchema($scope.schemas.map(sc => sc.name === $stateParams.linkschema).indexOf(true));
      }
    });
  };
  $scope.initial();
  $scope.limitLen = function(item) {
    return CUtil.cutString(item, 15);
  };
  // When leave the 'Schema' page, save the configuration file that changed!
  $scope.$on('$destroy', function() {
    if (!$rootScope.functions.getUsername()) { return ;}
    let schema_display_obj = {};
    if (angular.isArray($scope.schemas)) {
      $scope.schemas.map(sc => schema_display_obj[sc.name]={});
      $scope.schemas.map(sc => {sc.fields.map(fd => {schema_display_obj[sc.name][fd.name]=fd.enable_in_result;});});
      if (schema_display_obj && Object.keys(schema_display_obj).length === $scope.schemas.length) {
        schemaServe.setSchemaConfig(schema_display_obj);
      }
    }
    let update_lst = [];
    if (angular.isArray($scope.schemas)) {
      $scope.schemas.map(sc => {
        let showfield_lst = [];
        sc.fields.map(fd => {
          if (fd.enable_in_result) { showfield_lst.push(fd.name); }
        });
        update_lst.push(schemaServe.updateSchemaLocal(sc.name, showfield_lst.join(',')));
      });
      $q.all(update_lst);
    }
  });
  $scope.modalDlg = function(/*title, confirm_content, initval, okfunc*/) {
    /*
    let modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'addSchema.html',
      backdrop: 'static',
      keyboard: false,
      scope: $scope,
      size: 'lg',
      controller: ['$scope', '$http', '$ngConfirm', '$sce', function($scope, $http, $ngConfirm, $sce) {
        /**
         * Initial parameters of Modal Dialog
         * $scope.helpExpressionHtml:   Help build expression tip infos.
         * $scope.titleStr:             Title of Modal Dialog.
         * $scope.newschema:            schema object in Modal Dialog.
         * $scope.field_type:           const variable contains all store type of field.
         * $scope.field_index_type:     const variable contains all index type of field.
         * $scope.typeFilter:           functions that filter index type by store type of field.
         * $scope.queryFilter:          function that filter fields can be set to query field.
         * $scope.new_content_field:    temporary content field
         * $scope.new_inner_field:      temporary inner field
         * $scope.new_field:            temporary field
         * $scope.new_query_field:      temporary query field
         * $scope.addsteps:             total steps to add a schema
         * $scope.curstep:              current step when adding a schema
        $scope.helpExpressionHtml = $sce.trustAsHtml(
          `<h5>${$translate.instant('HELP_EXPRESSION_TITLE')}</h5>
          ${$translate.instant('HELP_EXPRESSION_CONTENT')}<a target="_blank" href="expression.html">${$translate.instant('HELP_EXPRESSION_LINK')}</a>?`);
        $scope.rowkeyDescHtml = $sce.trustAsHtml(`<b>${$translate.instant('SELECT_FUNCTION')}</b>`);
        $scope.tableDescHtml = $sce.trustAsHtml(`<b>${$translate.instant('SELECT_FUNCTION')}</b>`);
        $scope.titleStr = title;
        $scope.newschema = initval;
        $scope.field_type = CField.STORE_TYPES;
        $scope.field_index_type = CField.INDEX_TYPES;
        $scope.typeFilter = CField.typeFilter;
        $scope.queryFilter = CField.queryFilter;
        $scope.new_content_field = { name: null, type: null };
        $scope.new_inner_field = { name: null, separator: null };
        $scope.new_field = new CField({ name: '', store_type: '' });
        $scope.new_query_field = { name: null, weight: 1 };
        $scope.addsteps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
        $scope.curstep = 0;
        $scope.rowkey_inedit = false;
        $scope.table_inedit = false;
        $scope.expression_types = CExpression.TYPES;
        $scope.expfuns = null;
        $scope.rowkey_expression = new CExpression();
        $scope.table_expression = new CExpression();
        $scope.rowkey_funarg_style = {};
        $scope.table_funarg_style = {};
        $scope.editflag = ($scope.newschema.name === '') ? false : true;
        $scope.existed_schema_inmodal = angular.copy($scope.existed_schemas);
        if ($scope.editflag) {  // Edit schema remove step1
          let idx = $scope.existed_schema_inmodal.indexOf($scope.newschema.name);
          if (idx >= 0) {
            $scope.existed_schema_inmodal.splice(idx, 1);
          }
          $scope.addsteps.splice(0, 1); 
          if ($scope.newschema.index_type === 1 || ($scope.newschema.with_hbase && $scope.newschema.index_type === -1)) {
            let idx = $scope.addsteps.indexOf('step3');
            if (idx >= 0) {
              $scope.addsteps.splice(idx, 1);
            }
          }
          let flag = false;
          $scope.newschema.fields.map(f => {
            if (CField.queryFilter(f)) {
              flag = true;
            }
          });
          if ($scope.newschema.content_fields.length > 0) {
            flag = true;
          }
          if (!flag) {
            let idx = $scope.addsteps.indexOf('step5');
            if (idx >= 0) {
              $scope.addsteps.splice(idx, 1);
            }
          }
          $scope.rowkey_expression.parsestr($scope.newschema.rowkey_expression, $scope.newschema.fields);
          $scope.table_expression.parsestr($scope.newschema.table_expression, $scope.newschema.fields);
        } else { // New schema remove step5
          $scope.addsteps.splice(4, 1);
        }

        /**
         * $scope.limitWeight:  Add lower bound to weight of new query field
        $scope.limitWeight = function() {
          $scope.new_query_field.weight = CUtil.limitNumber($scope.new_query_field.weight,1);
        };
        /**
         * Step control functions
         * $scope.next:     Skip to next page
         * $scope.prev:     Back to previous page
         * $scope._ok:      ok function at the end of dialog
         * $scope.ok:       confirmation dialog at the end of dialog
         * $scope.cancel:   close dialog
        $scope.withHbaseChanged = function() {
          if ($scope.newschema.with_hbase && $scope.newschema.index_type === -1) {
            $scope.removestep('step3');
          } else if ($scope.newschema.index_type !== 1) {
            $scope.recoverstep('step3');
          }
        };
        $scope.chooseType = function(type) {
          $scope.newschema.index_type = type;
          if (type === 1) {
            $scope.removestep('step3');
          } else {
            $scope.recoverstep('step3');
          }
        };
        $scope.checkQueryFields = function() {
          let flag = false;
          $scope.newschema.fields.map(f => {
            if (CField.queryFilter(f)) {
              flag = true;
            }
          });
          if ($scope.newschema.content_fields.length > 0) {
            flag = true;
          }
          return flag;
        };
        $scope.addField = function(new_field) {
          if (angular.isDefined(new_field.content_field) && new_field.content_field === null) {
            new_field.content_field = '';
          }
          $scope.newschema.addField(new_field);
          if (!$scope.checkQueryFields()) {
            $scope.removestep('step5');
          } else {
            $scope.recoverstep('step5');
          }
        };
        $scope.fieldStoreTypeChanged = function() {
          $scope.new_field.indexed = false;
          $scope.new_field.content_field = '';
          $scope.new_field.index_type = '';
        };
        $scope.addContentField = function(new_content_field) {
          $scope.newschema.addContentField(new_content_field);
          if (!$scope.checkQueryFields()) {
            $scope.removestep('step5');
          } else {
            $scope.recoverstep('step5');
          }
        };
        $scope.checkContentField = function() {
          let existed = [];
          $scope.newschema.content_fields.map(cfd => existed.push(cfd.name));
          if (!$scope.new_content_field.name || !$scope.new_content_field.type) {
            return false;
          } else if (!CField.rule($scope.new_content_field.name)) {
            return false;
          } else if (existed.includes($scope.new_content_field.name)) {
            return false;
          } else {
            return true;
          }
        };
        $scope.checkInnerField = function() {
          let existed = [];
          $scope.newschema.inner_fields.map(ifd => existed.push(ifd.name));
          if (!$scope.new_inner_field.name || !$scope.new_inner_field.separator) {
            return false;
          } else if (!CField.rule($scope.new_inner_field.name)) {
            return false;
          } else if (existed.includes($scope.new_inner_field.name)) {
            return false;
          } else {
            return true;
          }
        };
        $scope.checkField = function() {
          let existed = [];
          $scope.newschema.fields.map(fd => existed.push(fd.name));
          if (!CField.rule($scope.new_field.name)) {
            return false;
          } else if (existed.includes($scope.new_field.name)) {
            return false;
          } else {
            return $scope.new_field.validate($scope.newschema.with_hbase);
          }
        };
        $scope.validateQueryField = function() {
          let existed = [];
          $scope.newschema.query_fields.map(qfd => existed.push(qfd.name));
          if (!$scope.new_query_field.name || !$scope.new_query_field.weight) {
            return false;
          } else if (existed.includes($scope.new_query_field.name)) {
            return false;
          } else {
            return true;
          }
        };
        $scope.removeField = function(index) {
          $scope.newschema.removeField(index);
          if (!$scope.checkQueryFields()) {
            $scope.removestep('step5');
          } else {
            $scope.recoverstep('step5');
          }
        };
        $scope.removeContentField = function(index) {
          $scope.newschema.removeContentField(index);
          if (!$scope.checkQueryFields()) {
            $scope.removestep('step5');
          } else {
            $scope.recoverstep('step5');
          }
        };
        $scope.removestep = function(name) {
          let idx = $scope.addsteps.indexOf(name);
          if (idx > 0) {
            $scope.addsteps.splice(idx, 1);
          }
        };
        $scope.recoverstep = function(name) {
          let idx = $scope.addsteps.indexOf(name);
          if (idx < 0) {
            // Add step
            let newsteps = [];
            ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'].map(step => {
              if ($scope.addsteps.includes(step) || step===name) {
                newsteps.push(step);
              }
            });
            $scope.addsteps = newsteps;
          }
        };
        $scope.next = function() {
          $scope.curstep = ($scope.curstep + 1) % $scope.addsteps.length;
        };
        $scope.prev = function() {
          if (!$scope.editflag) {
            if ($scope.addsteps[$scope.curstep] === 'step2') {
              $scope.newschema.resetval('name');
              $scope.newschema.resetval('with_hbase');
            } else if ($scope.addsteps[$scope.curstep] === 'step3') {
              $scope.new_content_field = { name: null, type: null };
              $scope.new_inner_field = { name: null, separator: null };
              $scope.newschema.resetval('content_fields');
              $scope.newschema.resetval('inner_fields');
            } else if ($scope.addsteps[$scope.curstep] === 'step4') {
              $scope.new_field = new CField({ name: '', store_type: '' });
              $scope.newschema.resetval('fields');
            } else if ($scope.addsteps[$scope.curstep] === 'step5') {
              $scope.new_query_field = { name: null, weight: null };
              $scope.newschema.resetval('query_fields');
            } else if ($scope.addsteps[$scope.curstep] === 'step6') {
              $scope.rowkey_inedit = false;
              $scope.table_inedit = false;
              $scope.rowkey_expression = new CExpression();
              $scope.table_expression = new CExpression();
              $scope.newschema.resetval('rowkey_expression');
              $scope.newschema.resetval('table_expression');
            }
          }
          $scope.curstep = ($scope.curstep - 1) % $scope.addsteps.length;
        };
        $scope.getStep = function(name) {
          if ($scope.editflag) {
            return $scope.addsteps.indexOf(name)+1;
          } else {
            return $scope.addsteps.indexOf(name);
          }
        };
        $scope.getTotalStep = function() {
          if ($scope.editflag) {
            return $scope.addsteps.length;
          } else {
            return $scope.addsteps.length-1;
          }
        };
        $scope.editrowkey = function() {
          $scope.rowkey_inedit = !$scope.rowkey_inedit;
          $scope.rowkey_curitem = {type: null, content: null};
          $scope.rowkey_contents = {fun: null, funarg: null};
          if ($scope.rowkey_inedit) {
            $http.get(`${GLOBAL.host}/expression/list`).then((data) => {
              $scope.expfuns = new CExpfunction(data.data.expressions);
            });
          }
        };
        $scope.addRowkeyExpItem = function() {
          if ($scope.rowkey_curitem.type === 'FUNCTION') {
            $scope.rowkey_curitem.content = $scope.expfuns.formatfunction($scope.rowkey_contents.fun, $scope.rowkey_contents.funarg);
          }
          $scope.rowkey_expression.addItem($scope.rowkey_curitem);
          $scope.newschema.rowkey_expression = $scope.rowkey_expression.formatstr();
          $scope.rowkey_curitem = {type: null, content: null};
          $scope.rowkey_contents = {fun: null, funarg: null};
        };
        $scope.deleteRowkeyExpItem = function(idx) {
          $scope.rowkey_expression.deleteItem(idx);
          $scope.newschema.rowkey_expression = $scope.rowkey_expression.formatstr();
        };
        $scope.changeRowkeyFunction = function() {
          $scope.rowkey_contents.funarg = '';
          $scope.rowkey_funarg_style = {};
          $scope.rowkeyDescHtml = $sce.trustAsHtml($scope.expfuns.descfunction($scope.rowkey_contents.fun, 0));
        };
        $scope.changeRowkeyFunArg = function() {
          $scope.rowkeyDescHtml = $sce.trustAsHtml($scope.expfuns.descfunction($scope.rowkey_contents.fun, $scope.rowkey_contents.funarg.split(',').length-1));
          if (!$scope.expfuns.checkarguments($scope.rowkey_contents.fun, $scope.rowkey_contents.funarg)) {
            $scope.rowkey_funarg_style = {'background-color': 'pink'};
          } else {
            $scope.rowkey_funarg_style = {};
          }
        };
        $scope.edittable = function() {
          $scope.table_inedit = !$scope.table_inedit;
          $scope.table_curitem = {type: null, content: null};
          $scope.table_contents = {fun: null, funarg: null};
          if ($scope.table_inedit) {
            $http.get(`${GLOBAL.host}/expression/list`).then((data) => {
              $scope.expfuns = new CExpfunction(data.data.expressions);
            });
          }
        };
        $scope.addTableExpItem = function() {
          if ($scope.table_curitem.type === 'FUNCTION') {
            $scope.table_curitem.content = $scope.expfuns.formatfunction($scope.table_contents.fun, $scope.table_contents.funarg);
          }
          $scope.table_expression.addItem($scope.table_curitem);
          $scope.newschema.table_expression = $scope.table_expression.formatstr();
          $scope.table_curitem = {type: null, content: null};
          $scope.table_contents = {fun: null, funarg: null};
        };
        $scope.deleteTableExpItem = function(idx) {
          $scope.table_expression.deleteItem(idx);
          $scope.newschema.table_expression = $scope.table_expression.formatstr();
        };
        $scope.changeTableFunction = function() {
          $scope.table_contents.funarg = '';
          $scope.table_funarg_style = {};
          $scope.tableDescHtml = $sce.trustAsHtml($scope.expfuns.descfunction($scope.table_contents.fun, 0));
        };
        $scope.changeTableFunArg = function() {
          $scope.tableDescHtml = $sce.trustAsHtml($scope.expfuns.descfunction($scope.table_contents.fun, $scope.table_contents.funarg.split(',').length-1));
          if (!$scope.expfuns.checkarguments($scope.table_contents.fun, $scope.table_contents.funarg)) {
            $scope.table_funarg_style = {'background-color': 'pink'};
          } else {
            $scope.table_funarg_style = {};
          }
        };
        $scope._ok = okfunc;
        $scope.ok = function() {
          $ngConfirm({
            title: title,
            content: confirm_content,
            scope: $scope,
            closeIcon: true,
            buttons: {
              Yes: {
                text: yes_text,
                action: function(scope) {
                  scope._ok();
                  modalInstance.close();
                }
              },
              No: {
                text: no_text,
              }
            }
          });
        };
        $scope.cancel = function() {
          modalInstance.close();
        };
      }] // END of controller
    }); // END of modal instance
    */
  }; // END of template function

  /**
   * Schema operations
   * $scope.addSchema:      Add new schema using modal dialog.
   * $scope.editSchema:     Edit (delete and create a new one) current schema using modal dialog.
   * $scope.selectSchema:   Config current schema that displayed($scope.page.schema).
   * $scope.checkDisplay:   Action function of checkbox on the top of 'Show in results'.
   * $scope.changeDisplay:  Action function of checkbox bind to each fields.
   * $scope.deleteSchema:   Delete current schema.
   */
  $scope.schemaDlg_init = function() {
    $scope.addsteps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
    $scope.curstep = 0;
  };
  $scope.schemaDlg_init();
  $scope.schemaDlgGetStep = function(name) {
    if ($scope.editflag) {
      return $scope.addsteps.indexOf(name)+1;
    } else {
      return $scope.addsteps.indexOf(name);
    }
  };
  $scope.schemaDlgGetTotalStep = function() {
    if ($scope.editflag) {
      return $scope.addsteps.length;
    } else {
      return $scope.addsteps.length-1;
    }
  };
  $scope.schemaDlgNext = function() {
    $scope.curstep = ($scope.curstep + 1) % $scope.addsteps.length;
  };
  $scope.schemaDlgPrev = function() {
    $scope.curstep = ($scope.curstep - 1) % $scope.addsteps.length;
  };
  $scope.schemaDlgRemoveStep = function(name) {
    let idx = $scope.addsteps.indexOf(name);
    if (idx > 0) {
      $scope.addsteps.splice(idx, 1);
    }
  };
  $scope.schemaDlgRecoverStep = function(name) {
    let idx = $scope.addsteps.indexOf(name);
    if (idx < 0) {
      // Add step
      let newsteps = [];
      ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'].map(step => {
        if ($scope.addsteps.includes(step) || step===name) {
          newsteps.push(step);
        }
      });
      $scope.addsteps = newsteps;
    }
  };
  $scope.addSchemaDlg_init = function() {
    $scope.editflag = false;
    $scope.newschema = new CSchema({name: ''});
    $scope.existed_schema_inmodal = angular.copy($scope.existed_schemas);
  };
  $scope.addSchemaChooseType = function(type) {
    $scope.newschema.index_type = type;
    if (type === 1) {
      $scope.schemaDlgRemoveStep('step3');
    } else {
      $scope.schemaDlgRecoverStep('step3');
    }
  };
  $scope.addSchema = function() {
    if (!$rootScope.functions.initial()) { return; }
    $scope.schemaDlg_init();
    if (!schemaDlg.isActive()) {
      $scope.addSchemaDlg_init();
      schemaDlg.show();
    }
    /*
    $scope.modalDlg(
      $translate.instant('ADD_NEW_SCHEMA'), 
      $translate.instant('CONFIRM_ADD_SCHEMA'),
      new CSchema({name:''}),
      function() {
        schemaServe.addSchema(this.newschema.storedJson()).then((data) => {
          if (data.data.result.error_code !== 0) {
            $ngConfirm({
              title: $translate.instant('CONFIRM_TITLE_CREATE_SCHEMA_ERROR'),
              content: data.data.result.error_desc,
              closeIcon: true,
              buttons: {
                OK: {
                  text: ok_text
                }
              }
            });
            $scope.initial();
          } else {
            schemaServe.addSchemaLocal(this.newschema.name, '', $scope.username).then(() => {
              $scope.initial();
            });
          }
        });
      }
    );
    */
  };
  $scope.editSchema = function() {
    if (!$rootScope.functions.initial()) { return; }
    if (angular.isDefined($scope.page.tables)) {
      if ($scope.page.tables.length > 0) {
        /*
        $ngConfirm({
          title: warn_text, 
          content: $translate.instant('CONFIRM_EDIT_SCHEMA_ERR'),
          closeIcon: true,
          buttons: {
            OK: {
              text: ok_text
            }
          }
        });
        */
      } else {
        /*
        $scope.modalDlg(
          $translate.instant('EDIT_SCHEMA'), 
          $translate.instant('CONFIRM_EDIT_SCHEMA'),
          angular.copy($scope.page.schema),
          function() {
            let schema_added = this.newschema.storedJson();
            schemaServe.deleteSchema($scope.page.schema.name).then(() => {
              schemaServe.addSchema(schema_added).then((data) => {
                if (data.data.result.error_code !== 0) {
                  // delete schema succeful but new schema failed
                  $ngConfirm({
                    title: $translate.instant('CONFIRM_TITLE_CREATE_SCHEMA_ERROR'),
                    content: data.data.result.error_desc,
                    closeIcon: true,
                    buttons: {
                      OK: {
                        text: ok_text
                      }
                    }
                  });
                  schemaServe.deleteSchemaLocal($scope.page.schema.name).then(() => {
                    $scope.initial();
                  });
                } else {
                  // delete & new schema successful in remote server.
                  schemaServe.deleteSchemaLocal($scope.page.schema.name).then(() => {
                    schemaServe.addSchemaLocal(schema_added.name, '', $scope.username).then(() => {
                      $scope.initial();
                    });
                  });
                }
              });
            });
          }
        );
        */
      }
    }
  };
  $scope.selectSchema = function(index) {
    if (!$rootScope.functions.initial()) { return; }
    if ($scope.schemas.length === 0) { return; }
    if (index < 0) { index = 0; }
    // Set active flag
    $scope.page.schema = $scope.schemas[index];
    $scope.schemas.map(sc => sc.actived = false);
    $scope.schemas[index].actived = true;
    // Get related tables
    tableServe.getTablesBySchema($scope.page.schema.name).then((data) => {
      $scope.page.tables = [];
      if (angular.isArray(data.data.tables)) {
        if (data.data.tables.length > 0) {
          $scope.page.tables = data.data.tables;
        }
      }
    });
    // Refresh display status of fields
    [$scope.page.schema_display, $scope.page.schema_display_indeter] = $scope.page.schema.displayStatus();
  };
  $scope.contentQueryWeight = function(content_field) {
    let weight = 0;
    $scope.page.schema.query_fields.map(qfd => {
      if (qfd.name === content_field) {
        weight = qfd.weight;
      }
    });
    return weight;
  };
  $scope.checkDisplay = function() {
    [$scope.page.schema_display, $scope.page.schema_display_indeter] = $scope.page.schema.changeDisplayStatus();
  };
  $scope.changeDisplay = function() {
    [$scope.page.schema_display, $scope.page.schema_display_indeter] = $scope.page.schema.displayStatus();
  };
  $scope.indexedInfo = function(value) {
    if (value) {
      return 'YES';
    } else {
      return 'NO';
    }
  };
  $scope.deleteSchema = function() {
    if (!$rootScope.functions.initial()) { return; }
    /*
    if (angular.isDefined($scope.page.tables)) {
      if ($scope.page.tables.length > 0) {
        $ngConfirm({
          title: warn_text, 
          content: $translate.instant('CONFIRM_DELETE_SCHEMA_ERR'),
          closeIcon: true,
          buttons: {
            OK: {
              text: ok_text
            }
          }
        });
      } else { // There are not any tables belong to the schema
        $ngConfirm({
          title: confirmation_text,
          content: $translate.instant('CONFIRM_DELETE_SCHEMA'),
          closeIcon: true,
          scope: $scope,
          buttons: {
            Yes: {
              text: yes_text,
              action: function() {
                schemaServe.deleteSchema($scope.page.schema.name).then(() => {
                  // delete schema info in local db
                  schemaServe.deleteSchemaLocal($scope.page.schema.name);
                  $scope.initial();
                });
              }
            },
            No: {
              text: no_text
            }
          }
        });
      }
    }
    */
  };
}])
  .directive('indeterminate', function() {
    return {
      restrict: 'A',

      link(scope, elem, attr) {
        var watcher = scope.$watch(attr.indeterminate, function(value) {
          elem[0].indeterminate = value;
        });

        scope.$on('$destory', function() {
          watcher();
        });
      }
    };
  });