'use strict';

angular.module('basic').controller('DetailCtrl', ['$scope', '$rootScope', '$q', '$http', '$stateParams', 'CUtil', 'CField', 'tableServe', 'schemaServe', 'searchServe', function($scope, $rootScope, $q, $http, $stateParams, CUtil, CField, tableServe, schemaServe, searchServe) {
  /*
  * Initial parameters
  */
  $scope.idparam = $stateParams.id;
  $scope.tableparam = $stateParams.table;

  $scope.cutLen = function(item) {
    return CUtil.cutString(item, 70);
  };

  /*
  * Initial functions
  */
  if (!$rootScope.functions.initial()) { return; }
  if ($scope.idparam && $scope.tableparam) {
    $q.all([searchServe.queryGet([$scope.idparam], [$scope.tableparam], []), schemaServe.getSchemaByTable($scope.tableparam)]).then((data) => {
      $scope.schema = data[1].data.schema;
      if (data[0].data.data.docs.length > 0) {
        $scope.item = data[0].data.data.docs[0];
      }
    });
  }

}]);