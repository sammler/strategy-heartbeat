const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const AppServer = require('./../../src/app-server');
const mongoose = require('mongoose');

const defaultConfig = require('./../test-lib/default-config');
const pkg = require('read-pkg-up').sync().pkg;

describe('[integration] => api-docs', () => {

  let server;
  let appServer;

  beforeEach(async () => {
    appServer = new AppServer(defaultConfig);
    await appServer.start();
    server = superTest(appServer.server);
  });

  afterEach(async () => {
    await appServer.stop();
    mongoose.models = {};
    mongoose.modelSchemas = {};
  });

  it('GET /api-docs/raw => returns the raw api-docs', () => {
    return server
      .get('/api-docs/raw')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.have.a.property('body').to.exist;
        expect(result.body).to.deep.include({swagger: '2.0'});
        expect(result.body).to.have.a.property('info');
        expect(result.body.info).to.include({title: pkg.name});
        expect(result.body.info).to.include({version: pkg.version});
      });
  });

  it('GET /api-docs/raw => contains the definitions', () => {
    return server
      .get('/api-docs/raw')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.have.a.property('body').to.exist;
        expect(result.body).to.have.a.property('definitions');
      });

  });

  it('GET /api-docs/raw => contains all routes as defined', () => {
    return server
      .get('/api-docs/raw')
      .expect(HttpStatus.OK)
      .then(result => {
        // expect(result.body.paths).to.have.property('/api-docs/raw');
        expect(result.body.paths).to.have.property('/health-check');
      });
  });

  it('GET /api-docs => returns the swagger docs', () => {
    return server
      .get('/api-docs')
      .expect(HttpStatus.MOVED_PERMANENTLY);
  });
});
