const AppServer = require('./app-server.js');
// Const onDeath = require('death');
const logger = require('winster').instance();

const config = {};

let appServer = new AppServer(config);

// onDeath(async signal => {
//   logger.trace('on-death-signal', signal);
//   try {
//     await appServer.stop();
//   } catch (err) {
//     console.error('Error stopping the server: ', err);
//   }
// });

(async () => {
  try {
    await appServer.start();
  } catch (err) {
    logger.error('Error starting the server: ', err);
  }
})();

