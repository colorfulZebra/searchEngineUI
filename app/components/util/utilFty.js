'use strict';

angular.module('basic').factory('CUtil', function() {
  class CUtil {
    constructor() {}
  }

  // cut length of string
  CUtil.cutString = function(str, len) {
    if (angular.isString(str)) {
      if (str.length > len) {
        return str.substring(0, len) + '...';
      } else {
        return str;
      }
    } else {
      return str;
    }
  };

  // limit bound of number
  CUtil.limitNumber = function(num, lower_bound, upper_bound=Number.MAX_SAFE_INTEGER) {
    if (angular.isNumber(num)) {
      if (num < upper_bound && num > lower_bound) {
        return num;
      } else {
        return lower_bound;
      }
    } else {
      return lower_bound;
    }
  };

  return CUtil;
});