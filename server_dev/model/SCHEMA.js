'use strict';

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('OCSEARCH_SCHEMA', {
    id: {
      type: DataTypes.INTEGER(16),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    showfields: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    ownerid: {
      type: DataTypes.INTEGER(16),
      allowNull: false,
      references: {
        model: 'OCSEARCH_USER',
        key: 'id',
      } 
    }
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'OCSEARCH_SCHEMA',
  });
};