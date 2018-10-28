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
      .then(result => ExpressResult.created(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

  static put(req, res) {
    const query = {user_id: req.body.user_id};
    return SettingsModel
      .updateOne(query, req.body)
      .then(result => {
        if (result.nModified === 1) {
          ExpressResult.ok(res, result)
        } else {
          ExpressResult.error(res, {error: 'Document was not updated.'})
        }
      })
      .catch(err => ExpressResult.error(res, err))
  }

  static count(req, res) {
    return SettingsModel
      .count()
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err))
  }
}

module.exports = SettingsController;
