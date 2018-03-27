'use strict';

/**
 * @ngdoc overview
 * @name basicApp
 * @description
 * # basicApp
 *
 * Main module of the application.
 */
angular
  .module('basic', [
    'ngCookies',
    'ui.router',
    'pascalprecht.translate',
    'ui-notification',
    'angularSpinner',
    'cfp.hotkeys',
    'angularMoment',
    'chart.js',
  ])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, NotificationProvider, $translateProvider) {
    $urlRouterProvider.otherwise('search');
    $stateProvider
      .state('user', {
        url: '/user',
        templateUrl: 'components/user/user.html',
        controller: 'UserCtrl',
      })
      .state('monitor', {
        url: '/monitor',
        templateUrl: 'components/monitor/monitor.html',
        controller: 'MonitorCtrl'
      })
      .state('search', {
        url:'/search',
        templateUrl: 'components/search/search.html',
        controller: 'SearchCtrl'
      })
      .state('schema', {
        url:'/schema',
        templateUrl: 'components/schema/schema.html',
        controller: 'SchemaCtrl',
        params: {
          'linkschema' : ''
        }
      })
      .state('table', {
        url:'/table',
        templateUrl: 'components/table/table.html',
        controller: 'TableCtrl',
        params: {
          'linktable' : ''
        }
      })
      .state('result', {
        url:'/result',
        params: {'schema': null, 'content': null},
        templateUrl: 'components/result/result.html',
        controller: 'ResultCtrl'
      })
      .state('detail', {
        url:'/detail/:id?table',
        params: {
          'id':null, 
          'table':null, 
        },
        templateUrl: 'components/result/detail.html',
        controller: 'DetailCtrl'
      });
    $httpProvider.interceptors.push('spinnerInterceptor');
    NotificationProvider.setOptions({
      delay: 10000,
      startTop: 20,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
    $translateProvider.preferredLanguage('zh');
  }).constant('GLOBAL', {
    host: './ocsearch-service',
    expiretime: 6666,
  }).constant('SPINNER_EXCEPT', {
    urls: ['/ocsearch-service/manager/ocsearch-status', '/ocsearch-service/manager/indexer-status', '/ocsearch-service/expression/list']
  }).run(['$rootScope', '$state', '$cookies', '$location', 'moment', 'GLOBAL', function ($rootScope, $state, $cookies, $location, moment, GLOBAL) {
    $rootScope.global = {
      tab: ''
    };
    $rootScope.functions = {};
    /**
     * url status with token auth
     */
    $rootScope.functions.click = function(item) {
      $rootScope.global.tab = item;
    };
    $rootScope.functions.initial = function() {
      if (!$rootScope.functions.isLogin()) {
        $rootScope.functions._logout();
        $state.go('search');
        return false;
      } else {
        return true;
      }
    };
    /**
     * Token controller functions
     */
    $rootScope.functions._login = function(name, token) {
      $rootScope.functions.setUsername(name);
      $rootScope.functions.setToken(token);
    };
    $rootScope.functions._logout = function() {
      $cookies.remove('username');
      $cookies.remove('token');
    };
    $rootScope.functions.isAdmin = function() {
      let name = $rootScope.functions.getUsername();
      return name === 'admin';
    };
    $rootScope.functions.isLogin = function() {
      let name = $rootScope.functions.getUsername();
      let token = $rootScope.functions.getToken();
      return (name && token);
    };
    $rootScope.functions.getCookie = function(key) {
      let val = $cookies.get(key);
      if (val) {
        $cookies.put(key, val, {'expires': moment().add(GLOBAL.expiretime, 's').toDate()});
      }
      return val;
    };
    $rootScope.functions.setCookie = function(key, val) {
      if ($cookies.get(key)) {
        $cookies.remove(key);
      }
      $cookies.put(key, val, {'expires': moment().add(GLOBAL.expiretime, 's').toDate()});
    };
    $rootScope.functions.clearCookie = function(key) {
      $cookies.remove(key);
    };
    $rootScope.functions.getUsername = function() {
      return $rootScope.functions.getCookie('username');
    };
    $rootScope.functions.setUsername = function(value) {
      $rootScope.functions.setCookie('username', value);
    };
    $rootScope.functions.getToken = function() {
      return $rootScope.functions.getCookie('token');
    };
    $rootScope.functions.setToken = function(value) {
      $rootScope.functions.setCookie('token', value);
    };
  }]);
