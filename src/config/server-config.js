function getNatsStreamingHost() {
  return process.env.NATS_STREAMING_HOST || 'localhost';
}

function getNatsStreamingPort() {
  return process.env.NATS_STREAMING_PORT || '4222';
}

function getNatsStreamingServer() {
  return `nats://${getNatsStreamingHost()}:${getNatsStreamingPort()}`;
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'foo',
  PORT: process.env.PORT || 3101,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ENABLE_AUDIT_LOG: process.env.ENABLE_AUDIT_LOG === 'true',
  NATS_STREAMING_HOST: getNatsStreamingHost(),
  NATS_STREAMING_PORT: getNatsStreamingPort(),
  NATS_STREAMING_SERVER: getNatsStreamingServer()
};

