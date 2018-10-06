
const CONFIG = {
  PORT: process.env.port || 3101,
  NATS_URI: process.env.NATS_URI || 'nats://localhost:4222'
};

module.exports = CONFIG;
