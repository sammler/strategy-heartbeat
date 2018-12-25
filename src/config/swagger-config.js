const pkg = require('read-pkg-up').sync().pkg;
const glob = require('glob');
const path = require('path');
const debug = require('debug')('strategy-heartbeat:swagger-config');

const swaggerConfig = {
  swaggerDefinition: {
    info: {
      title: pkg.name,
      version: pkg.version,
      description: pkg.description
    },
    basePath: '/',
    produces: [
      'application/json'
    ],
    schemes: [
      'http',
      'https'
    ]
  },
  apis: []
};

// Load apis based on the pattern './../modules/**/*.routes.js
let routes = glob.sync(path.join(__dirname, './../modules/**/*.routes.js'));
debug('------ Swagger APIs');
routes.forEach(r => {
  debug('Registering route', r);
  swaggerConfig.apis.push(r);
});
debug('------- /Swagger APIs');

module.exports = swaggerConfig;
