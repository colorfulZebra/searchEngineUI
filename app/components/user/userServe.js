'use strict';

angular.module('basic').service('userServe', ['$http', '$q', '$rootScope', 'GLOBAL', function(http, q, $rootScope, GLOBAL) {
  return {
    login: (name, password) => {
      let user = q.defer();
      let login_info = {username:name, password:password};
      http.post(`${GLOBAL.host}/login`, login_info).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    },

    getUserList: () => {
      let users = q.defer();
      let token = $rootScope.functions.getToken();
      http.get(`/api/user/list?token=${token}`).then((data) => {
        users.resolve(data);
      }, (err) => {
        users.reject(err);
      });
      return users.promise;
    },

    newUser: (name, password, description) => {
      let user = q.defer();
      let new_user = {
        username: name,
        password: password,
        description: description,
      };
      let token = $rootScope.functions.getToken();
      http.post(`/api/user/new?token=${token}`, new_user).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    },

    deleteUser: (name) => {
      let user = q.defer();
      let token = $rootScope.functions.getToken();
      http.delete(`/api/user/delete/${name}?token=${token}`).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    },

    updateUser: (name, password) => {
      let user = q.defer();
      let token = $rootScope.functions.getToken();
      http.put(`/api/user/update/${name}?token=${token}`, {password:password}).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    }
  };
}]);