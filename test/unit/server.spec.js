const AppServer = require('./../../src/app-server.js');

xdescribe('AppServer', () => {

  let appServer = null;
  beforeEach(() => {
    appServer = new AppServer();
  });

  it('should expose some methods', () => {
    expect(appServer).to.have.property('_initApp').to.be.a('function');
    expect(appServer).to.have.property('start').to.be.a('function');
    expect(appServer).to.have.property('stop').to.be.a('function');
  });
});
