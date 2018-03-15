'use strict';

angular.module('basic').factory('CHost', function() {

  class CHost {
    constructor({name, status, actived=false}) {
      this.name = name;
      this.status = status;
      this.actived = actived;
    }

    itemlst() {
      let itemlst = [];
      for (let item in this.status) {
        if (!itemlst.includes(item)) {
          itemlst.push(item);
        }
      }
      return itemlst;
    }

    attributelst() {
      let attrlst = [];
      for (let item in this.status) {
        for (let attr in this.status[item]) {
          if (!attrlst.includes(attr)) {
            attrlst.push(attr);
          }
        }
      }
      return attrlst;
    }
  }

  return CHost;
});