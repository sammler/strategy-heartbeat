const initializer = require('express-initializers');
const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const MongooseConnectionConfig = require('mongoose-connection-config');
const debug = require('debug')('strategy-heartbeat');

const subscriberConfig = require('./config/subscriber');
const defaultConfig = require('./config/server-config.js');
const HeartBeatSubscriber = require('./modules/heartbeats/heartbeats.subscriber');
const mongoUri = new MongooseConnectionConfig(require('./config/mongoose-config')).getMongoUri();

// Todo(AAA): Hey ... initSubscribers re-opens a client again and again ... so stupid, fix this
class AppServer {

  constructor(config) {
    this.config = _.extend(config, defaultConfig);

    this.app = null;
    this.server = null;

    this._initApp();
  }


  async start() {

    await initializer(this.app, {directory: path.join(__dirname, 'config/initializers')});
    await mongoose.connect(mongoUri, {useNewUrlParser: true});
    await this._initSubscribers();

    try {
      this.server = await this.app.listen(this.config.PORT);
      debug(`Express server listening on port ${this.config.PORT} in "${this.config.NODE_ENV}" mode`);
    } catch (err) {
      debug('Cannot start express server', err);
    }
  }

  async stop() {

    if (mongoose.connection) {
      try {
        await mongoose.connection.close();
        mongoose.models = {};
        mongoose.ModelSchemas = {};
        debug('Closed mongoose connection');
      } catch (e) {
        debug('Could not close mongoose connection', e);
      }
    }

    if (this.server) {
      try {
        await this.server.close();
        debug('Server stopped');
      } catch (e) {
        debug('Could not close server', e);
      }
    }

  }

  // ---
  // Internal helpers ...
  // --

  _initApp() {
    this.app = express();
  }

  async _initSubscribers() {
    subscriberConfig.init(this.app);
    let opts = {
      uri: this.config.NATS_URI
    };
    let heartbeatSubscriber = new HeartBeatSubscriber(opts);

    try {
      await heartbeatSubscriber.init();
    } catch (err) {
      debug(`Error initializing heartbeatSubscriber: ${err}`);
    }
  }

}

module.exports = AppServer;
