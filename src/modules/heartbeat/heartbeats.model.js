const mongoose = require('mongoose');

const MongooseConfig = require('./../../config/mongoose-config');

const Schema = mongoose.Schema;

const schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    unique: true
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
