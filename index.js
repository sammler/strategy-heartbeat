const AppServer = require('./src/server.js');

let server = new AppServer();
server.start();

process.on('SIGTERM', function () {
  console.log('sigterm');
  server.stop();

  // Wait for all SIGTERM listeners to gracefully stop before forcing process exit
  process.nextTick(function () {
    process.exit()
  })
});
