'use strict';

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('OCSEARCH_USER', {
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'OCSEARCH_USER',
  });
};
