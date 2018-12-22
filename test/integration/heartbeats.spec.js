const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const logger = require('winster').instance();
const _ = require('lodash');

const serverConfig = require('./../../src/config/server-config');
const AppServer = require('./../../src/app-server');
const testConfig = require('./../test-lib/default-config');
const testLib = require('./../test-lib');

const HeartbeatsModel = require('./../../src/modules/heartbeats/heartbeats.model').Model;

const ENDPOINTS = {
  HEARTBEATS_GET_MINE: '/v1/heartbeats',
  HEARTBEATS_COUNT_MINE: '/v1/heartbeats/count',
  HEARTBEATS_POST_MINE: '/v1/heartbeats',
  HEARTBEATS_DELETE_MINE: '/v1/heartbeats'
};
const USER = {
  user_id: mongoose.Types.ObjectId().toString(),
  roles: [
    'user'
  ]
};

describe('[integration] => heartbeats', () => {

  let server;
  let appServer;

  beforeEach(async () => {
    if (appServer) {
      await appServer.stop();
    }
    appServer = new AppServer(testConfig);
    await appServer.start();
    server = superTest(appServer.server);

    await HeartbeatsModel.deleteMany();

  });

  afterEach(async () => {
    await appServer.stop();
  });

  describe('GET /v1/heartbeats', () => {

    it('returns UNAUTHORIZED if no JWT is passed', async () => {
      await server
        .get(ENDPOINTS.HEARTBEATS_GET_MINE)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns an empty array if there are no records', async () => {
      await server
        .get(ENDPOINTS.HEARTBEATS_GET_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.be.an('array');
        });
    });

    it('returns the heartbeats of the currently authenticated user');
    it('returns the only the amount of recorded defined by page_size');
    it('allows paging');
  });

  describe('POST /v1/heartbeats', () => {

    it('returns UNAUTHORIZED if no JWT is passed', async () => {
      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('allows to post a new record', async () => {
      const doc = {
        user_id: USER.user_id,
        event: 'foo',
        publishedAt: Date.now(),
        startedAt: Date.now(),
        finishedAt: Date.now()
      };
      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .send(doc)
        .expect(HttpStatus.OK)
        .then(result => {
          console.log(result.body);
          let expectedProps = [
            'user_id',
            'event',
            'publishedAt',
            'startedAt',
            'finishedAt',
            'createdAt',
            'updatedAt'
          ];
          expectedProps.forEach(prop => {
            expect(result.body).to.have.property(prop);
          });
        });
    });

    it('does not allow to post a new record on behalf of a different user', async () => {

      // The `other` user, who tries to do something
      const the_other_user = {
        user_id: mongoose.Types.ObjectId().toString()
      };
      const doc = {
        user_id: USER.user_id,
        roles: USER.roles,
        event: 'foo',
        publishedAt: Date.now(),
        startedAt: Date.now(),
        finishedAt: Date.now()
      };

      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(the_other_user))
        .send(doc)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.property('validationErrors').to.be.an('array').to.match(/is not allowed to perform action on behalf of user/);
        });
    });

    it('throws a list of validation errors', async () => {
      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.property('validationErrors').to.be.an('array');
        });
    });

    it('throws an error if required field `user_id` is not provided', async () => {
      const doc = {};
      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .send(doc)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          console.log(result.body.validationErrors);
          expect(result.body).to.have.property('validationErrors').to.be.an('array').to.include('Argument \'user_id\' cannot be null or empty.');
        });
    });

    it('throws an error if required field `event` is not provided', async () => {
      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.property('validationErrors').to.be.an('array').to.include('Argument \'event\' cannot be null or empty.');
        });
    });

    it('throws an error if required field `publishedAt` is not provided', async () => {

      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.property('validationErrors').to.be.an('array').to.include('Argument \'publishedAt\' cannot be null or empty.');
        });

    });

    it('throws an error if required field `startedAt` is not provided', async () => {
      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.property('validationErrors').to.be.an('array').to.include('Argument \'startedAt\' cannot be null or empty.');
        });

    });

    it('throws an error if required field `finishedAt` is not provided', async () => {
      await server
        .post(ENDPOINTS.HEARTBEATS_POST_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.property('validationErrors').to.be.an('array').to.contain('Argument \'finishedAt\' cannot be null or empty.');
        });

    });
  });

  describe('DELETE /v1/heartbeats', () => {
    it('returns UNAUTHORIZED if no JWT is passed', async () => {
      await server
        .delete(ENDPOINTS.HEARTBEATS_DELETE_MINE)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('deletes all entries of the currently authenticated user');
    it('can handle thousands of records properly');
    it('does not delete entries of other users');
  });

  describe('DELETE /v1/heartbeats/all', () => {
    it('returns UNAUTHORIZED if no JWT is passed', async () => {
      await server
        .delete(ENDPOINTS.HEARTBEATS_DELETE_MINE)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('throw an error if the user does not own the role `system`');
    it('deletes all records');
  });

  describe('GET /v1/heartbeats/count', () => {
    it('returns UNAUTHORIZED if no JWT is passed', async () => {
      await server
        .get(ENDPOINTS.HEARTBEATS_COUNT_MINE)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('returns the count of all heartbeats for the given user', async () => {
      await server
        .get(ENDPOINTS.HEARTBEATS_COUNT_MINE)
        .set('x-access-token', testLib.getToken(USER))
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.exist;
        });
    });
  });
  describe('GET /v1/heartbeats/count/all', () => {
    it('returns UNAUTHORIZED if no JWT is passed', async () => {
      await server
        .delete(ENDPOINTS.HEARTBEATS_DELETE_MINE)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('throws `UNAUTHORIZED` if the current user does not own role `system`');
    it('returns the count of all heartbeats stored');
  });

});
