const SettingsModel = require('./settings.model').Model;
const ExpressResult = require('express-result');

class SettingsController {

  static get(req, res) {
    return SettingsModel
      .find()
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

  static post(req, res) {
    return SettingsModel
      .save(req.body)
      .then(ExpressResult.ok(res))
      .catch(err => ExpressResult.error(res, err));
  }

}

module.exports = SettingsController;
