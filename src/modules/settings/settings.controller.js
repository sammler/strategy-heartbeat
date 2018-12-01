const SettingsModel = require('./settings.model').Model;
const ExpressResult = require('express-result');
const logger = require('winster').instance();
const superagent = require('superagent');

const serverConfig = require('./../../config/server-config');
const auditLogActions = require('./../../config/audit-log-actions'); // eslint-disable-line no-unused-vars
const auditLogService = require('sammler-io-audit-logs'); // eslint-disable-line no-unused-vars

const events = [
  'every_minute',
  'every_two_minutes',
  'every_five_minutes',
  'every_ten_minutes',
  'every_hour',
  'every_day',
  'every_week',
  'every_month'
];

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
    const {user_id} = req.user;

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

      // Todo: Re-enable audit-log
      // Audit Log
      // if (serverConfig.ENABLE_AUDIT_LOG === true) {
      //   auditLogService.log(auditLogActions.SUBJECT, auditLogActions.cloudEvents.putSettingsMine(req.user));
      // } else {
      //   logger.verbose(`We are not audit-logging here (${serverConfig.ENABLE_AUDIT_LOG}).`);
      // }

      let resultWithJobs;
      try {
        // Todo: remove eslint rule
        resultWithJobs = await SettingsController._ensureJobs(req.user, result); // eslint-disable-line no-unused-vars
      } catch (e) {
        logger.trace('Error running SettingsController._ensureJobs', e);
        let err = {
          message: 'We have an error saving jobs for each of the heartbeat events.',
          error: e
        };
        // Logger.error(err.message, e);
        return ExpressResult.error(res, err);
      }

      ExpressResult.ok(res, resultWithJobs);
    } catch (err) {
      ExpressResult.error(res, {err});
    }
  }

  /**
   * Makes sure that we have jobs for each of the heartbeat events
   * @private
   */
  static async _ensureJobs(user, settings) {

    console.log('_ensureJobs');

    let settingsWithJobs = Object.assign(settings); // eslint-disable-line no-unused-vars
    // Console.log('settingsWithJobs', settingsWithJobs);
    // console.log('settings', settings);

    try {

      return await Promise.all(events.map(async event => {

        // Console.log('setting', event);
        // console.log('res.user', user);

        const doc = {
          tenant_id: user.tenant_id,
          user_id: user.user_id,
          processor: 'nats.publish',
          subject: `strategy-heartbeat-${event}`,
          repeatPattern: '* * * * *', // Todo(AAA): this needs to come from the setting
          nats: {
            user_id: user.user_id
          }
        };

        if (settings[event].enabled === true) {

          console.log('enabled, do something');

          // Logger.trace(event);
          // logger.trace('Event is enabled', event[event]);
          // console.log('uri', `${serverConfig.JOBS_SERVICE_URI}/v1/jobs`);
          console.log('user', user); // <== continue here ...

          await superagent
            .post(`${serverConfig.JOBS_SERVICE_URI}/v1/jobs`)
            .set('x-access-token', user.token)
            .send(doc)
            .then(result => {
              console.log('result', result);
            })
            .catch(err => {
              console.log('error here', err);
            });

        }
        // Else {
        //
        //   // Todo(AAA): We need some feature to delete by
        //   // - tenant_id
        //   // - user_id
        //   // - processor
        //   // - subject
        //   // await superagent
        //   //   .delete(`${serverConfig.JOBS_SERVICE_URI}/v1/jobs`)
        //   //   .set('x-access-token', res.user.token)
        //   //
        // }

      }));
    } catch (e) {
      // Todo: Here we have to do some work ... standardizing how we handle errors ...
      logger.trace('Error here', e);
      throw new Error('Error ensuring the jobs');
    }
    // Return settingsWithJobs;
  }

  static async _createUpdateJob() {

  }

  static async _deleteJob() {

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
