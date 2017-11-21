const logger = require('winster').instance();
const Subscriber = require('./../../lib/Subscriber');

class HeartBeatSubscriber extends Subscriber {
  constructor() {
    super();
    this.name = 'HeartBeat';
    this.enabled = true;
  }

  init() {
    this.on('subscribe', this._OnSubscribe);
    super.init();
  }

  subscribe() {
    logger.trace('hey, we subscribe');
    super.subscribe();
  }

  _OnSubscribe() {
    logger.trace('on:subscribe');
  }

}

module.exports = HeartBeatSubscriber;
