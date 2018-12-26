const path = require('path');
const glob = require('glob');
const logger = require('winster').instance();

// Todo(AAA): This needs to be async !!!
function init() {

  let subscribers = glob.sync(path.join(__dirname, './../modules/**/*.subscriber.js'));
  logger.trace('------ Subscribers');
  subscribers.forEach(s => {
    let SC = require(s);
    let subscriber = new SC();
    logger.trace(`Checking if subscriber is enabled: ${subscriber.name}:${subscriber.enabled}`);
    if (subscriber.enabled === true) {
      logger.trace('Registering subscriber', s.substring(s.indexOf('/modules')));
      if (subscriber.name) {
        logger.trace(`-- Name of subscriber: ${subscriber.name}`);
      }
      subscriber.init(); // <== This is async !!! // Todo(AAA): ARGHHH
    } else {
      logger.trace(`--> subscriber is disabled: ${subscriber.name}`);
    }
  });
  logger.trace('------ /Subscribers');
}

module.exports = {
  init
};
