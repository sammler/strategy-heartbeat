const logger = require('winster').instance();
// eslint-disable-next-line capitalized-comments
// const promiseRetry = require('promise-retry');

class AmqpSugar {

  constructor() {
    this.logger = logger;
  }

}

module.exports = AmqpSugar;
