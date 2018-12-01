const jwt = require('jsonwebtoken');
const cfg = require('./../../src/config/server-config');
const moment = require('moment');
const mongoose = require('mongoose');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTokenPayload_User(user_id, tenant_id) {
  return {
    user_id: user_id || mongoose.Types.ObjectId().toString(),
    tenant_id: tenant_id || mongoose.Types.ObjectId().toString(),
    roles: [
      'user'
    ]
  };
}

function getToken(payload) {

  const pl = Object.assign({
    exp: moment().add(7, 'days').valueOf()
  }, payload);

  return jwt.sign(pl, cfg.JWT_SECRET);
}

module.exports = {
  sleep,
  getToken,
  getTokenPayload_User
};
