'use strict';

angular.module('basic').controller('HeaderCtrl', ['$scope', '$rootScope', '$state', '$translate', 'CLogin', 'CUser', 'userServe', function($scope, $rootScope, $state, $translate, CLogin, CUser, userServe) {

  let dlg = UIkit.modal('#changePwdDlg', {bgclose: false});

  $scope.logout = function() {
    UIkit.modal.confirm($translate.instant('CONFIRM_LOGOUT'), function() {
      $rootScope.functions._logout();
      $state.go('search');
    }, {
      labels: {
        'Ok': $translate.instant('YES'), 
        'Cancel': $translate.instant('NO')
      }
    });
  };

  $scope.changepwd_initial = function() {
    $scope.changepwd_login = new CLogin($rootScope.functions.getUsername());
    $scope.changepwd_dlgmessage = 'MODALMSG_FILL_IN_ALL';
    $scope.changepwd_validate = false;
  };

  $scope.changepwd_ok = function() {
    UIkit.modal.confirm($translate.instant('CONFIRM_UPDATE_USER'), function() {
      if (dlg.isActive()) {
        dlg.hide();
      }
      userServe.updateUser($scope.changepwd_login.name, $scope.changepwd_login.password);
    }, {
      labels: {
        'Ok': $translate.instant('YES'),
        'Cancel': $translate.instant('NO')
      }
    });
  };

  $scope.changepwd = function() {
    $scope.changepwd_initial();
    if (!dlg.isActive()) {
      dlg.show();
    }
  };

  $scope.updatePassword = function() {
    $scope.changepwd_login.resetFlag().checkRepeat().checkEmpty().checkPassword();
    $scope.changepwd_validate = $scope.changepwd_login.flag;
    if ($scope.changepwd_validate) {
      $scope.changepwd_dlgmessage = '';
    } else {
      $scope.changepwd_dlgmessage = $scope.changepwd_login.message;
    }
  };

  $scope.updateRepeat = function() {
    $scope.changepwd_login.resetFlag().checkPassword().checkEmpty().checkRepeat();
    $scope.changepwd_validate = $scope.changepwd_login.flag;
    if ($scope.changepwd_validate) {
      $scope.changepwd_dlgmessage = '';
    } else {
      $scope.changepwd_dlgmessage = $scope.changepwd_login.message;
    }
  };

  $scope.login = function() {
    $rootScope.$emit('loginDlg', {});
  };

}]);