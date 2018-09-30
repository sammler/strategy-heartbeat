const logger = require('winster').instance();
const Subscriber = require('./../../lib/Subscriber');
const Lepus = require('lepus');

class HeartbeatSubscriberOld extends Subscriber {
  constructor() {
    super();
    this.name = 'HeartBeat';
    this.enabled = true;
    this.lepus = new Lepus();
    this.logger = logger;
  }

  init() {
    // This is the right place for all the event handlers
    this.on('subscribe', this._OnSubscribe);
    super.init();
  }

  subscribe() {
    this.logger.trace('    --> hey, we subscribe');
    super.subscribe();

    let opts = {
      exchange: {
        type: 'topic',
        name: 'heartbeat'
      },
      key: 'heartbeat.cmd.ping',
      queue: {
        name: 'queue_heartbeat.cmd.ping'
      }
    };

    this.lepus.subscribeMessage(opts, HeartbeatSubscriberOld.listener)
      .catch(err => {
        this.logger.error('An error occurred, subscribing tot he message', err);
      })
  }

  _OnSubscribe() {
    this.logger.trace('    --> on:subscribe');
  }


  static async listener(msgContent, msgRaw) {
    logger.trace('xx Hey, I am the famous listener');
  }

}

module.exports = HeartbeatSubscriberOld;
