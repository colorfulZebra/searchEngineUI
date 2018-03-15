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
    dbhost: 'localhost',
    dbuser: 'root',
    dbpassword: 'Sybase123',
    dbname: 'ocsearch',
  },
  env: 'prod',
  lib: './server/lib/',
  enableAuth: false,
  shiro_config: 'shiro.ini',
  jar_pack: 'auth-1.0-SNAPSHOT.jar',
  trans: 'zh',
  zh: {
    databaseError: '请检查数据库配置',
    uploadError: '上传失败, 请手动将jar包放到',
    authError: '权限不足',
    tokenError: '验证token失败',
    labelConflictError: 'label与用户owner的标签实现类冲突'
  },
  en: {
    databaseError: 'Please check your database configurations',
    uploadError: 'Upload failed, please upload manually jar to',
    authError: 'Authentication failed',
    tokenError: 'Auth with token failed',
    labelConflictError: 'label conflicts with owner \'s Label class'
  }
};
