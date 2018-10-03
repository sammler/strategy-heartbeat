const NATS = require('nats');
const nats = NATS.connect({url: 'nats://localhost:4222', json: true}); // Todo: this needs to be made configurable

class HeartBeatSubscriber {
  constructor() {
  }

  init() {
    console.log('Init from HeartBeatSubscriber');
  }

}

module.exports = HeartBeatSubscriber;
