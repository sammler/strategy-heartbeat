const express = require('express');
const path = require('path');
const glob = require('glob');
const logger = require('winster').instance();
const logr = require('./../lib/logr');

const router = express.Router(); // eslint-disable-line new-cap

// Load routes based on the pattern './../modules/**/*.routes.js
let routes = glob.sync(path.join(__dirname, './../modules/**/*.routes.js'));
logger.trace('------ ++ Routes');
routes.forEach(r => {
  logger.trace('Registering route', r);
  router.use('/', require(r));
});
logger.trace('------ // Routes');

router.use('/logr', (req, res) => {

  logr.trace('Level: trace');
  logr.debug('Level: debug');
  logr.info('Level: info');
  logr.warn('Level: warn');
  logr.error('Level: error');
  logr.fatal('Level: fatal');

  res.status(200);
  res.send();
});

module.exports = router;
