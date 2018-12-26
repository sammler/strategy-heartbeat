const logger = require('winster').instance();

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

    let opts = natsClient.instance().stan.subscriptionOptions();
    opts.setStartWithLastReceived();
    opts.setManualAckMode(true);
    opts.setAckWait(60 * 100); // 60s

    let subscription = natsClient.instance().subscribeWithQueue(CHANNEL, QUEUE, opts);

    subscription.on('message', async msg => {
      console.log('HeartbeatSubscriber:on:message', msg.getData());
      let msgRaw = JSON.parse(msg.getData());
      console.log('msgRaw', msgRaw);
      let o = {
        user_id: msgRaw.user_id,
        event: msgRaw.event,
        publishedAt: Date.now(),
        startedAt: Date.now(),
        finishedAt: Date.now()
      };
      let model = new HeartbeatsModel(o);
      try {
        await model.save();
        msg.ack();
      } catch (err) {
        logger.error('Message could not be saved', err);
      }

    });
  }
}
module.exports = HeartbeatsSubscriber;
