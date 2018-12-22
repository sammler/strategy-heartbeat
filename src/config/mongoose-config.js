
module.exports = {
  debug: process.env.MONGODB_DEBUG || false,
  host: process.env.MONGODB_HOST || 'localhost',
  port: process.env.MONGODB_PORT || 27017,
  database: process.env.MONGODB_DATABASE || 'db',

  COLLECTION_PREFIX: 'strategy-heartbeat~~',

  FIELD_CREATED_AT: 'createdAt',
  FIELD_UPDATED_AT: 'updatedAt',

  COLLECTION_SETTINGS: 'settings',
  COLLECTION_HEARTBEATS: 'heartbeats'

};
