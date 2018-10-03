const _ = require('lodash');
const bodyParser = require('body-parser');
const defaultConfig = require('./services/config.js');
const express = require('express');
const routesConfig = require('./config/routes');
const subscriberConfig = require('./config/subscriber');
const winster = require('winster');

class AppServer {

  constructor(config) {
    this.app = null;
    this.server = null;
    this.config = _.extend(config, defaultConfig);
    this.logger = winster.instance();

    this._init();
  }

  _init() {
    this.app = express();
    this.app.use(bodyParser.json());
    routesConfig.init(this.app);
    subscriberConfig.init(this.app);
  }

  async start() {
    this.logger.verbose('Starting server');
    this.server = await this.app.listen(this.config.server.PORT);
    this.logger.verbose(`App server started at port ${this.config.server.PORT}.`);
  }

  async stop() {
    if (this.server) {
      await this.server.close();
      this.logger.verbose('App server stopped.');
    }
  }

}

module.exports = AppServer;
