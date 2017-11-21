const logger = require('winster').instance();
const path = require('path');
const glob = require('glob');

function init() {

  let subscribers = glob.sync(path.join(__dirname, './../modules/**/*.subscriber.js'));
  logger.trace('------ Subscribers');
  subscribers.forEach(s => {
    let sC = require(s);
    let subscriber = new sC();
    if (subscriber.enabled === true) {
      logger.trace('Registering subscriber', s);
      if (subscriber.name) {
        logger.trace('-- Name of subscriber: ', subscriber.name);
      }
      subscriber.init();
    } else {
      logger.trace('--> subscriber is disabled');
    }
  });
}

module.exports = {
  init
};
