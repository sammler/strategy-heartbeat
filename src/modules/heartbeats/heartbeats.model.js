const mongoose = require('mongoose');

const MongooseConfig = require('./../../config/mongoose-config');

const Schema = mongoose.Schema;

const schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId
  },
  event: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  finishedAt: {
    type: Date,
    required: true
  }
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_HEARTBEATS,
  strict: true,
  timestamps: {createdAt: MongooseConfig.FIELD_CREATED_AT, updatedAt: MongooseConfig.FIELD_UPDATED_AT}
});

const model = mongoose.model(MongooseConfig.COLLECTION_HEARTBEATS, schema);

module.exports = {
  Schema: schema,
  Model: model
};
