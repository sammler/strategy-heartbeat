const config = require('./server-config');
module.exports = {
  connectionOpts: {
    clusterId: 'test-cluster',
    clientId: 'strategy-heartbeat_' + process.pid,
    server: config.NATS_STREAMING_SERVER
  }
};
