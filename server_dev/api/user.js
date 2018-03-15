'use strict';

const express = require('express');
const jwt = require('jwt-simple');
const secret_code = 'hahahaha';
const config = require('../config');
const Sequelize = require('sequelize');
const router = express.Router();
const sequelize = require('../sequelize');
const exec = require('child_process').exec;
const user = require('../model/USER')(sequelize, Sequelize);
// parameters from config
const libpath = config.lib;
const shiro_config = config.shiro_config;
const jar_pack = config.jar_pack;
const trans = config[config.trans];
const enableAuth = config.enableAuth;

// generate command string to generate token
let tokenCommand = function(username, password) {
  return `java -Dconfig=${libpath}${shiro_config} -Dtype=encrypt -Dusername=${username} -Dpassword=${password} -jar ${libpath}${jar_pack}`;
};
let encryptPassword = function(username, password) {
  return `LC_ALL=en java -Dtype=sha-256 -Dusername=${username} -Dpassword=${password} -jar ${libpath}${jar_pack}`;
};
/**
 * Generator token
 * parameters:
 *   username, password -> in request body
 */
router.post('/login_old', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  exec(tokenCommand(username, password), (err, token) => {
    if (err === null) {
      token = token.trim();
      if (!enableAuth) { // auth is disabled
        exec(encryptPassword(username, password), (err, password) => {
          password = password.trim();
          if (err === null) {
            user.findOne({
              where: {name: username},
            }).then(user => {
              if (user && user.dataValues.password === password) {
                res.send(JSON.stringify({status: true, token}));
              } else {
                res.send(JSON.stringify({status: false}));
              }
            });
          } else {
            console.log(err);
            res.status(500).send(trans.databaseError);
          }
        });
      } else {
        // Need add auth code
        console.log(err);
        res.status(500).send(trans.tokenError);
      }
    } else {
      console.log(err);
      res.status(500).send(trans.tokenError);
    }
  });
});
router.post('/login', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  exec(encryptPassword(username, password), (err, password) => {
    password = password.trim();
    if (err === null) {
      user.findOne({
        where: {name: username},
      }).then(user => {
        if (user && user.dataValues.password === password) {
          let token = jwt.encode(user.dataValues, secret_code);
          res.send(JSON.stringify({status: true, token}));
        } else {
          res.send(JSON.stringify({status: false}));
        }
      });
    } else {
      console.log(err);
      res.status(500).send(trans.databaseError);
    }
  });
});
/**
 * Get user list
 * No parameters
 */
router.get('/list', function(req, res) {
  user.findAll({
    attributes: ['id', 'name', 'description'],
  }).then(users => {
    res.send(users);
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});
/**
 * Get user info by user name
 * parameters:
 *   username -> in url
 */
router.get('/get/:username', function(req, res) {
  user.findOne({
    where: {name: req.params.username},
    attributes: ['id', 'name', 'description'],
  }).then(user => {
    res.send(user);
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});
/**
 * Create new user
 * parameters:
 *   username, password, description(optional) -> in request body
 */
router.post('/new', function(req, res) {
  let username = req.body.username;
  let description = '';
  if (req.body.description) { description = req.body.description; }
  exec(encryptPassword(req.body.username, req.body.password), (err, password) => {
    if (err === null) {
      password = password.trim();
      user.create({name: username, password: password, description: description}).then(user => {
        res.send(user);
      }).catch(err => {
        console.log(err);
        res.status(500).send(trans.databaseError);
      });
    } else {
      console.log(err);
      res.status(500).send(trans.authError);
    }
  });
});
/**
 * Update current user
 * parameters:
 *   username -> in url
 *   password -> in request body
 */
router.put('/update/:username', function(req, res) {
  let username = req.params.username;
  exec(encryptPassword(username, req.body.password), (err, password) => {
    if (err === null) {
      password = password.trim();
      user.update(
        {password: password},
        {where: {name: username}}
      ).then(() => {
        res.send({status: true});
      }).catch(err => {
        console.log(err);
        res.status(500).send(trans.databaseError);
      });
    } else {
      console.log(err);
      res.status(500).send(trans.authError);
    }
  });
});
/**
 * Delete user by user name
 * parameters:
 *   username -> in url
 */
router.delete('/delete/:username', function(req, res) {
  user.destroy({
    where: {name: req.params.username}
  }).then(() => {
    res.send({status: true});
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});

module.exports = router;