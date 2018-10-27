const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');

const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-lib/default-config');
const SettingsModel = require('./../../src/modules/settings/settings.model').Model;

const ENDPOINTS = {
  SETTINGS_POST: '/v1/settings'
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

  describe('POST /v1/settings', () => {

    it('saves settings for a user', async () => {

      const doc = new SettingsModel({
        user_id: mongoose.Types.ObjectId(),
        every_minute: {
          enabled: true
        },
        every_two_minutes: {
          enabled: true
        },
        every_five_minutes: {}
      });

      await server
        .post(ENDPOINTS.SETTINGS_POST)
        .send(doc)
        .expect(HttpStatus.CREATED)
        .then(result => {
          debugger;
          console.log(result.body);
          expect(result.body).to.exist;
          expect(result.body).to.have.a.property('user_id').to.be.equal(doc.user_id.toString());
          expect(result.body).to.have.a.property('every_minute').to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.a.property('every_two_minutes').to.have.a.property('enabled').to.be.true;
          expect(result.body).to.have.a.property('every_five_minutes').to.have.a.property('enabled').to.be.false;
          expect(result.body).to.have.a.property('every_ten_minutes').to.have.a.property('enabled').to.be.false;
        });
    });

    it('will update existing settings for a user', async () => {

      const doc = {
        user_id: mongoose.Types.ObjectId()
      };

      await server
        .post(ENDPOINTS.SETTINGS_POST)
        .send(doc)
        .expect(HttpStatus.CREATED)
        .then(result => {
          expect(result.body).to.have.a.property('every_five_minutes').to.have.a.property('enabled').to.be.false;
        });

      const docUpdated = Object.assign(doc, {
        every_five_minutes: {
          enabled: true
        }
      });
      await server
        .post(ENDPOINTS.SETTINGS_POST)
        .send(doc)
        .expect(HttpStatus.CREATED)
        .then(result => {
          expect(result.body).to.have.a.property('every_five_minutes').to.have.a.property('enabled').to.be.true;
        });
    });
  });


});
