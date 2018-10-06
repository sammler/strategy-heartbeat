const AppServer = require('./app-server.js');
const ON_DEATH = require('death');

const config = {};

let appServer = new AppServer(config);

// ON_DEATH(async (signal /*, err*/) => {
//   console.log('on-death');
//   console.log('on-death-signal', signal);
//   try {
//     await appServer.stop();
//   } catch (err) {
//     console.error('Error stopping the server: ', err);
//   }
// });

(async() => {
  try {
    await appServer.start();
  } catch (err) {
    console.error('Error starting the server: ', err);
  }
});

