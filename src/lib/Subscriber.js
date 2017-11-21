const logger = require('winster').instance();
const EventEmitter = require('events');

class Subscriber extends EventEmitter {
  constructor() {
    super();
    this.name = null;
    this.enabled = false;
  }

  init() {
    logger.verbose('base.init');
    this.emit('init');
    this.subscribe();
  }

  listen() {
    logger.verbose('base.listen');
    this.emit('listen');
  }

  subscribe() {
    logger.trace('base.subscribe');
    this.emit('subscribe');
  }

  logError() {
    logger.trace('base.logError');
    this.emit('error');
  }

  logEvent() {
    logger.verbose('base.logEvent');
    this.emit('logEvent');
  }
}

module.exports = Subscriber;
