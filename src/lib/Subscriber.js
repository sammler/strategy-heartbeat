const logger = require('winster').instance();
const EventEmitter = require('events');

/**
 *
 * Events
 * - init
 * - listen_start
 * - listen_end
 * - listen_result
 * - subscribe
 *
 */
class Subscriber extends EventEmitter {

  /**
   *
   * @param config - Basic configuration parameters, which can be injected.
   */
  constructor(config) {
    super();
    this.config = config;
    this.name = null;
    this.enabled = false;
  }

  init() {
    logger.trace('--> base.init');
    this.emit('init');
    this.subscribe();
  }

  async listen() {
    logger.verbose('base.listen');
    this.emit('listen');
  }

  // Validates the setup (including meta-data) before we actually do anything.
  validate() {

  }

  // Main action to subscribe to the event(s) we should listen to.
  // If multiple events are defined, they have to use the same payload definition.
  subscribe() {
    logger.trace('--> base.subscribe');
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
