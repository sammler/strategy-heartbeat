const Stan = require('node-nats-streaming');
const logger = require('winster').instance();

const HeartbeatsModel = require('./../../modules/heartbeats/heartbeats.model').Model; // eslint-disable-line no-unused-vars
const config = require('../../config/server-config');

let stan = null;

class HeartbeatsSubscriber {
  constructor() {
    this.name = 'HeartBeat';
    this.clusterId = 'test-cluster';
    this.clientName = 'strategy-heartbeat';
    this.clientId = `${this.clientName}_HeartbeatsSubscriber_${process.pid}`;
    this.server = config.NATS_STREAMING_SERVER;
    this.enabled = true; // Needed, otherwise the subscriber will not be enabled
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
        stan = stanInstance;

        let subscribeOpts = stan.subscriptionOptions()
          .setStartWithLastReceived();
        subscribeOpts.setManualAckMode(true);
        subscribeOpts.setAckWait(60 * 100); // 60s

        // nats.publish => name ('nats.publish')
        // => queue group
        // let subscription = stan.subscribe('nats.publish', 'HeartbeatRequest.worker', subscribeOpts);
        let subscription = stan.subscribe('strategy-heartbeat_every_minute', subscribeOpts);

        subscription.on('message', async msg => {
          logger.trace('--');
          logger.trace('[on:message] Received a message [' + msg.getSequence() + '] ' + msg.getData());
          logger.trace('[on:message] msg.getSequence()', msg.getSequence());
          logger.trace('[on:message] msg.getData()', msg.getData());
          logger.trace('--');

          // // Todo(AAA): continue here
          let heartbeat = new HeartbeatsModel({
            user_id: msg.getData().user_id,
            tenant_id: msg.getData().tenant_id,
            event: 'every_minute', // Todo(AAA): Needs to be changed
            publishedAt: Date.now(), // Todo(AAA): Get this done ...
            startedAt: Date.now(), // Todo(AAA): Get this done ...
            finishedAt: Date.now()  // Todo(AAA): Get this done ...
          });
          await heartbeat.save();

          msg.ack();
        });

        resolve(stanInstance);
      });

      stanInstance.on('close', function () {
        logger.trace('Connection to stan is closed.');
      });

      stanInstance.on('error', function (err) {
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

module.exports = HeartbeatsSubscriber;
