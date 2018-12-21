
describe('[integration] => heartbeats', () => {

  describe('GET /v1/heartbeats', () => {
    it('returns UNAUTHORIZED if no JWT is passed');
    it('returns UNAUTHORIZED if no valid JWT is passed');
    it('returns an empty array if there are no records');
    it('returns the heartbeats of the currently authenticated user');
    it('returns the only the amount of recorded defined by page_size');
    it('allows paging');
  });

  describe('POST /v1/heartbeats', () => {
    it('returns UNAUTHORIZED if no JWT is passed');
    it('returns UNAUTHORIZED if no valid JWT is passed');
    it('allows to post a new record');
    it('does not allow to post a new record on behalf of a different user');
    it('throws an error if required field `user_id` is not provided');
    it('throws an error if required field `event` is not provided');
    it('throws an error if required field `requestedAt` is not provided');
    it('throws an error if required field `startedAt` is not provided');
    it('throws an error if required field `finishedAt` is not provided');
    it('throws the a list of validation errors');
  });

  describe('DELETE /v1/heartbeats', () => {
    it('returns UNAUTHORIZED if no JWT is passed');
    it('returns UNAUTHORIZED if no valid JWT is passed');
    it('deletes all records of the currently authenticated user');
    it('can handle thousands of records properly');
  });

});
