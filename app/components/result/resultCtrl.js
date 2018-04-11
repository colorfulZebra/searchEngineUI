'use strict';

/**
 * Search Result Controller
 */
angular.module('basic').controller('ResultCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'hotkeys', '$http', '$q', '$window', 'CUtil', 'CField', 'CSchema', 'CTable', 'searchServe', 'schemaServe', 'tableServe', function ($scope, $rootScope, $state, $stateParams, hotkeys, $http, $q, $window, CUtil, CField, CSchema, CTable, searchServe, schemaServe, tableServe) {

  /**
   * Tool functions
   */
  $scope.getColor = function(idx) {
    let colors = ['result-odd', 'result-even'];
    return colors[parseInt(idx/4) % 2];
  };
  $scope.limitLen = function(item) {
    return CUtil.cutString(item, 20);
  };
  /**
   * Initial parameters
   */
  $scope.showCtrl = [];
  $scope.advancedSearchFlag = true;
  $scope.content = angular.isDefined($rootScope.functions.getCookie('keyschema')) ? $rootScope.functions.getCookie('keyword') : $stateParams.content;
  $scope.schema = angular.isDefined($rootScope.functions.getCookie('keyschema')) ? $rootScope.functions.getCookie('keyschema') : $stateParams.schema;
  $scope.condition = '';
  $scope.page = {
    schema : {},
    tables: [],
    fields: {
      hidden:['id', '_table_'], 
      show:[]
    },
    rows: 10,      //Rows per page
    rowOptions:[10,20,30,50],
    pagination:{
      current : 1, //Current page
      limit: 9,    //How many items in pagination
      total: 0,    //Total items
      pages: 0,    //Total pages
      items: []    //Items displayed in page
    },
  };

  /**
   * Pagination functions
   */
  $scope.pageInit = function() {
    let tmppages = Math.floor($scope.page.pagination.total / $scope.page.rows);
    if (tmppages*$scope.page.rows < $scope.page.pagination.total) {
      $scope.page.pagination.pages = tmppages + 1;
    } else {
      $scope.page.pagination.pages = tmppages;
    }
    if ($scope.page.pagination.pages > 100) {
      $scope.page.pagination.pages = 100;
    }
    $scope.page.pagination.items = [];
    if ($scope.page.pagination.pages <= $scope.page.pagination.limit) {
      for(let i = 1; i <= $scope.page.pagination.pages; i++) {
        $scope.page.pagination.items.push(i);
      }
    } else {
      for(let i = 1; i < $scope.page.pagination.limit-1; i++) {
        $scope.page.pagination.items.push(i);
      }
      $scope.page.pagination.items.push('....');
      $scope.page.pagination.items.push($scope.page.pagination.pages);
    }
  };
  $scope.pageNext = function() {
    if ($scope.page.pagination.current < $scope.page.pagination.pages) {
      $scope.page.pagination.current = $scope.page.pagination.current + 1;
      $scope._choose();
    }
  };
  $scope.pagePrev = function() {
    if ($scope.page.pagination.current > 0) {
      $scope.page.pagination.current = $scope.page.pagination.current - 1;
      $scope._choose();
    }
  };
  $scope.pageChanged = function(index) {
    $scope.page.pagination.current = $scope.page.pagination.items[index];
    $scope._choose();
  };
  $scope.pageResize = function() {
    let safelimit = Math.floor($scope.page.pagination.limit/2);
    $scope.page.pagination.items = [];
    $scope.page.pagination.items.push(1);
    if ($scope.page.pagination.pages > $scope.page.pagination.limit) {
      if ($scope.page.pagination.current <= safelimit) {
        for(let i = 2; i < $scope.page.pagination.limit-1; i++) {
          $scope.page.pagination.items.push(i);
        }
        $scope.page.pagination.items.push('....');
        $scope.page.pagination.items.push($scope.page.pagination.pages);
      } else if ($scope.page.pagination.current > safelimit && $scope.page.pagination.current < $scope.page.pagination.pages-safelimit) {
        $scope.page.pagination.items.push('...');
        for (let i = $scope.page.pagination.current-safelimit+2; i <= $scope.page.pagination.current+safelimit-2; i++) {
          $scope.page.pagination.items.push(i);
        }
        $scope.page.pagination.items.push('....');
        $scope.page.pagination.items.push($scope.page.pagination.pages);
      } else {
        $scope.page.pagination.items.push('...');
        for(let i = $scope.page.pagination.pages-$scope.page.pagination.limit+3; i <= $scope.page.pagination.pages; i++) {
          $scope.page.pagination.items.push(i);
        }
      }
    }
  };
  /**
   * Search control functions
   * $scope.initial:      Initial function to search first schema by 'key words'.
   * $scope._choose:      query function to get dataset.
   * $scope.chooseSchema: when select a schema, query all tables belong to the schema by 'key words'.
   * $scope.choose:       when select a table of a schema, query the table by 'key words'.
   * $scope.pageChanged:  when click next page or previous page.
   * $scope.search:       when 'key words' changed and re-enter the search button.
   */
  $scope.initial = function() {
    if (!$rootScope.functions.initial()) { return; }
    // Get schema list and initial display status.
    $scope.username = $rootScope.functions.getUsername();
    $q.all([schemaServe.getSchemaList(), schemaServe.getSchemaLocalByUser($scope.username)]).then((data) => {
      $scope.schemas = [];
      let userschema_lst = [];
      if (angular.isArray(data[1].data)) {
        data[1].data.map(sc => userschema_lst.push(sc.name));
      }
      if (angular.isArray(data[0].data.schemas)) {
        if (data[0].data.schemas.length > 0) {
          data[0].data.schemas.map(sc => {
            if (userschema_lst.includes(sc.name) || $rootScope.functions.isAdmin()) {
              $scope.schemas.push(new CSchema(sc));
            }
          });
        }
      }
      // old -> new: ByFile -> ByMysql
      if ($rootScope.functions.isAdmin()) {
        $scope.schemas.map(sc => {
          sc.fields.map(fd => fd.enable_in_result = true);
        });
      } else {
        $scope.schemas.map(sc => sc.initialDisplayStatusByMysql(data[1].data));
      }
      if ($scope.schema && $scope.schema.length > 0) {
        $scope.chooseSchema($scope.schemas.map(sc => sc.name === $scope.schema).indexOf(true));
      } else {
        $scope.chooseSchema(0);
      }
    });
  };
  $scope.initial();
  $scope._choose = function(){
    // format query condition
    let tables = [];
    $scope.page.tables.map(tmptable => {
      if (tmptable.actived) {
        tables.push(tmptable.name);
      }
    });
    if (!$scope.content) { $scope.content=''; }
    let start_num = ($scope.page.pagination.current-1)*$scope.page.rows;
    if (!start_num || start_num < 0) { start_num=0; }
    let fields = [];
    $scope.page.fields.hidden.map(fd => fields.push(fd));
    $scope.page.fields.show.map(fd => fields.push(fd.name));
    // call query service
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    searchServe.querySearch($scope.content, $scope.condition, start_num, $scope.page.rows, tables, fields).then((data) => {
      if (data.data.result && data.data.result.error_code !== 0) {
        UIkit.notify(data.data.result.error_desc, {status: 'danger', timeout: 10000});
      } else {
        $scope.data = data.data.data;
        if($scope.data) {
          $scope.page.pagination.total = $scope.data.total;
          if ($scope.page.pagination.current === 1) {
            $scope.pageInit();
          } else if ($scope.page.pagination.current > 1) {
            $scope.pageResize();
          } else {
            $scope.page.pagination.current = 1;
            $scope.pageInit();
          }
        }
      }
    });
  };
  $scope.chooseSchema = function(index) {
    if (!$rootScope.functions.initial()) { return; }
    // change to selected schema
    if ($scope.schemas.length === 0) { return; }
    if (index < 0) { index = 0; }
    $scope.schemas.map(sc => sc.actived=false);
    $scope.schemas[index].actived = true;
    $scope.page.schema = $scope.schemas[index];
    // get table list
    tableServe.getTablesBySchema($scope.page.schema.name).then((data) => {
      $scope.page.tables = [];
      if (angular.isArray(data.data.tables)) {
        if (data.data.tables.length > 0) {
          data.data.tables.map(tmptable => {
            $scope.page.tables.push(new CTable({name: tmptable}));
          });
        }
      }
      $scope.page.tables.map(tmptable => tmptable.actived=true);
      // format query fields
      $scope.page.fields.show = [];
      $scope.page.schema.fields.map(fd => {
        if (fd.enable_in_result) { $scope.page.fields.show.push(fd); }
      });
      $scope.page.pagination.current = 1;
      $scope._choose();
    });
  };
  $scope.choose = function(index){
    if (!$rootScope.functions.initial()) { return; }
    $scope.page.tables.map(tmptable => tmptable.actived=false);
    $scope.page.tables[index].actived = true;
    $scope.page.pagination.current = 1;
    $scope._choose();
  };
  $scope.search = function(){
    $scope.schema = $scope.page.schema.name;
    $scope.initial();
  };
  $scope.advancedSearch = function() {
    UIkit.offcanvas.hide();
    if ($scope.condition_key && $scope.condition_val) {
      $scope.condition = `${$scope.condition_key}:${$scope.condition_val}`;
    } else if ($scope.condition_key) {
      $scope.condition = `${$scope.condition_key}:*`;
    } else {
      $scope.condition = '';
    }
    $scope._choose();
  };
  $scope.configItemsPerPage = function() {
    UIkit.offcanvas.hide();
    $scope.page.pagination.current = 1;
    $scope._choose();
  };
  $scope.detail = function(index) {
    if (index < 0) { index = 0; }
    let item = $scope.data.docs[index];
    let pid = item.id;
    let ptable = item._table_;
    // if _table_ is null or undefined get first actived table
    if (!item._table_ || item._table_.length===0) {
      if (angular.isArray($scope.page.tables)) {
        if ($scope.page.tables.length > 0) {
          let active_idx = $scope.page.tables.map(tmptable => tmptable.actived).indexOf(true);
          if (active_idx >= 0) {
            ptable = $scope.page.tables[active_idx].name;
          }
        }
      }
    }
    $rootScope.functions.setCookie('keyword', $scope.content);
    $rootScope.functions.setCookie('keyschema', $scope.page.schema.name);
    $state.go('detail', {id: pid, table: ptable});
  };

  /**
   * Control sidebar options
   */
  $scope.chooseAdvancedSearch = function() {
    $scope.advancedSearchFlag = true;
  };
  $scope.chooseAdvancedConfig = function() {
    $scope.advancedSearchFlag = false;
  };

  /**
   * host keys
   */
  hotkeys.bindTo($scope)
    .add({
      combo: 'enter',
      allowIn: ['INPUT'],
      callback: $scope.search
    });
}])
  .directive('searchFocus', function($timeout) {
    return function(scope, element) {
      scope.$watch('showAdvance', function(newVal) {
        $timeout(function () {
          if (newVal) {
            element[0].focus();
          }
        });
      }, true);
    };
  });
