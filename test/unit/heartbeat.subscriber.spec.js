const HeartBeatSubscrber = require('./../../src/modules/heartbeat/heartbeat.subscriber');

describe('heartbeat.subscriber', () => {
  let heartbeatSubscriber = null;
  beforeEach(() => {
    heartbeatSubscriber = new HeartBeatSubscrber();
  });
  it('has a name', () => {
    expect(heartbeatSubscriber).to.have.a.property('name').to.be.equal('HeartBeat');
  });
});
