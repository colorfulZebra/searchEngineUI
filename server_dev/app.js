//app.js
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const path = require('path');
const favicon = require('serve-favicon');
const proxy = require('http-proxy-middleware');
const fs = require('fs');
const cookieParser = require('cookie-parser');
//const auth = require('./auth');

let app = express();
let env = config.env || 'dev';


if(env === 'dev') {
  app.use(require('connect-livereload')());
  app.use('/fonts',express.static('app/bower_components/bootstrap/fonts'));
}

app.use(express.static(config[env].dist));
app.use(favicon(path.join(__dirname, '../', config[env].dist, '/favicon.ico')));
app.use('/ocsearch-service', proxy({target: 'http://10.1.236.67:58080', changeOrigin: true, 'secure': false, logLevel: 'debug'}));
app.use(cookieParser());

//app.use(auth);

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// REST API for user
app.use('/api/user', require('./api/user'));
// REST API for schema
app.use('/api/schema', require('./api/schema'));
// REST API for table
// app.use('/api/table', require('./api/table'));

// REST API for schema config file
app.get('/schema/config', function(req, res) {
  res.setHeader('Content-type', 'application/json');
  fs.readFile('./schema.config.json', function(err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        res.send({});
      } else {
        console.log(err);
      }
    } else {
      res.send(data);
    }
  });
});
app.post('/schema/config/set', function(req, res) {
  res.setHeader('Content-type', 'application/json');
  fs.writeFile('./schema.config.json', JSON.stringify(req.body), function(err) {
    if (err) {
      res.send(JSON.stringify({'result':'error'}));
      throw err;
    }
    res.send(JSON.stringify({'result':'success'}));
  });
});

// Page not found
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../',config[env].dist,'/404.html'));// load the single view file (angular will handle the page changes on the front-end)
});

app.listen(config[env].port, function () {
  console.log('App listening on port ' + config[env].port + '!');
});

module.exports = app;
