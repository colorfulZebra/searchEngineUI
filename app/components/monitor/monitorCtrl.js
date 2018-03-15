'use strict';

angular.module('basic').controller('MonitorCtrl', ['$scope', '$rootScope', '$interval', 'moment', 'monitorServe', 'CStatus', 'CLine', 'usSpinnerService', function($scope, $rootScope, $interval, moment, monitorServe, CStatus, CLine, usSpinnerService) {

  $scope.status = {};
  $scope.initial = function() {
    if (!$rootScope.functions.initial()) { return; }
    if (!$rootScope.functions.isAdmin()) { $rootScope.functions._logout(); }
    $rootScope.global.tab = 'monitor';
    usSpinnerService.spin('manualspinner');
    monitorServe.monitor().then(data => {
      $scope.status = new CStatus(data.data);
      $scope.startRefresh();
      $scope.chartConfig();
      $scope.checkService(0);
      $scope.current_moment = moment().format('YY/MM/DD HH:mm:ss');
      usSpinnerService.stop('manualspinner');
    });
  };
  $scope.initial();
  let refresh;

  $scope.chartConfig = function() {
    $scope.labels = ['Now', '', '', '', '', '', '', '', '', '', ''];
    $scope.series = ['Mean', 'Max', 'Min'];
    $scope.lines = [];
    $scope.status.timer().map(service => {
      let tmpdata = [];
      for (let i = 0; i < $scope.series.length; i++) {
        tmpdata.push([service[$scope.series[i]]]);
      }
      $scope.lines.push(new CLine({classname:service.class,data:tmpdata,limitlen:$scope.labels.length,showitems:$scope.series}));
    });
    $scope.options = {
      animation: false
    };
  };
  $scope.updateChart = function() {
    // update label
    let current_idx = $scope.labels.indexOf('Now');
    $scope.current_moment = moment().format('YY/MM/DD HH:mm:ss');
    if (current_idx === $scope.labels.length-1) {
      for (let i = 0; i < current_idx-1; i++) {
        $scope.labels[i] = $scope.labels[i+1];
      }
      $scope.labels[current_idx-1] = $scope.current_moment;
    } else {
      $scope.labels[current_idx+1] = 'Now';
      $scope.labels[current_idx] = $scope.current_moment;
    }
    if (current_idx < $scope.labels.length-1 && current_idx >= 0)  {
      $scope.labels[current_idx+1] = 'Now';
      $scope.labels[current_idx] = $scope.current_moment;
      $scope.current_moment = moment().format('YY/MM/DD HH:mm:ss');
    }
    // update line
    $scope.status.timer().map(service => {
      $scope.lines.map(line => {
        if (line.classname === service.class) {
          let tmpdata = [];
          for (let i = 0; i < $scope.series.length; i++) {
            tmpdata.push(service[$scope.series[i]]);
          }
          line.fresh(tmpdata);
        }
      });
    });
  };

  $scope.startRefresh = function() {
    if (angular.isDefined(refresh)) { return; }
    refresh = $interval(function() {
      monitorServe.monitor().then(data => {
        let activeclass = $scope.status.getActived();
        $scope.status = new CStatus(data.data);
        $scope.status.timer().map(service => {
          if (service.class === activeclass) {
            service.actived = true;
          }
        });
        $scope.updateChart();
      });
    }, 60000);
  };

  $scope.$on('$destroy', function() {
    if (angular.isDefined(refresh)) {
      $interval.cancel(refresh);
      refresh = undefined;
    }
  });

  $scope.checkService = function(index) {
    let timers = $scope.status.timer();
    timers[index].actived = true;
    for (let i = 0; i < timers.length; i++) {
      if (i !== index) {
        $scope.status.timer()[i].actived = false;
      }
    }
    $scope.data = $scope.lines[index].data;
  };

  $scope.sortTimers = function() {
    $scope.status.timer().sort(function(a, b) {
      return b.Count - a.Count;
    });
  };

}])
  .filter('contentfilter', ['$filter', '$translate', function($filter, $translate) {
    return function(item) {
      if (angular.isDefined(item)) {
        if (angular.isNumber(item)) {
          return Number.isInteger(item)? item : $filter('number')(item, 2);
        } else if (item === '') {
          return '/';
        } else if (item === true || item === false) {
          return item ? $translate.instant('NORMAL') : $translate.instant('ERROR');
        } else {
          return item;
        }
      } else {
        return '/';
      }
    };
  }])
  .filter('capitalsplit', function() {
    return function(word) {
      if (angular.isString(word)) {
        let newwordlst = [];
        word.split('').map(letter => {
          if (/[A-Z]/.test(letter)) {
            newwordlst.push(' ');
          }
          newwordlst.push(letter);
        });
        if (newwordlst[0] === ' ') {
          newwordlst.shift();
        }
        return newwordlst.join('');
      } else {
        return word;
      }
    };
  });