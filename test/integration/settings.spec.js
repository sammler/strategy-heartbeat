const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const logger = require('winster').instance();
const _ = require('lodash');

const serverConfig = require('./../../src/config/server-config');
const AppServer = require('./../../src/app-server');
const testLib = require('./../test-lib');
const SettingsModel = require('./../../src/modules/settings/settings.model').Model;
const jobServiceAsserts = require('./../test-lib/job-service.asserts');

const JOBS_URI = `${serverConfig.JOBS_SERVICE_URI}`;
const ENDPOINTS = {
  SETTINGS_GET_MINE: '/v1/settings',
  SETTINGS_DELETE_MINE: '/v1/settings',
  SETTINGS_POST_MINE: '/v1/settings',
  JOBS_MINE: '/v1/jobs'
};

describe('[integration] settings', () => {

  let server;
  let appServer;

  before(async () => {
    if (appServer) {
      await appServer.stop();
    }
    appServer = new AppServer();
    await appServer.start();
    server = superTest(appServer.server);
  });

  beforeEach(async () => {
    await SettingsModel.deleteMany();
    await testLib.deleteJobs(JOBS_URI);
  });

  after(async () => {
    await appServer.stop();
  });

  describe('POST /v1/settings', () => {

    it('throws an error if no JWT is passed', async () => {
      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('throws an error if the authenticated user does not match the given user_id', async () => {

      const userId = mongoose.Types.ObjectId().toString();
      const doc = new SettingsModel({
        user_id: userId
      });
      const tokenPayLoad = {
        user_id: mongoose.Types.ObjectId().toString() // just a different user_id
      };

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', testLib.getToken(tokenPayLoad))
        .send(doc)
        .expect(HttpStatus.UNAUTHORIZED)
        .then(result => {
          expect(result.body).to.exist;
          expect(result.body).to.have.a.property('message', 'The `user_id` of the resource does not match the id of the currently authenticated user.');
        });

    });

    it('should default to being disabled', async () => {

      let tokenPayLoad = testLib.getTokenPayload_User();
      let token = testLib.getToken(tokenPayLoad);

      const doc = {
        user_id: tokenPayLoad.user_id
      };

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(doc)
        // .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id);
          expect(result.body).to.have.a.property('enabled').to.be.false;

          expect(result.body).to.have.property('every_minute').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_minute').to.not.have.a.property('job_id');

          expect(result.body).to.have.property('every_two_minutes').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_two_minutes').to.not.have.a.property('job_id');

          expect(result.body).to.have.property('every_five_minutes').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_five_minutes').to.not.have.a.property('job_id');

          expect(result.body).to.have.property('every_ten_minutes').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_ten_minutes').to.not.have.a.property('job_id');

          expect(result.body).to.have.property('every_hour').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_hour').to.not.have.a.property('job_id');

          expect(result.body).to.have.property('every_day').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_day').to.not.have.a.property('job_id');

          expect(result.body).to.have.property('every_week').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_week').to.not.have.a.property('job_id');

          expect(result.body).to.have.property('every_month').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.property('every_month').to.not.have.a.property('job_id');
        })
        .catch(err => {
          expect(err).to.not.exist;
        });
    });

    it('saves settings for a user', async () => {

      const userId = mongoose.Types.ObjectId().toString();

      const doc = new SettingsModel({
        user_id: userId,
        enabled: true,
        every_minute: {
          enabled: true
        },
        every_two_minutes: {
          enabled: true
        },
        every_five_minutes: {}
      });

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .send(doc)
        .set('x-access-token', testLib.getToken(testLib.getTokenPayload_User(userId)))
        // .expect(HttpStatus.OK)
        .then(result => {

          expect(result.body).to.exist;
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id.toString());
          expect(result.body).to.have.a.property('enabled').to.be.true;

          // explicitely set
          expect(result.body).to.have.a.property('every_minute').to.have.a.property('enabled').to.be.true;
          expect(result.body.every_minute).to.have.a.property('job_id').to.not.be.empty;

          // explicitely seet
          expect(result.body).to.have.a.property('every_two_minutes').to.have.a.property('enabled').to.be.true;
          expect(result.body.every_two_minutes).to.have.a.property('job_id').to.not.be.empty;

          // passed empty object => fall back to default
          expect(result.body).to.have.a.property('every_five_minutes').to.have.a.property('enabled').to.be.false;
          expect(result.body.every_five_minutes).to.not.have.a.property('job_id');

          // default values
          expect(result.body).to.have.a.property('every_ten_minutes').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.a.property('every_hour').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.a.property('every_day').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.a.property('every_week').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.a.property('every_month').to.have.a.property('enabled').to.be.false;

        });

      expect(await SettingsModel.countDocuments(testLib.getTokenPayload_User().user_id)).to.be.equal(1);
    });

    it('updates existing settings for a user', async () => {

      const userId = mongoose.Types.ObjectId().toString();

      const doc = {
        user_id: userId,
        enabled: true,
        every_minute: {
          enabled: true
        },
        every_five_minutes: {
          enabled: false
        }
      };

      let token = testLib.getToken(testLib.getTokenPayload_User(userId));

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(doc)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.exist;
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id.toString());
          expect(result.body).to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.a.property('every_minute').to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.a.property('every_five_minutes').to.have.a.property('enabled').to.be.false;
        })
        .catch(err => logger.error);

      const docUpdated = Object.assign(doc, {
        every_five_minutes: {
          enabled: true
        }
      });
      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(docUpdated)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id);
          expect(result.body).to.have.a.property('enabled').to.be.true;

        })
        .catch(err => logger.error);

      expect(await SettingsModel.countDocuments(userId)).to.be.equal(1);
    });

    it('should delete related records in case of disabling the strategy', async () => {

      let tokenPayLoad = testLib.getTokenPayload_User();
      let token = testLib.getToken(tokenPayLoad);

      const doc = {
        user_id: tokenPayLoad.user_id,
        enabled: true,
        every_minute: {
          enabled: true
        }
      };
      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(doc)
        .expect(HttpStatus.OK);

      await jobServiceAsserts.expectJobsCount(token, 1);

      const docUpdated = {
        user_id: tokenPayLoad.user_id,
        enabled: false
      };

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(docUpdated)
        .expect(HttpStatus.OK);
      // .then(result => {
      //   console.log('result', result.body);
      // })
      // .catch(err => {
      //   console.error('err', err);
      // });

      await jobServiceAsserts.expectJobsCount(token, 0);

    }).timeout(4000);

    // Todo: would make sense to stub the job-service here ...
    it('creates/updates settings, but also creates related jobs', async () => {

      let tokenPayLoad = testLib.getTokenPayload_User();
      let token = testLib.getToken(tokenPayLoad);

      const doc = {
        user_id: tokenPayLoad.user_id,
        enabled: true,
        every_minute: {enabled: true},
        every_two_minutes: {enabled: false},
        every_five_minutes: {enabled: true},
        every_ten_minutes: {enabled: false},
        every_hour: {enabled: true},
        every_day: {enabled: false},
        every_week: {enabled: true},
        every_month: {enabled: false}
      };

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(doc)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id);
          expect(result.body).to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.property('every_minute').to.have.a.property('job_id');
          expect(result.body).to.have.property('every_two_minutes').to.not.have.a.property('job_id');
          expect(result.body).to.have.property('every_five_minutes').to.have.a.property('job_id');
          expect(result.body).to.have.property('every_ten_minutes').to.not.have.a.property('job_id');
          expect(result.body).to.have.property('every_hour').to.have.a.property('job_id');
          expect(result.body).to.have.property('every_day').to.not.have.a.property('job_id');
          expect(result.body).to.have.property('every_week').to.have.a.property('job_id');
          expect(result.body).to.have.property('every_month').to.not.have.a.property('job_id');
        })
        .catch(err => {
          logger.error(err);
          expect(err).to.not.exist;
        });
    }).timeout(4000);

    it('creates/updates settings, and deletes related jobs', async () => {

      // we need to stub the jobs-service here
      let tokenPayLoad = testLib.getTokenPayload_User();
      let token = testLib.getToken(tokenPayLoad);

      let doc = {
        user_id: tokenPayLoad.user_id,
        enabled: true,
        every_minute: {enabled: true}
      };

      // Create a setting
      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(doc)
        .expect(HttpStatus.OK)
        .then(result => {
          doc = result.body;
          expect(result.body).to.have.property('every_minute').to.have.a.property('enabled', true);
          expect(result.body).to.have.property('every_minute').to.have.a.property('job_id');
        })
        .catch(err => {
          // console.error(err);
          expect(err).to.not.exist;
        });

      // Check if we have one job
      await jobServiceAsserts.expectJobsCount(token, 1);

      const updatedDoc = _.merge(doc, {
        every_minute: {enabled: false}
      });

      // Change the setting
      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(updatedDoc)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.have.property('every_minute').to.have.a.property('enabled', false);
          expect(result.body).to.have.property('every_minute').to.not.have.a.property('job_id');
        });

      // Check if the related job has been deleted
      await jobServiceAsserts.expectJobsCount(token, 0);

    }).timeout(10000);

    it('creates/updates settings, and updates related jobs');

  });

  describe('GET /v1/settings', () => {

    it('returns settings for the currently authenticated user (empty)', async () => {

      await server
        .get(ENDPOINTS.SETTINGS_GET_MINE)
        .set('x-access-token', testLib.getToken(testLib.getTokenPayload_User()))
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result).to.exist;
          expect(result.body).to.exist;
          expect(result.body).to.be.an('array');
        });
      expect(await SettingsModel.countDocuments(testLib.getTokenPayload_User().user_id)).to.be.equal(0);

    });

    it('returns the settings for the currently authenticated user (one)', async () => {
      const userId = mongoose.Types.ObjectId().toString();
      const doc = {
        user_id: userId
      };
      let token = testLib.getToken(testLib.getTokenPayload_User(userId));

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(doc)
        .expect(HttpStatus.OK);
      // .then(result => {
      //   console.log(result.body.user_id);
      // })

      await server
        .get(ENDPOINTS.SETTINGS_GET_MINE)
        .set('x-access-token', token)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.be.an('array').of.length(1);
        });

      expect(await SettingsModel.countDocuments(testLib.getTokenPayload_User().user_id)).to.be.equal(1);
    });

    it('returns the correct amount of settings (no settings from other users)', async () => {
      const userId = mongoose.Types.ObjectId().toString();
      const doc = {
        user_id: userId
      };
      const tokenPayload = {
        user_id: userId,
        roles: ['user']
      };

      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', testLib.getToken(tokenPayload))
        .send(doc)
        .expect(HttpStatus.OK);
      // .then(result => {
      //   console.log(result.body.user_id);
      // });

      const tokenPayload2 = {
        user_id: mongoose.Types.ObjectId().toString(), // just another user
        roles: ['user']
      };

      await server
        .get(ENDPOINTS.SETTINGS_GET_MINE)
        .set('x-access-token', testLib.getToken(tokenPayload2))
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.be.an('array').of.length(0);
        });
    });

    it('throws an error if no JWT is passed', async () => {
      await server
        .post(ENDPOINTS.SETTINGS_GET_MINE)
        .expect(HttpStatus.UNAUTHORIZED);
    });

  });

  describe('DELETE /v1/settings', () => {

    it('returns `unauthorized` without a proper JWT token', async () => {
      await server
        .post(ENDPOINTS.SETTINGS_DELETE_MINE)
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should delete the current user\'s setting', async () => {

      let tokenPayLoad = testLib.getTokenPayload_User();
      let token = testLib.getToken(tokenPayLoad);

      let doc = {
        user_id: tokenPayLoad.user_id,
        every_minute: {enabled: true}
      };

      // Create a setting
      await server
        .post(ENDPOINTS.SETTINGS_POST_MINE)
        .set('x-access-token', token)
        .send(doc)
        .expect(HttpStatus.OK);

      expect(await SettingsModel.countDocuments(testLib.getTokenPayload_User().user_id)).to.be.equal(1);

      await server
        .delete(ENDPOINTS.SETTINGS_DELETE_MINE)
        .set('x-access-token', token)
        .expect(HttpStatus.OK);

      expect(await SettingsModel.countDocuments(testLib.getTokenPayload_User().user_id)).to.be.equal(0);

    });

    it('should NOT delete other user\'s settings');

    it('should delete related records');
  });
});
