const superTest = require('supertest');
const HttpStatus = require('http-status-codes');

const serverConfig = require('./../../src/config/server-config');

const ENDPOINTS = {
  JOBS_MINE: '/v1/jobs'
};
const JOBS_URI = `${serverConfig.JOBS_SERVICE_URI}`;

const expectJobsCount = async (token, expectedLength) => {

  const jobsServer = superTest(JOBS_URI);
  await jobsServer
    .get(ENDPOINTS.JOBS_MINE)
    .set('x-access-token', token)
    .expect(HttpStatus.OK)
    .then(result => {
      expect(result.body).to.be.an('array').to.be.of.length(expectedLength);
    });
};

module.exports = {
  expectJobsCount
};

