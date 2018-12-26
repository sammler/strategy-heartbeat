const initializer = require('express-initializers');
const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const MongooseConnectionConfig = require('mongoose-connection-config');
const logger = require('winster').instance();

// Todo(AAA): This needs to be re-enabled
// const subscriberConfig = require('./config/subscriber');
const defaultConfig = require('./config/server-config.js');

// Todo(AAA): This needs to be re-enabled
// const HeartBeatSubscriber = require('./modules/heartbeats/heartbeats.subscriber.old');

const natsClient = require('./nats-client').instance();

// Todo(AAA): Hey ... initSubscribers re-opens a client again and again ... so stupid, fix this
class AppServer {

  constructor(config) {
    this.config = _.extend(_.clone(config), defaultConfig || {});

    this.app = null;
    this.server = null;

    this._initApp();
  }

  async start() {
    const MongoUri = new MongooseConnectionConfig(require('./config/mongoose-config')).getMongoUri();

    await initializer(this.app, {directory: path.join(__dirname, 'config/initializers')});

    try {
      await mongoose.connect(MongoUri, {useNewUrlParser: true});
      logger.info(`Successfully connected to mongo`);
    } catch (err) {
      logger.error(`Could not connect to mongo`, err);
      throw err;
    }

    try {
      await natsClient.connect();
      await natsClient.initSubscribers();
    } catch (err) {
      logger.error(`[stan] Cannot connect to stan: ${err}`);
      throw err;
    }

    try {
      this.server = await this.app.listen(this.config.PORT);
      logger.info(`[app-server] Express server listening on port ${this.config.PORT} in "${this.config.NODE_ENV}" mode`);
    } catch (err) {
      logger.error('[app-server] Cannot start express server', err);
      throw err;
    }
  }

  async stop() {

    try {
      await natsClient.disconnect();
    } catch (err) {
      logger.error(`[stan] Cannot disconnect from stan ... ${err}`);
      throw err;
    }

    if (mongoose.connection) {
      try {
        await mongoose.connection.close(); // Using Moongoose >5.0.4 connection.close is preferred over mongoose.disconnect();
        mongoose.models = {};
        mongoose.ModelSchemas = {};
        logger.info('[app-server] Closed mongoose connection');
      } catch (err) {
        logger.error('[app-server] Could not close mongoose connection', err);
        throw err;
      }
    } else {
      logger.trace('[app-server] No mongoose connection to close');
    }

    if (this.server) {
      try {
        await this.server.close();
        logger.info('[app-server] Server closed');
      } catch (err) {
        logger.error('[app-server] Could not close server', err);
        throw err;
      }
    } else {
      logger.trace('[app-server]  No server to close');
    }

  }

  // ---
  // Internal helpers ...
  // --

  _initApp() {
    this.app = express();
  }

  async _initSubscribers() {
    return true;
    // subscriberConfig.init(this.app);
    // let opts = {
    //   uri: this.config.NATS_URI
    // };
    // let heartbeatSubscriber = new HeartBeatSubscriber(opts);
    //
    // try {
    //   await heartbeatSubscriber.init();
    // } catch (err) {
    //   debug(`Error initializing heartbeatSubscriber: ${err}`);
    // }
  }

}

module.exports = AppServer;
