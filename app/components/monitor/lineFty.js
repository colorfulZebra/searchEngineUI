'use strict';

angular.module('basic').factory('CLine', function() {
  
  class CLine {

    /**
     * 
     * classname: line monitor refer class
     * limitlne: line limit
     * showitems: how many lines to show
     * data: format [[]...] length same to show items
     */
    constructor({classname='', data, limitlen=11, showitems=['Mean', 'Max', 'Min']}) {
      this.classname = classname;
      this.showitems = showitems;
      if (angular.isArray(data) && data.length === this.showitems.length) {
        this.data = data;
      } else {
        this.data = [];
        for (let i = 0; i < this.showitems.length; i++) {
          this.data.push([]);
        }
      }
      this.limitlen = limitlen;
    }

    fresh(newdata) { //  newdata should be [max, min, mean]
      if (angular.isArray(newdata) && newdata.length === this.showitems.length) {
        for (let i = 0; i < this.showitems.length; i++) {
          if (this.data[i].length < this.limitlen) {
            this.data[i].push(newdata[i]);
          } else {
            this.data[i].shift();
            this.data[i].push(newdata[i]);
          }
        }
      }
    }

  }

  return CLine;
});