const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');

const MongooseConfig = require('./../../config/mongoose-config');
const Schema = mongoose.Schema;

/* eslint-disable camelcase */

const enabledSchema = new Schema({
  _id: false,
  enabled: {
    type: Boolean,
    required: true,
    default: false
  },
  job_id: {
    type: Schema.Types.ObjectId,
    required: false
  }
});

const schema = new Schema({

  user_id: {
    type: Schema.Types.ObjectId,
    unique: true
  },
  enabled: {type: Boolean, required: true, default: false},
  every_minute: {type: enabledSchema, default: () => ({enabled: false})},
  every_two_minutes: {type: enabledSchema, default: () => ({enabled: false})},
  every_five_minutes: {type: enabledSchema, default: () => ({enabled: false})},
  every_ten_minutes: {type: enabledSchema, default: () => ({enabled: false})},
  every_hour: {type: enabledSchema, default: () => ({enabled: false})},
  every_day: {type: enabledSchema, default: () => ({enabled: false})},
  every_week: {type: enabledSchema, default: () => ({enabled: false})},
  every_month: {type: enabledSchema, default: () => ({enabled: false})}
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_SETTINGS,
  strict: true
});
/* eslint-enable camelcase */

schema.plugin(timeStamps, {createdAt: MongooseConfig.FIELD_CREATED_AT, updatedAt: MongooseConfig.FIELD_UPDATED_AT});

const model = mongoose.model(MongooseConfig.COLLECTION_SETTINGS, schema);

module.exports = {
  Schema: schema,
  Model: model
};
