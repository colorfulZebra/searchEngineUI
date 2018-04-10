'use strict';

const express = require('express');
const sha256 = require('js-sha256');
const config = require('../config');
const Sequelize = require('sequelize');
const router = express.Router();
const sequelize = require('../sequelize');
const user = require('../model/USER')(sequelize, Sequelize);
// parameters from config
const trans = config[config.trans];

/*
 * Test encryption methods
 */
/*
const exec = require('child_process').exec;
const libpath = config.lib;
const jar_pack = config.jar_pack;
let encryptPassword = function(username, password) {
  return `LC_ALL=en java -Dtype=sha-256 -Dusername=${username} -Dpassword=${password} -jar ${libpath}${jar_pack}`;
};
router.get('/encryptlib/:password', function(req, res) {
  let password = req.params.password;
  let username = 'zhi';
  exec(encryptPassword(username, password), (err, password) => {
    password = password.trim();
    if (err === null) {
      res.send(password);
    }
  });
});
router.get('/encryptjs/:password', function(req, res) {
  let password = req.params.password;
  res.send(sha256(password));
});
*/
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
  let password = sha256(req.body.password).trim();
  let description = '';
  if (req.body.description) { description = req.body.description; }
  user.create({name: username, password: password, description: description}).then(user => {
    res.send(user);
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
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
  let password = sha256(req.body.password).trim();
  user.update(
    {password: password},
    {where: {name: username}}
  ).then(() => {
    res.send({status: true});
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
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