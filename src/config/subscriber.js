const logger = require('winster').instance();
const path = require('path');
const glob = require('glob');

function init() {

  let subscribers = glob.sync(path.join(__dirname, './../modules/**/*.subscriber.js'));
  logger.trace('------ Subscribers');
  subscribers.forEach(s => {
    let SC = require(s);
    let subscriber = new SC();
    if (subscriber.enabled === true) {
      logger.trace('Registering subscriber', s.substring(s.indexOf('/modules')));
      if (subscriber.name) {
        logger.trace('-- Name of subscriber: ', subscriber.name);
      }
      subscriber.init();
    } else {
      logger.trace('--> subscriber is disabled');
    }
  });
  logger.trace('------ /Subscribers');
}

module.exports = {
  init
};
