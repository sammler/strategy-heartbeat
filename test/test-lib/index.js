const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');
const server = require('superagent');
const logger = require('winster').instance();

const cfg = require('./../../src/config/server-config');

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

/**
 * Delete jobs.
 * @returns {Promise<void>}
 */
async function deleteJobs(jobsUri) {

  const tokenPayload = {
    roles: [
      'system'
    ]
  };

  await server
    .delete(`${jobsUri}/v1/jobs/all`)
    .query({all: true})
    .set('x-access-token', this.getToken(tokenPayload))
    .catch(err => {
      logger.error('Could not run `deleteJobs`', err);
      throw err;
    });
}

function getToken(payload) {

  const pl = Object.assign({
    exp: moment().add(7, 'days').valueOf()
  }, payload);

  return jwt.sign(pl, cfg.JWT_SECRET);
}

module.exports = {
  sleep,
  deleteJobs,
  getToken,
  getTokenPayload_User
};
