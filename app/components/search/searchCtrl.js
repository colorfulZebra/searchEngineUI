'use strict';

angular.module('basic').controller('SearchCtrl', ['$scope', 'hotkeys', '$state', '$rootScope', '$window', 'userServe', function ($scope, hotkeys, $state, $rootScope, $window, userServe) {

  $rootScope.global.tab = 'search';
  $rootScope.functions.clearCookie('keyword');
  $rootScope.functions.clearCookie('keyschema');
  let dlg = UIkit.modal('#loginDlg', {bgclose: false});

  $scope.login_initial = function() {
    $scope.login_username = '';
    $scope.login_password = '';
    $scope.readonly_flag = '';
    $scope.login_alert = {type:'warning', msg:'PLEASE_LOGIN'};
  };

  $scope.login = function() {
    $scope.login_initial();
    if (!dlg.isActive()) {
      dlg.show();
    }
  };

  $scope.login_ok = function() {
    $scope.readonly_flag = true;
    userServe.login($scope.login_username, $scope.login_password).then(data=> {
      if (data.data.result && !data.data.result.error_code) {
        $rootScope.functions._login($scope.login_username, data.data.token);
        $scope.readonly_flag = false;
        if (dlg.isActive()) {
          dlg.hide();
        }
      } else {
        $scope.login_username = '';
        $scope.login_password = '';
        $scope.login_alert = {type:'error', msg:'INVALIDATE_ACCOUNT'};
        $scope.readonly_flag = false;
      }
    });
  };

  $scope.login_check = function() {
    return $scope.login_username && $scope.login_password;
  };

  let loginevent = $rootScope.$on('loginDlg', function() {
    $scope.login();
  });
  $scope.$on('$destroy', loginevent);

  $scope.search = function(){
    if ($rootScope.functions.isLogin()) {
      $state.go('result', {'schema': '', 'content': $scope.content});
    } else {
      $scope.login();
    }
  };

  hotkeys.bindTo($scope)
    .add({
      combo: 'enter',
      allowIn: ['INPUT'],
      callback: () => {
        if (!dlg.isActive()) {
          $scope.search();
        } else {
          if ($scope.login_check()) {
            $scope.login_ok();
          }
        }
      }
    });

  $scope.initial = function() {
    if (!$rootScope.functions.isLogin()) {
      $scope.login();
    } else {
      let focusElem = $window.document.getElementById('mainSearchInput');
      if (focusElem) {
        focusElem.focus();
      }
    }
  };
  $scope.initial();

}]);
