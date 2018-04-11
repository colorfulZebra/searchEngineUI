'use strict';

angular.module('basic').controller('TableCtrl', ['$scope', '$http', '$q', 'GLOBAL', '$translate', '$stateParams', '$rootScope', 'CUtil', 'CField', 'CSchema', 'CTable', 'CHost', 'tableServe', 'schemaServe', function ($scope, $http, $q, GLOBAL, $translate, $stateParams, $rootScope, CUtil, CField, CSchema, CTable, CHost, tableServe, schemaServe) {
  
  $rootScope.global.tab = 'table';
  /**
   * Translation infos
   */
  let yes_text = $translate.instant('YES');
  let no_text = $translate.instant('NO');
  //let ok_text = $translate.instant('OK');
  let create_table_text = $translate.instant('CONFIRM_ADD_TABLE');
  let edit_table_text = $translate.instant('CONFIRM_EDIT_TABLE');
  let delete_table_text = $translate.instant('CONFIRM_DELETE_TABLE');
  let create_table_err = $translate.instant('CONFIRM_TITLE_CREATE_TABLE_ERROR');
  let edit_table_err = $translate.instant('CONFIRM_TITLE_EDIT_TABLE_ERROR');

  /**
   * UIkit objects
   */
  let addTableDlg = UIkit.modal('#addTableDlg', {bgclose: false});
  let indexerToggle = UIkit.toggle('#indexerTable', {target:'#indexerTable', animation:'uk-animation-fade', duration: 500});
  let editTableDlg = UIkit.modal('#editTableDlg', {bgclose: false});

  /**
   * Utility functions
   * $scope.limitLen:    limit length of string to 15.
   * $scope.initial:     Initial function of 'Table' page.
   */
  $scope.username = $rootScope.functions.getUsername();
  $scope.limitLen = function(item) {
    return CUtil.cutString(item, 15);
  };
  $scope.indexedInfo = function(value) {
    if (value) {
      return 'YES';
    } else {
      return 'NO';
    }
  };
  $scope.nullFilter = function(item) {
    if (!angular.isDefined(item)) { return false; }
    return item.toString();
  };
  $scope.initial = function() {
    if (!$rootScope.functions.initial()) { return; }
    if ($rootScope.functions.isAdmin()) { $rootScope.functions._logout(); }
    $scope.page = { table: {} };
    schemaServe.getSchemaLocalByUser($scope.username).then(data => {
      let userschemas = [];
      if (angular.isArray(data.data)) {
        data.data.map(sc => userschemas.push(sc.name));
      }
      let asyncGetLst = [];
      userschemas.map(sc => asyncGetLst.push(tableServe.getTablesBySchema(sc)));
      $scope.tables = [];
      $q.all(asyncGetLst).then(function(data) {
        data.map(result => {
          if (angular.isArray(result.data.tables)) {
            if (result.data.tables.length > 0) {
              result.data.tables.map(tmptable => $scope.tables.push(new CTable({name:tmptable})));
            }
          }
        });
        // Select table by state params
        if (!$stateParams.linktable || $stateParams.linktable === '') {
          $scope.selectTable(0);
        } else {
          let table_index = $scope.tables.map(tmptable => tmptable.name===$stateParams.linktable).indexOf(true);
          if (table_index >= 0 && table_index < $scope.tables.length) {
            $scope.selectTable(table_index);
          } else {
            $scope.selectTable(0);
          }
        }
      });
    });
  };
  $scope.initial();

  /**
   * Add table
   */
  $scope.addTable_init = function() {
    $scope.newtable = new CTable({name:''});
    //$scope.newtable.schema = new CSchema({name: null});
  };
  $scope.addTable_init();
  $scope.addTable = function() {
    if (!$rootScope.functions.initial()) { return; }
    if (!addTableDlg.isActive()) {
      $q.all([schemaServe.getSchemaList(), schemaServe.getSchemaLocalByUser($scope.username), tableServe.getTableList()]).then((data) => {
        $scope.schemas = [];
        $scope.existed_tables = [];
        if (angular.isArray(data[2].data.tables)) {
          $scope.existed_tables = data[2].data.tables;
        }
        let userschema_lst = [];
        if (angular.isArray(data[1].data)) {
          data[1].data.map(sc => userschema_lst.push(sc.name));
        }
        if (angular.isArray(data[0].data.schemas)) {
          data[0].data.schemas.map(sc => {
            if (userschema_lst.includes(sc.name)) {
              $scope.schemas.push(new CSchema(sc));
            }
          });
        }
        $scope.addTable_init();
        addTableDlg.show();
      });
    }
  };
  $scope.limitRegionNum = function() {
    $scope.newtable.hbase.region_num = CUtil.limitNumber($scope.newtable.hbase.region_num, 4);
  };
  $scope.limitShards = function() {
    $scope.newtable.solr.shards = CUtil.limitNumber($scope.newtable.solr.shards, 1);
  };
  $scope.limitReplicas = function() {
    $scope.newtable.solr.replicas = CUtil.limitNumber($scope.newtable.solr.replicas, 2);
  };
  $scope.addTableCheck = function() {
    return $scope.newtable.checkBasicInfo($scope.existed_tables);
  };
  $scope.addTable_ok = function() {
    UIkit.modal.confirm(create_table_text, function() {
      tableServe.createTable($scope.newtable.storedJson()).then((data) => {
        if (data.data.result.error_code !== 0) {
          //UIkit.modal.alert(`${create_table_err}: ${data.data.result.error_desc}`, {labels: { 'Ok': ok_text }});
          $scope.initial();
          UIkit.notify(`${create_table_err}: ${data.data.result.error_desc}`, {status: 'danger', timeout: 10000});
        } else {
          $scope.initial();
          UIkit.notify($translate.instant('ADD_NEW_TABLE_SUCCESS'), {status: 'success', timeout: 3000});
        }
      });
      if (addTableDlg.isActive()) {
        addTableDlg.hide();
      }
    }, {
      labels: {
        'Ok': yes_text,
        'Cancel': no_text
      }
    });
  };
  /**
   * Edit table
   */
  $scope.field_type = CField.STORE_TYPES;
  $scope.field_index_type = CField.INDEX_TYPES;
  $scope.typeFilter = CField.typeFilter;
  $scope.editTable_init = function() {
    $scope.request_list = [];
    $scope.curfield = new CField({name: ''});
  };
  $scope.editTable_init();
  $scope.editTable = function() {
    if (!$rootScope.functions.initial()) { return; }
    if (!editTableDlg.isActive()) {
      $scope.editTable_init();
      editTableDlg.show();
    }
  };
  $scope.editField = function(index) {
    $scope.editModeFlag = true;
    $scope.curindex = index;
    $scope.curfield = angular.copy($scope.curschema.fields[index]);
  };
  $scope.cancelEdit = function() {
    $scope.curfield.emptyField();
    $scope.editModeFlag = false;
    delete $scope.curindex;
  };
  $scope.saveField = function() {
    $scope.curschema.updateField($scope.curindex, $scope.curfield);
    $scope.curfield.emptyField();
    $scope.editModeFlag = false;
    delete $scope.curindex;
  };
  $scope.checkField = function(flag=true) {
    if (!angular.isDefined($scope.curschema)) { return false; }
    let tables = [];
    $scope.curschema.fields.map(f => tables.push(f.name));
    if (!CField.rule($scope.curfield.name)) {
      return false;
    } else if (tables.includes($scope.curfield.name) && flag) {
      return false;
    } else {
      return $scope.curfield.validate();
    }
  };
  $scope._diffSchema = function() {
    // Search changed and added fields
    let {added:add_lst, deleted:delete_lst, updated:update_lst} = $scope.page.table.schema.diffFields($scope.curschema);
    add_lst.map(addcmd => {
      $scope.request_list.push({command:'add_field', table:$scope.page.table.name, field:addcmd});
    });
    delete_lst.map(deletecmd => {
      $scope.request_list.push({command:'delete_field', table:$scope.page.table.name, field:{name:deletecmd.name}});
    });
    update_lst.map(updatecmd => {
      $scope.request_list.push({command:'update_field', table:$scope.page.table.name, field:updatecmd});
    });
  };
  $scope._httpInQueue = function(idx) {
    if (idx < $scope.request_list.length) {
      schemaServe.updateSchema($scope.request_list[idx]).then((data) => {
        $scope.request_list[idx].return_code = data.data.result.error_code;
        $scope.request_list[idx].return_desc = data.data.result.error_desc;
        idx += 1;
        $scope._httpInQueue(idx);
      });
    } else {
      let err_flag = false;
      let result_lst = [];
      for (let item of $scope.request_list) {
        if (item.return_code !== 0) {
          err_flag = true;
          result_lst.push('Action:' + item.command + ' of "' + item.field.name + '"    Error:' + item.return_desc);
        }
      }
      if (err_flag) {
        //UIkit.modal.alert(`${edit_table_err}:\n ${result_lst.join('\n')}`, {labels: { 'Ok': ok_text }});
        $scope.initial();
        UIkit.notify(`${edit_table_err}:\n ${result_lst.join('\n')}`, {status: 'danger', timeout: 10000});
      } else {
        $scope.initial();
        UIkit.notify($translate.instant('EDIT_TABLE_FIELDS_SUCCESS'), {status: 'success', timeout: 3000});
      }
    }
  };
  $scope.checkEditTable = function() {
    if (angular.isDefined($scope.curschema)) {
      if ($scope.curschema.fields === null || $scope.curschema.fields.length === 0) {
        //$scope.modalmsg = "No fields of schema defined!";
        $scope.modalmsg = $translate.instant('MODALMSG_NO_FIELDS');
        return false;
      } else {
        $scope.modalmsg = '';
        return true;
      }
    }
  };
  $scope.editTable_ok = function() {
    UIkit.modal.confirm(edit_table_text, function() {
      if (editTableDlg.isActive()) {
        editTableDlg.hide();
        $scope._diffSchema();
        $scope._httpInQueue(0);
        $scope.initial();
      }
    }, {
      labels: {
        'Ok': yes_text,
        'Cancel': no_text
      }
    });
  };
  $scope.editTable_cancel = function() {
    $scope.curschema = angular.copy($scope.page.table.schema);
  };
  /**
   * Delete table
   */
  $scope.deleteTable = function() {
    if (!$rootScope.functions.initial()) { return; }
    UIkit.modal.confirm(delete_table_text, function() {
      tableServe.deleteTable($scope.page.table.name).then(() => {
        $scope.initial();
      });
    }, {
      labels: {
        'Ok': yes_text,
        'Cancel': no_text
      }
    });
  };
  /**
   * Select a table
   */
  $scope.selectTable = function(index) {
    if (!$rootScope.functions.initial()) { return; }
    if ($scope.tables.length === 0) { return; }
    $q.all([schemaServe.getSchemaByTable($scope.tables[index].name), tableServe.getIndexerHosts($scope.tables[index].name)]).then((data) => {
      // Set schema info
      $scope.page.table = $scope.tables[index];
      $scope.page.table.schema = new CSchema(data[0].data.schema);
      // Set active info
      $scope.tables.map(tmptable => tmptable.actived=false);
      $scope.tables[index].actived = true;
      // Set hosts
      $scope.page.indexer = [];
      if (angular.isArray(data[1].data.hosts)) {
        if (data[1].data.hosts.length > 0) {
          data[1].data.hosts.map(host => $scope.page.indexer.push(new CHost({name:host})));
        }
      }
      if (angular.isDefined($scope.page.host)) {
        $scope.page.host.actived = false;
      } else {
        $scope.page.host = {actived:false};
      }
      $scope.curschema = angular.copy($scope.page.table.schema);
    });
  };
  /**
   * Indexer controllers
   */
  $scope.refreshIndexerStatus = function() {
    tableServe.getIndexerStatus($scope.page.table.name, $scope.page.host.name).then((data) => {
      $scope.page.host.status = data.data.jmx;
      $scope.page.colname = $scope.page.host.itemlst();
      $scope.page.rowitem = $scope.page.host.attributelst();
    });
  };
  $scope.selectIndexer = function(idx) {
    if (angular.isDefined($scope.page.hostidx) && $scope.page.hostidx!==idx) { //indexer host changed
      $scope.page.host.actived = false;
    }
    $scope.page.colname = [];
    $scope.page.rowitem = [];
    $scope.page.host = $scope.page.indexer[idx];
    if ($scope.page.host.actived) {
      $scope.page.host.actived = false;
    } else {
      $scope.refreshIndexerStatus();
      $scope.page.hostidx = idx;
      $scope.page.host.actived = true;
    }
    indexerToggle.toggle();
  };
}])
  .filter('definedfilter', function() {
    return function(item) {
      if (angular.isDefined(item)) { return item.toString(); }
      return '/';
    };
  });
