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
    const settings = new SettingsModel(req.body);
    return settings
      .save()
      .then(ExpressResult.created(res, settings))
      .catch(err => ExpressResult.error(res, err));
  }

  static count(req, res) {
    return SettingsModel
      .count()
      .exec();
  }

}

module.exports = SettingsController;
