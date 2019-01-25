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

      console.log('HeartbeatSubscriber:on:message', msg.getData());
      let msgRaw = JSON.parse(JSON.parse(msg.getData())); // Does anybody understand why this is necessary?
      console.log('msgRaw', msgRaw);
      console.log('--');
      console.log(msgRaw);
      console.log('--');
      console.log('user_id', msgRaw.user_id);
      console.log('--');
      let o = {
        user_id: msgRaw.user_id,
        event: msgRaw.event,
        publishedAt: msgRaw.publishedAt || Date.now(),
        startedAt: Date.now(),
        finishedAt: Date.now()
      };

      // Wait for 1 secs (to do whatever long operation)
      await utils.sleep(1000);
      o.finishedAt = Date.now();

      console.log('model to save', o);
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
