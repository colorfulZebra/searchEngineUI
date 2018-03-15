'use strict';

angular.module('basic').factory('CStatus', function() {

  class CStatus {

    constructor(status) {
      this.status = status;
      this.data = [];
      for (let item in status) {
        this.data.push({name:item,info:this.status[item]});
      }
      this.timer().map(service => service.actived=false);
    }

    timer() {
      let timerobj;
      this.data.map(item => {
        if (item.name === 'timers') {
          timerobj = item.info;
        }
      });
      return timerobj;
    }

    getActived() {
      let cname = '';
      this.timer().map(c => {
        if (c.actived) {
          cname = c.class;
        }
      });
      return cname;
    }

    exceptColumn(column) {
      let exceptlst = ['hashKey', 'actived'];
      let flag = true;
      exceptlst.map(ex => {
        if (column.includes(ex)) {
          flag = false;
        }
      });
      return flag;
    }

    getColumn(index) {
      let columns = [];
      if (index < 0 || index >= this.data[index].length) {
        return columns;
      } else {
        this.data[index].info.map(record => {
          for (let col in record) {
            if (!columns.includes(col) && this.exceptColumn(col)) {
              columns.push(col);
            }
          }
        });
        if (this.data[index].name === 'timers') { // For timers 'name' is not needed
          columns.splice(columns.indexOf('name'), 1);
        }
        if (this.data[index].name === 'gauges') { // For gauges 'class' is not needed
          columns.splice(columns.indexOf('class'), 1);
        }
        return columns;
      }
    }

  }

  return CStatus;
});