'use strict';

angular.module('basic').factory('spinnerInterceptor', ['$q', 'usSpinnerService', '$injector', 'SPINNER_EXCEPT' ,($q, usSpinnerService, $injector, SPINNER_EXCEPT)=>{
  return {
    'request': (config) => {
      let spinnerflag = true;
      SPINNER_EXCEPT.urls.map(url => {
        if (config.url.includes(url)) {
          spinnerflag = false;
        }
      });
      if (spinnerflag) {
        usSpinnerService.spin('spinner');
      }
      return config;
    },
    'response': (response) => {
      let spinnerflag = true;
      SPINNER_EXCEPT.urls.map(url => {
        if (angular.isDefined(response.config) && angular.isDefined(response.config.url) && response.config.url.includes(url)) {
          spinnerflag = false;
        }
      });
      if (spinnerflag) {
        usSpinnerService.stop('spinner');
      }
      return response;
    },
    'responseError': (reason) => {
      if (reason) {
        usSpinnerService.stop('spinner');
        let Notification = $injector.get('Notification');
        if (reason.data && reason.data !== '') {
          Notification.error(reason.data);
        }
      }
      return $q.reject(reason);
    },
  };
}]);
