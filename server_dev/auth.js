'use strict';

const jwt = require('jwt-simple');
const secret_code = 'hahahaha';
const Sequelize = require('sequelize');
const sequelize = require('./sequelize');
const user = require('./model/USER')(sequelize, Sequelize);
const config = require('./config');
const trans = config[config.trans];

module.exports = (req, res, next) => {
  let url = req.originalUrl;
  if (!req.cookies) {
    res.status(500).send(trans.tokenError);
  } else {
    if (!url.includes('login')) {
      /*
      console.log('***************');
      console.log(url);
      console.log(req.cookies);
      console.log('***************');
      */
      let username = req.cookies.username;
      let token = req.cookies.token;
      if (!token || !username) {
        res.status(500).send(trans.tokenError);
      } else {
        user.findOne({
          where: {name: username},
        }).then(fuser => {
          let info = jwt.decode(token, secret_code);
          if (fuser.dataValues.name === info.name && fuser.dataValues.password === info.password) {
            next();
          } else {
            res.status(500).send(trans.tokenError);
          }
        });
      }
    } else {
      next();
    }
  }
};