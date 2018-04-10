//app.js
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const path = require('path');
const favicon = require('serve-favicon');
const proxy = require('http-proxy-middleware');
//const cookieParser = require('cookie-parser');
const auth = require('./auth');

let app = express();
let env = config.env || 'dev';

if(env === 'dev') {
  app.use(require('connect-livereload')());
  app.use('/fonts',express.static('app/bower_components/bootstrap/fonts'));
}

app.use(express.static(config[env].dist));
app.use(favicon(path.join(__dirname, '../', config[env].dist, '/favicon.ico')));
app.use('/ocsearch-service', proxy({target: 'http://10.1.236.142:58080', changeOrigin: true, 'secure': false }));
//app.use(cookieParser());

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(auth);
// REST API for user
app.use('/api/user', require('./api/user'));
// REST API for schema
app.use('/api/schema', require('./api/schema'));
// REST API for table
// app.use('/api/table', require('./api/table'));

// Page not found
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../',config[env].dist,'/404.html'));// load the single view file (angular will handle the page changes on the front-end)
});

app.listen(config[env].port, function () {
  console.log('App listening on port ' + config[env].port + '!');
});

module.exports = app;
