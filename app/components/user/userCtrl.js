'use strict';

angular.module('basic').controller('UserCtrl', ['$scope', '$rootScope', '$translate', '$http', '$q', 'CUser', 'CLogin', 'userServe', 'schemaServe', 'tableServe', function($scope, $rootScope, $translate, $http, $q, CUser, CLogin, userServe, schemaServe, tableServe) {

  /**
   * Initial parameters
   * $scope.users:    user list.
   * $scope.page:     current page info.
   */
  $scope.users = [];
  $scope.page = {
    user: {}
  };
  let yes_text = $translate.instant('YES');
  let no_text = $translate.instant('NO');
  let ok_text = $translate.instant('OK');
  let new_user_text = $translate.instant('CONFIRM_ADD_USER');
  let delete_user_text = $translate.instant('CONFIRM_DELETE_USER');
  let delete_user_err_text = $translate.instant('CONFIRM_DELETE_USER_ERR');
  let update_user_text = $translate.instant('CONFIRM_UPDATE_USER');
  
  let userDlg = UIkit.modal('#userDlg', {bgclose: false});
  $scope.editflag = false;
  /**
   * controller functions
   * $scope.initial:  initial function for 'user' page
   */
  $scope.initial = function() {
    if (!$rootScope.functions.initial()) { return; }
    if (!$rootScope.functions.isAdmin()) { $rootScope.functions._logout(); }
    $rootScope.global.tab = 'user';
    $scope.users = [];
    $scope.page = {user:{}};
    userServe.getUserList().then(data => {
      if (angular.isArray(data.data)) {
        if (data.data.length > 0) {
          data.data.map(user => $scope.users.push(new CUser(user)));
        }
      }
      $scope.chooseUser(0);
    });
  };
  $scope.initial();
  $scope.chooseUser = function(index) {
    if (!$rootScope.functions.initial()) { return; }
    if (index < 0) { index = 0; }
    $scope.page.user = $scope.users[index];
    $scope.page.user.schemas = [];
    $scope.page.user.tables = [];
    $scope.users.map(user => user.actived=false);
    $scope.users[index].actived = true;
    schemaServe.getUserSchemaList($scope.page.user.name).then(data => {
      let getTablelst = [];
      if (angular.isArray(data.data)) {
        if (data.data.length>0) {
          data.data.map(schema => {
            $scope.page.user.schemas.push(schema.name);
            getTablelst.push(tableServe.getTablesBySchema(schema.name));
          });
        }
      }
      $q.all(getTablelst).then(data => {
        data.map(tables => {
          if (angular.isArray(tables.data.tables)) {
            $scope.page.user.tables = $scope.page.user.tables.concat(tables.data.tables);
          }
        });
      });
    });
  };
  $scope.initialDlg = function(username, editflag) {
    $scope.editflag = editflag;
    $scope.dlgmessage = 'MODALMSG_FILL_IN_ALL';
    $scope.validate = false;
    $scope.userLogin = new CLogin(username, $scope.users);
  };
  $scope.dlgUpdateName = function() {
    $scope.userLogin.resetFlag().checkRepeat().checkPassword().checkEmpty().checkName();
    $scope.validate = $scope.userLogin.flag;
    if ($scope.validate) {
      $scope.dlgmessage = '';
    } else {
      $scope.dlgmessage = $scope.userLogin.message;
    }
  };
  $scope.dlgUpdatePassword = function() {
    if ($scope.editflag) {
      $scope.userLogin.resetFlag().checkRepeat().checkEmpty().checkPassword();
    } else {
      $scope.userLogin.resetFlag().checkRepeat().checkName().checkEmpty().checkPassword();
    }
    $scope.validate = $scope.userLogin.flag;
    if ($scope.validate) {
      $scope.dlgmessage = '';
    } else {
      $scope.dlgmessage = $scope.userLogin.message;
    }
  };
  $scope.dlgUpdateRepeat = function() {
    if ($scope.editflag) {
      $scope.userLogin.resetFlag().checkPassword().checkEmpty().checkRepeat();
    } else {
      $scope.userLogin.resetFlag().checkPassword().checkName().checkEmpty().checkRepeat();
    }
    $scope.validate = $scope.userLogin.flag;
    if ($scope.validate) {
      $scope.dlgmessage = '';
    } else {
      $scope.dlgmessage = $scope.userLogin.message;
    }
  };
  $scope.addUser = function() {
    if (!$rootScope.functions.initial()) { return; }
    $scope.initialDlg('', false);
    if (!userDlg.isActive()) {
      userDlg.show();
    }
  };
  $scope.addUserOK = function() {
    UIkit.modal.confirm(new_user_text, function() {
      if (userDlg.isActive()) {
        userDlg.hide();
      }
      userServe.newUser($scope.userLogin.name, $scope.userLogin.password, $scope.userLogin.description).then(() => {
        $scope.initial();
      });
    }, {
      labels: {
        'Ok': yes_text, 
        'Cancel': no_text
      }
    });
  };
  $scope.editUser = function() {
    if (!$rootScope.functions.initial()) { return; }
    $scope.initialDlg($scope.page.user.name, true);
    if (!userDlg.isActive()) {
      userDlg.show();
    }
  };
  $scope.editUserOK = function() {
    UIkit.modal.confirm(update_user_text, function() {
      if (userDlg.isActive()) {
        userDlg.hide();
      }
      userServe.updateUser($scope.userLogin.name, $scope.userLogin.password).then(() => {
        $scope.initial();
      });
    }, {
      labels: {
        'Ok': yes_text,
        'Cancel': no_text
      }
    });
  };
  $scope.dlgOK = function() {
    if ($scope.editflag) {
      $scope.editUserOK();
    } else {
      $scope.addUserOK();
    }
  };

  $scope.deleteUser = function() {
    if (!$rootScope.functions.initial()) { return; }
    schemaServe.getUserSchemaList($scope.page.user.name).then(data => {
      if (data.data.length>0) {
        UIkit.modal.alert(delete_user_err_text, {labels: { 'Ok': ok_text }});
      } else {
        UIkit.modal.confirm(delete_user_text, function() {
          userServe.deleteUser($scope.page.user.name).then(() => {
            $scope.initial();
          });
        }, {
          labels: {
            'Ok': yes_text,
            'Cancel': no_text
          }
        });
      }
    });
  };
}]);
