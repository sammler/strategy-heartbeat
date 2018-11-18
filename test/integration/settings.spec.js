const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const logger = require('winster').instance();

const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-lib/default-config');
const testLib = require('./../test-lib');
const SettingsModel = require('./../../src/modules/settings/settings.model').Model;

const ENDPOINTS = {
  SETTINGS_GET_MINE: '/v1/settings',
  SETTINGS_PUT_MINE: '/v1/settings'
};

describe('[integration] settings', () => {

  let server;
  let appServer;

  beforeEach(async () => {
    if (appServer) {
      await appServer.stop();
    }
    appServer = new AppServer(testConfig);
    await appServer.start();
    server = superTest(appServer.server);
    await SettingsModel.deleteMany();
  });

  afterEach(async () => {
    await appServer.stop();
  });

  describe('PUT /v1/settings', () => {

    it('throws an error is no JWT is passed');

    it('throws an error if the authenticated user does not match the given user_id');

    it('saves settings for a user', async () => {

      const userId = mongoose.Types.ObjectId().toString(); // eslint-disable-line new-cap

      const doc = new SettingsModel({
        user_id: userId,
        every_minute: {
          enabled: true
        },
        every_two_minutes: {
          enabled: true
        },
        every_five_minutes: {}
      });

      const tokenPayload = {
        user_id: userId,
        roles: ['user']
      };

      await server
        .put(ENDPOINTS.SETTINGS_PUT_MINE)
        .send(doc)
        .set('x-access-token', testLib.getToken(tokenPayload))
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.exist;
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id.toString());
          expect(result.body).to.have.a.property('every_minute').to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.a.property('every_two_minutes').to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.a.property('every_five_minutes').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.a.property('every_ten_minutes').to.have.a.property('enabled').to.be.false;
        })
        .catch(err => {
          logger.trace('Error when saving settings', err);
        });

      expect(await SettingsModel.countDocuments()).to.be.equal(1);
    });

    it('updates existing settings for a user', async () => {

      const userId = mongoose.Types.ObjectId().toString(); // eslint-disable-line new-cap

      const doc = {
        user_id: userId,
        every_minute: {
          enabled: true
        },
        every_five_minutes: {
          enabled: false
        }
      };

      const tokenPayload = {
        user_id: userId,
        roles: [
          'user'
        ]
      };
      const token = testLib.getToken(tokenPayload);

      await server
        .put(ENDPOINTS.SETTINGS_PUT_MINE)
        .set('x-access-token', token)
        .send(doc)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.have.a.property('every_minute').to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.a.property('every_five_minutes').to.have.a.property('enabled').to.be.false;
        });

      const docUpdated = Object.assign(doc, {
        every_five_minutes: {
          enabled: true
        }
      });
      await server
        .put(ENDPOINTS.SETTINGS_PUT_MINE)
        .set('x-access-token', token)
        .send(docUpdated)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id);
        });

      expect(await SettingsModel.countDocuments()).to.be.equal(1);

    });
  });

  describe('GET /v1/settings', () => {

  });

});
