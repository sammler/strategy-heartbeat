const initializer = require('express-initializers');
const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');
const defaultConfig = require('./config/config.js');
const express = require('express');
const subscriberConfig = require('./config/subscriber');
const logger = require('winster').instance();
const MongooseConnectionConfig = require('mongoose-connection-config');

const HeartBeatSubscriber = require('./modules/heartbeat/heartbeat.subscriber');
const mongoUri = new MongooseConnectionConfig(require('./config/mongoose-config')).getMongoUri();


class AppServer {

  constructor(config) {
    this.app = null;
    this.server = null;
    this.config = _.extend(config, defaultConfig);
    this.logger = logger;

    this._initApp();
  }

  _initApp() {
    this.app = express();
    subscriberConfig.init(this.app);
  }

  async _initSubscribers() {
    let opts = {
      uri: this.config.NATS_URI
    };
    logger.trace('opts', opts);
    let heartbeatSubscriber = new HeartBeatSubscriber(opts);

    try {
      await heartbeatSubscriber.init();
    } catch (err) {
      logger.error(`Error initializing heartbeatSubscriber: ${err}`);
    }
  }

  async start() {

    await initializer(this.app, {directory: path.join(__dirname, 'config/initializers')});
    await mongoose.connect(mongoUri, {useNewUrlParser: true});
    // await this._initSubscribers();

    try {
      this.server = await this.app.listen(this.config.PORT);
      this.logger.info(`Express server listening on port ${this.config.PORT} in "${this.config.NODE_ENV}" mode`);
    } catch (err) {
      this.logger.error('Cannot start express server', err);
    }
  }

  async stop() {

    try {
      await mongoose.connection.close();
      mongoose.models = {};
      mongoose.ModelSchemas = {};
      this.logger.verbose('Closed mongoose connection');
    } catch (e) {
      this.logger.verbose('Could not close mongoose connection', e);
    }

    try {
      await this.server.close();
      this.logger.info('Server stopped');
    } catch (e) {
      this.logger.error('Could not close server', e);
    }

  }

}

module.exports = AppServer;
