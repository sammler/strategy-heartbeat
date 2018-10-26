const Stan = require('node-nats-streaming');
const logger = require('winster').instance();
const config = require('./../../config/config');

let stan = null;

class HeartBeatSubscriber {
  constructor() {
    this.name = 'HeartBeat';
    this.clusterId = 'test-cluster';
    this.clientName = 'strategy-heartbeat';
    this.clientId = `${this.clientName}_${process.pid}`;
    this.server = config.NATS_STREAMING_SERVER;
    this.enabled = true; // Needed for the generic loader ...
  }

  init(natsOpts) {

    const opts = Object.assign(natsOpts || {}, {
      json: true,
      reconnect: true,
      reconnectTimeWait: 2000,
      verbose: true,
      waitOnFirstConnect: true
    });

    return new Promise((resolve, reject) => {

      let stanInstance = Stan.connect(this.clusterId, this.clientId, this.server, opts, () => {
        logger.trace('OK, connected');
      });

      stanInstance.on('connect', function () {
        logger.trace('We are connected to stan.');
        stan = stanInstance;

        let subscribeOpts = stan.subscriptionOptions()
          .setStartWithLastReceived();
        subscribeOpts.setManualAckMode(true);
        subscribeOpts.setAckWait(60 * 100); // 60s

        let subscription = stan.subscribe('HeartbeatRequest', 'HeartbeatRequest.worker', subscribeOpts);

        subscription.on('message', msg => {
          logger.trace('Received a message [' + msg.getSequence() + '] ' + msg.getData());
          msg.ack();
        });

        resolve(stanInstance);
      });

      stanInstance.on('close', function () {
        logger.trace('Connection to stan is closed.');
      });

      stanInstance.on('error', function (err) {
        logger.error(`Error connecting to Stan: "${err}"`);
        reject(err);
      });

      stanInstance.on('disconnect', function () {
        logger.trace('Disconnect to stan ...');
      });

      stanInstance.on('reconnect', function () {
        logger.trace('Reconnect to stan ...');
      });

      stanInstance.on('reconnecting', function () {
        logger.trace('Reconnecting to stan ...');
      });

    });

  }

}

module.exports = HeartBeatSubscriber;
