'use strict';

const express = require('express');
const router = express.Router();
const config = require('../config');
const Sequelize = require('sequelize');
const sequelize = require('../sequelize');
const schema = require('../model/SCHEMA')(sequelize, Sequelize);
const user = require('../model/USER')(sequelize, Sequelize);

const trans = config[config.trans];
/**
 * Get all schema list
 * No parameters
 */
router.get('/list', function(req, res) {
  schema.findAll().then(schemas => {
    res.send(schemas);
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});
/**
 * Get schema list by username
 * parameters:
 *   username -> in url
 */
router.get('/get/:username', function(req, res) {
  user.findOne({
    where: {name: req.params.username},
  }).then(user => {
    if (user) { // query result is not null
      let userid = user.dataValues.id;
      schema.findAll({
        where: {ownerid: userid},
      }).then(schemas => {
        res.send(schemas);
      }).catch(err => {
        console.log(err);
        res.status(500).send(trans.databaseError);
      });
    } else {
      res.send(JSON.stringify([]));
    }
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});
/**
 * Add schema
 * parameters:
 *   name, showfields, owner -> in request body
 */
router.post('/add', function(req, res) {
  user.findOne({
    where: {name: req.body.owner},
  }).then(user => {
    if (user) {
      let userid = user.dataValues.id;
      schema.create({name:req.body.name, showfields:req.body.showfields, ownerid:userid}).then(schema => {
        res.send(schema);
      }).catch(err => {
        console.log(err);
        res.status(500).send(trans.databaseError);
      });
    } else {
      res.send(JSON.stringify({name:'',showfields:'',ownerid:-1}));
    }
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});
/**
 * Change showfields of schema
 * parameters:
 *   schema -> in url
 *   showfields -> in request body
 */
router.put('/update/:schema', function(req, res) {
  schema.update(
    {showfields: req.body.showfields},
    {where: {name: req.params.schema}}
  ).then(() => {
    res.send({status:true});
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});
/**
 * Delete schema
 * parameters:
 *   schema -> in url
 */
router.delete('/delete/:schema', function(req, res) {
  schema.destroy({
    where: {name: req.params.schema},
  }).then(() => {
    res.send({status:true});
  }).catch(err => {
    console.log(err);
    res.status(500).send(trans.databaseError);
  });
});

module.exports = router;