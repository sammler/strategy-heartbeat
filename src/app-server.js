const initializer = require('express-initializers');
const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const MongooseConnectionConfig = require('mongoose-connection-config');
const logger = require('winster').instance();
const Sentry = require('@sentry/node');

const logr = require('./lib/logr');
const defaultConfig = require('./config/server-config.js');
const natsClient = require('./nats-client').instance();

class AppServer {

  constructor(config) {
    this.config = _.extend(_.clone(config), defaultConfig || {});

    this.app = null;
    this.server = null;

    this.app = express();
    this._configSentry();
  }

  _configSentry() {
    // The request handler must be the first middleware on the app
    this.app.use(Sentry.Handlers.requestHandler());

    // Optional fallthrough error handler
    // this.app.use(function (req, res) {
    //   // The error id is attached to `res.sentry` to be returned
    //   // and optionally displayed to the user for support.
    //   res.statusCode = 500;
    //   res.end(res.sentry + '\n');
    // });

  }

  async start() {
    const MongoUri = new MongooseConnectionConfig(require('./config/mongoose-config')).getMongoUri();

    await initializer(this.app, {directory: path.join(__dirname, 'config/initializers')});

    try {
      await mongoose.connect(MongoUri, {useNewUrlParser: true});
      logr.info(`[app-server] Successfully connected to mongo`);
    } catch (err) {
      logr.fatal(`[app-server] Could not connect to mongo`, err);
      throw err;
    }

    try {
      await natsClient.connect();
      await natsClient.initSubscribers();
    } catch (err) {
      logr.fatal(`[app-server]  Cannot connect to stan: ${err}`);
      throw err;
    }

    try {
      this.server = await this.app.listen(this.config.PORT);
      logger.info(`[app-server] Express server listening on port ${this.config.PORT} in "${this.config.NODE_ENV}" mode`);
    } catch (err) {
      logger.fatal('[app-server] Cannot start express server', err);
      throw err;
    }
  }

  async stop() {

    try {
      await natsClient.disconnect();
      logger.info('[app-server] Successfully disconnected from stan.');
    } catch (err) {
      logger.error(`[app-server] Cannot disconnect from stan ... ${err}`);
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
}

module.exports = AppServer;
