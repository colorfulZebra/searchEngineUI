'use strict';

const request = require('request');
const config = require('./config');
const trans = config[config.trans];

module.exports = (req, res, next) => {
  if (req.query && req.query.token) {
    let token = req.query.token;
    let authurl = 'http://localhost:9000/ocsearch-service/authenticate';
    request.post({url:authurl, json:{ token }}, function(error, response) {
      if (!error) {
        if (response.body.result && !response.body.result.error_code) {
          next();
        } else {
          res.status(403).send(trans.tokenError);
        }
      } else {
        res.status(400).send(trans.internalError);
      }
    });
  } else if (req.query) {
    res.status(403).send(trans.tokenError);
  } else {
    res.status(400).send(trans.internalError);
  }
};