const pkg = require('read-pkg-up').sync().pkg;
const glob = require('glob');
const path = require('path');
const logger = require('winster').instance();

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
    ]
  },
  apis: []
};

// Load apis based on the pattern './../modules/**/*.routes.js
let routes = glob.sync(path.join(__dirname, './../modules/**/*.routes.js'));
logger.trace('------ Swagger APIs');
routes.forEach(r => {
  logger.trace('Registering route', r);
  swaggerConfig.apis.push(r);
});
logger.trace('------- /Swagger APIs');

module.exports = swaggerConfig;
