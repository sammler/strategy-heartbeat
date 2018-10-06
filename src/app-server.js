const _ = require('lodash');
const bodyParser = require('body-parser');
const defaultConfig = require('./config/config.js');
const express = require('express');
const routesConfig = require('./config/routes');
const subscriberConfig = require('./config/subscriber');
const logger = require('winster').instance();
const HeartBeatSubscriber = require('./modules/heartbeat/heartbeat.subscriber');

class AppServer {

  constructor(config) {
    this.app = null;
    this.server = null;
    this.config = _.extend(config, defaultConfig);
    this.logger = logger;

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
    this.server = await this.app.listen(this.config.PORT);
    this.logger.verbose(`App server started at port ${this.config.PORT}.`);

    let opts = {
      uri: this.config.NATS_URI
    };
    logger.trace('opts', opts);
    let heartbeatSubscriber = new HeartBeatSubscriber(opts);

    try {
      await heartbeatSubscriber.init();
    } catch (err) {
      logger.error(`Error initializing heartbeatSubscriber: ${err}`)
    }
  }

  async stop() {
    if (this.server) {

      try {
        await this.server.close();
        this.logger.verbose('App server stopped.');
      } catch (err) {
        this.logger.error(`Error closing the app server: ${err}`)
      }

    }
  }

}

module.exports = AppServer;
