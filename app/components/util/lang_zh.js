'use strict';

angular.module('basic').config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('zh', {
    WELCOME: '欢迎',
    MONITOR: '监控',
    REFRESH: '刷新',
    USER: '用户',
    SESSION_TIMEOUT: '会话过期，请重新登录',
    INVALIDATE_ACCOUNT: '账户或密码错误',
    PLEASE_LOGIN: '请登录',
    LOGOUT: '登出',
    LOGIN: '登录',
    SETTING: '设置',
    CHANGE_PASSWORD: '修改密码',
    USERNAME: '用户名',
    PASSWORD: '密码',
    REPASSWORD: '重复密码',
    DESCRIPTION: '描述',
    ADD_NEW_TABLE: '增加新表',
    ADD_NEW_SCHEMA: '新建表结构',
    ADD_NEW_USER: '新增用户',
    UPDATE_USER: '更改用户信息',
    EDIT_SCHEMA: '编辑表结构',
    NAME: '名称',
    TYPE: '类型',
    CONTENT: '内容',
    INDEX_TYPE: '类型',
    ROWKEY_EXPRESSION: 'Rowkey表达式',
    TABLE_EXPRESSION: 'Table表达式',
    CONSTANT: '常量',
    VARIABLE: '变量',
    FUNCTION: '函数',
    CUSTOMIZE: '自定义',
    SCHEMA: '表结构',
    THE: '第',
    TOTAL: '共',
    STEP: '步',
    STEPS: '步',
    SCHEMA_NAME: '表结构名称',
    SCHEMA_TYPE: '表结构类型',
    HBASE_ONLY: '数据存储 & 简单查询',
    HBASE_ONLY_EXPLAIN: '提供数据列式存储及Rowkey级别的查询',
    HBASE_INDEXER_SOLR: '数据存储 & 内容索引',
    HBASE_INDEXER_SOLR_EXPLAIN: '提供数据列式存储及全字段内容索引，可通过内容索引实现全字段随机检索',
    HBASE_PHOENIX: '数据存储 & 扩展查询',
    HBASE_PHOENIX_EXPLAIN: '提供数据列式存储及Rowkey级别的SQL扩展查询',
    HBASE_SOLR_PHOENIX: 'SQL扩展查询 & 内容索引',
    HBASE_SOLR_PHOENIX_EXPLAIN: '提供数据列式存储、Rowkey级别的SQL扩展查询以及全字段内容索引',
    OPTIONAL_FIELDS: '可选字段',
    COMPONENT: '组件',
    WEIGHT: '权重',
    FIELDS: '字段',
    ADDED_FIELDS: '已定义字段',
    EXPRESSION: '表达式',
    TABLE: '表',
    TABLENAME: '表名称',
    INDEXER: 'Indexer',
    HOST: '主机',
    SEARCH: '搜索',
    REGION_NUM: 'Region Num',
    REGION_NUM_EXPLAIN: 'hbase表进行预分区设定参数，此参数一旦设定无法修改! 建议参考之前月份或者静态历史表的region个数取平均值，例如：语音详单表可以统计前三个月表的region数量取平均值',
    REGION_SPLIT: 'Region Split',
    SOLR: 'Solr',
    SOLR_SHARDS: 'Solr Shards',
    SOLR_SHARDS_EXPLAIN: '设定solr中表数据的分片个数，此参数一旦设定无法修改! 建议参考相对应的历史表的数量取平均值',
    SOLR_REPLICAS: 'Solr Replicas',
    SOLR_REPLICAS_EXPLAIN: 'solr每个shard的副本数，建议值为2，这个值越大，查询性能会越好，建立索引性能会越差',
    OK: '确定',
    CANCEL: '取消',
    NEXT: '下一步',
    NORMAL: '正常',
    ERROR: '错误',
    PREV: '上一步',
    PREV_WARN: '返回上一步将丢失本页所有数据',
    EDIT_TABLE_FIELDS: '编辑表结构',
    FIELD_NAME: '字段名',
    STORE_TYPE: '存储类型',
    CONTENT_FIELD: '内容索引字段',
    INNER_FIELD: '压缩字段',
    FIELD_INDEX: '字段索引',
    INDEXED: '索引',
    QUERY_FIELD: '查询字段',
    ID_FORMATTER: 'ID Formatter',
    INTABLE_NAME: '字段名',
    INTABLE_TYPE: '字段类型',
    INTABLE_SEPARATOR: '分隔符',
    INTABLE_STORE_TYPE: '字段类型',
    INTABLE_INDEXED: '索引',
    INTABLE_INDEX_TYPE: '字段索引类型',
    INTABLE_INNER_FIELD: '压缩字段',
    INTABLE_CONTENT_FIELD: '内容索引字段',
    INTABLE_QUERY_WEIGHT: '查询权重',
    INTABLE_OPERATION: '操作',
    INTABLE_WEIGHT: '权重',
    INTABLE_DISPLAY: '搜索结果显示',
    DISPLAY: '显示',
    SELECT_TYPE: '选择类型',
    SELECT_SCHEMA: '选择表结构',
    SELECT_INDEX_TYPE: '选择类型',
    SELECT_FIELD: '选择字段',
    SELECT_FUNCTION: '选择函数',
    FILL_FUNCTION_ARGS : '请填写函数变量',
    SELECT_FIELD_STORE_TYPE: '选择字段存储类型',
    SELECT_FIELD_INDEX_TYPE: '选择索引类型',
    SELECT_FIELD_CONTENT_FIELD: '选择已经存在的内容索引字段',
    SELECT_FIELD_INNER_FIELD: '选择已经存在的压缩字段',
    SELECT_QUERY_FIELD: '选择已经存在的字段建立查询字段',
    BASIC_INFO: '基础信息',
    ADD: '新建',
    EDIT: '编辑',
    DELETE: '删除',
    NOT_EDITABLE: '有依赖',
    UNAVAILABLE: '不可用',
    YES: '是',
    NO: '否',
    CONFIRMATION: '确定',
    WARNING: '警告',
    MODALMSG_FILL_IN_ALL: '请填写所有标记为*的内容',
    MODALMSG_NO_FIELDS: '未定义任何字段！',
    MODALMSG_QUERY_FIELD_TIP: '提示：内容索引字段或者类型为"text*"的字段可以被设置成查询字段，不允许重复字段',
    MODALMSG_NAME_INVALIDATE: '用户名应以字母或下划线开头，长度不低于4',
    MODALMSG_NAME_IN_USE: '用户名已被使用',
    MODALMSG_PASSWORD_NOT_EQUAL: '两次密码不一致',
    MODALMSG_WEAK_PASSWORD: '密码不符合规则，要求仅包含数字和字母，且长度大于等于8',
    MODALMSG_CHOOSE_SCHEMA_INDEX_TYPE: '请选择一个表结构类型',
    MODALMSG_INNER_NO_USE: '存在已定义压缩字段未与已定义字段关联！请使用全部已定义的压缩字段',
    MODALMSG_SCHEMA_IN_USE: '表结构名已被使用',
    MODALMSG_TABLE_IN_USE: '表名已被使用',
    MODALMSG_SCHEMA_INVALIDATE: '表结构名由下划线、字母开头，包含下划线、字母、数字，长度不低于4',
    MODALMSG_TABLE_INVALIDATE: '表名由下划线、字母开头，包含下划线、字母、数字，长度不低于4',
    MODALMSG_OPTION_FIELD_TIP: '字段名由字母或下划线开头，长度不低于2，不能有重名字段',
    CONFIRM_LOGOUT: '确定登出？',
    CONFIRM_ADD_TABLE: '新建表？',
    CONFIRM_ADD_USER: '新建用户？',
    CONFIRM_UPDATE_USER: '更改用户密码？',
    CONFIRM_EDIT_TABLE: '改变表结构？',
    CONFIRM_DELETE_TABLE: '删除选中表？表中所有数据将会丢失！',
    CONFIRM_ADD_SCHEMA: '确定新建表结构？',
    CONFIRM_EDIT_SCHEMA: '确定修改表结构？',
    CONFIRM_DELETE_SCHEMA: '确定删除选中的表结构？',
    CONFIRM_DELETE_USER: '确定删除选中用户？',
    CONFIRM_DELETE_SCHEMA_ERR: '无法删除表结构，请先删除所有相关的表！',
    CONFIRM_EDIT_SCHEMA_ERR: '无法编辑表结构，请在"表"面板里编辑表结构字段',
    CONFIRM_DELETE_USER_ERR: '无法删除用户，请先删除用户名下所有表及表结构',
    CONFIRM_TITLE_CREATE_TABLE_ERROR: '创建表失败',
    CONFIRM_TITLE_EDIT_TABLE_ERROR: '编辑表错误',
    CONFIRM_TITLE_CREATE_SCHEMA_ERROR: '创建表结构失败',
    EMPTY: '(空)',
    UNDEFINED: '(未定义)',
    NULL: '(null)',
    HELP_EXPRESSION_TITLE: '如何建立一个表达式',
    HELP_EXPRESSION_CONTENT: '想要了解',
    HELP_EXPRESSION_LINK: '更多',
    ROWS: '每页行数',
    CONDITIONS: '搜索条件',
    ADVANCE_SEARCH: '高级搜索',
    WITH_HBASE: 'Hbase表已存在',
    WITH_HBASE_YES: '在定义字段时需要Hbase Column和Hbase Family信息',
    HBASE: 'Hbase',
    HBASE_FAMILY: 'family',
    HBASE_COLUMN: 'column',
    PHOENIX: 'Phoenix',
    EXPLANATION: '说明',
  });
}]);