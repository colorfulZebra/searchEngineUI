'use strict';

angular.module('basic').factory('CLogin', function() {

  class CLogin {
    constructor(thename='', theusers=[], thepassword='', therepeat='', thedesc='') {
      this.name = thename;
      this.password = thepassword;
      this.repeat = therepeat;
      this.users = [];
      if (angular.isArray(theusers) && theusers.length > 0) {
        theusers.map(user => this.users.push(user.name));
      }
      this.message = '';
      this.flag = true;
      this.description = thedesc;
    }

    resetFlag() {
      this.flag = true;
      return this;
    }

    checkName() {
      if (!/^[a-zA-Z_][0-9a-zA-Z_]{3,}$/.test(this.name)) {
        this.message = 'MODALMSG_NAME_INVALIDATE';
        this.flag = false;
      } else if (this.users.includes(this.name)) {
        this.message = 'MODALMSG_NAME_IN_USE';
        this.flag = false;
      }
      return this;
    }

    checkPassword() {
      if (!/[0-9a-zA-Z]{8,}/.test(this.password)) {
        this.message = 'MODALMSG_WEAK_PASSWORD';
        this.flag = false;
      }
      return this;
    }

    checkRepeat() {
      if (this.password !== this.repeat) {
        this.message = 'MODALMSG_PASSWORD_NOT_EQUAL';
        this.flag = false;
      }
      return this;
    }

    checkEmpty() {
      if (this.name === '' || this.password === '' || this.repeat === '') {
        this.message = 'MODALMSG_FILL_IN_ALL';
        this.flag = false;
      }
      return this;
    }

  }

  return CLogin;
});