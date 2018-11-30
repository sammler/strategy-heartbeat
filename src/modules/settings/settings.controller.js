const SettingsModel = require('./settings.model').Model;
const ExpressResult = require('express-result');
const logger = require('winster').instance();

const serverConfig = require('./../../config/server-config');
const auditLogActions = require('./../../config/audit-log-actions');
const auditLogService = require('sammler-io-audit-logs');

class SettingsController {

  static async getMine(req, res) {
    let {user_id} = req.user;

    return SettingsModel
      .find({user_id: user_id})
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

  static async post(req, res) {
    const settings = new SettingsModel(req.body);
    return settings
      .save()
      .then(result => ExpressResult.created(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

  static async createUpdateMine(req, res) {
    const user_id = req.user.user_id;

    if (req.user.user_id !== req.body.user_id) {
      return ExpressResult.unauthorized(res, {message: 'The user_id of the resource does not match the id of the currently authenticated user.'});
    }

    try {
      let result = await SettingsModel.findOneAndUpdate(
        {user_id: user_id},
        req.body,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );

      // Audit Log
      if (serverConfig.ENABLE_AUDIT_LOG === true) {
        auditLogService.log(auditLogActions.SUBJECT, auditLogActions.cloudEvents.putSettingsMine(req.user));
      } else {
        logger.verbose(`We are not audit-logging here (${serverConfig.ENABLE_AUDIT_LOG}).`);
      }

      try {
        // Todo: remove eslint rule
        let resultWithJobs = await SettingsController._ensureJobs(result); // eslint-disable-line no-unused-vars
      } catch (e) {
        let err = {
          message: 'We have an error saving jobs for each of the heartbeat events.',
          error: e
        };
        logger.error(err.message, e);
        return ExpressResult.error(res, err);
      }

      ExpressResult.ok(res, result);
    } catch (err) {
      ExpressResult.error(res, {err});
    }
  }

  /**
   * Makes sure that we have jobs for each of the heartbeat events
   * @private
   */
  static async _ensureJobs(settings) {
    return settings;
  }

  static count(req, res) {
    return SettingsModel
      .count()
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }
}

module.exports = SettingsController;
