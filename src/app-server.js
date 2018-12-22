const initializer = require('express-initializers');
const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('winster').instance();
const MongooseConnectionConfig = require('mongoose-connection-config');

const subscriberConfig = require('./config/subscriber');
const defaultConfig = require('./config/server-config.js');
const HeartBeatSubscriber = require('./modules/heartbeats/heartbeats.subscriber');
const mongoUri = new MongooseConnectionConfig(require('./config/mongoose-config')).getMongoUri();

class AppServer {

  constructor(config) {
    this.config = _.extend(config, defaultConfig);

    this.app = null;
    this.server = null;
    this.logger = logger;

    this._initApp();
  }

  _initApp() {
    this.app = express();
  }

  async _initSubscribers() {
    subscriberConfig.init(this.app);
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

    logger.trace('mongoUri', mongoUri);
    await initializer(this.app, {directory: path.join(__dirname, 'config/initializers')});
    await mongoose.connect(mongoUri, {useNewUrlParser: true});
    // Await this._initSubscribers();

    try {
      this.server = await this.app.listen(this.config.PORT);
      this.logger.info(`Express server listening on port ${this.config.PORT} in "${this.config.NODE_ENV}" mode`);
    } catch (err) {
      this.logger.error('Cannot start express server', err);
    }
  }

  async stop() {

    if (mongoose.connection) {
      try {
        await mongoose.connection.close();
        mongoose.models = {};
        mongoose.ModelSchemas = {};
        this.logger.verbose('Closed mongoose connection');
      } catch (e) {
        this.logger.verbose('Could not close mongoose connection', e);
      }
    }

    if (this.server) {
      try {
        await this.server.close();
        this.logger.info('Server stopped');
      } catch (e) {
        this.logger.error('Could not close server', e);
      }
    }

  }

}

module.exports = AppServer;
