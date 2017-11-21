const AppServer = require('./../../src/server.js');

describe('AppServer', () => {

  let appServer = null;
  beforeEach(() => {
    appServer = new AppServer();
  });

  it('should expose some methods', () => {
    expect(appServer).to.have.property('_init').to.be.a('function');
    expect(appServer).to.have.property('start').to.be.a('function');
    expect(appServer).to.have.property('stop').to.be.a('function');
  });
});
