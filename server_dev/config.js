'use strict';
module.exports = {
  dev: {
    dist: 'app',
    port: 9000,
    dbhost: 'localhost',
    dbuser: 'root',
    dbpassword: 'Sybase123',
    dbname: 'ocsearch',
  },
  prod: {
    dist: 'dist',
    port: 9000,
    dbhost: '10.1.236.64',
    dbuser: 'root',
    dbpassword: '',
    dbname: 'ocsearch',
  },
  env: 'prod',
  trans: 'zh',
  zh: {
    databaseError: '请检查数据库配置',
    authError: '权限不足',
    tokenError: '验证token失败',
    internalError: '服务器错误',
  },
  en: {
    databaseError: 'Please check your database configurations',
    authError: 'Authentication failed',
    tokenError: 'Auth with token failed',
    internalError: 'Server error',
  }
};
