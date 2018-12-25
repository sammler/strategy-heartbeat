const express = require('express');
const path = require('path');
const glob = require('glob');
const debug = require('debug')('strategy-heartbeat:routes-config');

const router = express.Router(); // eslint-disable-line new-cap

// Load routes based on the pattern './../modules/**/*.routes.js
let routes = glob.sync(path.join(__dirname, './../modules/**/*.routes.js'));
debug('------ Routes');
routes.forEach(r => {
  debug('Registering route', r);
  router.use('/', require(r));
});
debug('------- /Routes');

module.exports = router;
