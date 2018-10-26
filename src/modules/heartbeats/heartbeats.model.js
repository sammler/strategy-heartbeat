const mongoose = require('mongoose');

const MongooseConfig = require('./../../config/mongoose-config');
const Schema = mongoose.Schema;

/* eslint-disable camelcase */
const schema = new Schema({

  user_id: {
    type: Schema.Types.ObjectId
  },



}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_HEARTBEATS,
  strict: true
});
/* eslint-enable camelcase */

const model = mongoose.model(MongooseConfig.COLLECTION_HEARTBEATS, schema);

module.exports = {
  Schema: schema,
  Model: model
};
