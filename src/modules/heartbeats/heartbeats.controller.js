const HeartbeatsModel = require('./heartbeats.model').Model;
const ExpressResult = require('express-result');

class HeartbeatsController {

  static get(req, res) {
    return HeartbeatsModel
      .find()
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

}

module.exports = HeartbeatsController;
