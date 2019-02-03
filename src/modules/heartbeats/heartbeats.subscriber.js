const logger = require('winster').instance();
const utils = require('./../../lib/utils');

const natsClient = require('./../../nats-client');
const HeartbeatsModel = require('./heartbeats.model').Model;

class HeartbeatsSubscriber {
  constructor() {
    this.enabled = true; // Needed, otherwise the subscriber will not be enabled
    this.name = 'Heartbeats';
  }

  init() {

    const CHANNEL = 'strategy-heartbeat';
    const QUEUE = 'strategy-heartbeat-worker';

    let opts = natsClient.instance().stan
      .subscriptionOptions()
      .setStartWithLastReceived()
      .setManualAckMode(true)
      .setAckWait(60 * 100); // 60s

    let subscription = natsClient.instance().subscribeWithQueue(CHANNEL, QUEUE, opts);

    subscription.on('message', async msg => {

      logger.trace('HeartbeatSubscriber:on:message', msg.getData());
      let msgRaw = JSON.parse(JSON.parse(msg.getData())); // Does anybody understand why this is necessary?
      logger.trace('msgRaw', msgRaw);
      logger.trace('--');
      logger.trace(msgRaw);
      logger.trace('--');
      logger.trace('user_id', msgRaw.user_id);
      logger.trace('--');
      let o = {
        user_id: msgRaw.user_id,
        event: msgRaw.event,
        publishedAt: msgRaw.publishedAt || Date.now(),
        startedAt: Date.now(),
        finishedAt: Date.now()
      };

      // Wait for 1 secs (to do whatever long operation)
      await utils.sleep(3000);
      o.finishedAt = Date.now();

      logger.trace('model to save', o);
      let model = new HeartbeatsModel(o);
      try {
        await model.save();
        msg.ack();
        logger.trace('Heartbeat message successfully saved.');
      } catch (err) {
        logger.error('Message could not be saved', err);
      }

    });
  }
}
module.exports = HeartbeatsSubscriber;
