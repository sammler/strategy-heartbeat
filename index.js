const AppServer = require('./src/server.js');
const ON_DEATH = require('death');

let server = new AppServer();

ON_DEATH(async (signal, err) => {
  console.log('');
  console.log('on-death');
  await server.stop();
});

server.start();

