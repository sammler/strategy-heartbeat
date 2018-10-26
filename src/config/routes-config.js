const express = require('express');
const logger = require('winster').instance();
const path = require('path');
const glob = require('glob');

const router = express.Router(); // eslint-disable-line new-cap

// Load routes based on the pattern './../modules/**/*.routes.js
let routes = glob.sync(path.join(__dirname, './../modules/**/*.routes.js'));
logger.trace('------ Routes');
routes.forEach(r => {
  logger.trace('Registering route', r);
  router.use('/', require(r));
});
logger.trace('------- /Routes');

module.exports = router;
