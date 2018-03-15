'use strict';

angular.module('basic').service('userServe', ['$http', '$q', function(http, q) {
  return {
    login: (name, password) => {
      let user = q.defer();
      let login_info = {username:name, password:password};
      http.post('/api/user/login', login_info).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    },

    getUserList: () => {
      let users = q.defer();
      http.get('/api/user/list').then((data) => {
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
      http.post('/api/user/new', new_user).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    },

    deleteUser: (name) => {
      let user = q.defer();
      http.delete(`/api/user/delete/${name}`).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    },

    updateUser: (name, password) => {
      let user = q.defer();
      http.put(`/api/user/update/${name}`, {password:password}).then((data) => {
        user.resolve(data);
      }, (err) => {
        user.reject(err);
      });
      return user.promise;
    }
  };
}]);