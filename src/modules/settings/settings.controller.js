const SettingsModel = require('./settings.model').Model;
const ExpressResult = require('express-result');
const logger = require('winster').instance();
const superagent = require('superagent');
const _ = require('lodash');

const serverConfig = require('./../../config/server-config');

// Todo: fix
const auditLogActions = require('./../../config/audit-log-actions'); // eslint-disable-line no-unused-vars

// Todo: fix
const auditLogService = require('sammler-io-audit-logs'); // eslint-disable-line no-unused-vars

const events = [
  {
    name: 'every_minute',
    interval: '* * * * *'
  },
  {
    name: 'every_two_minutes',
    interval: '*/2 * * * *'
  },
  {
    name: 'every_five_minutes',
    interval: '*/5 * * * *'
  },
  {
    name: 'every_ten_minutes',
    interval: '*/10 * * * *'
  },
  {
    name: 'every_hour',
    interval: '@hourly'
  },
  {
    name: 'every_day',
    interval: '@daily'
  },
  {
    name: 'every_week',
    interval: '@weekly'
  },
  {
    name: 'every_day',
    interval: '@monthly'
  }
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
      return ExpressResult.unauthorized(res, {message: 'The `user_id` of the resource does not match the id of the currently authenticated user.'});
    }

    // Todo: Re-enable audit-log
    // Audit Log
    // if (serverConfig.ENABLE_AUDIT_LOG === true) {
    //   auditLogService.log(auditLogActions.SUBJECT, auditLogActions.cloudEvents.putSettingsMine(req.user));
    // } else {
    //   logger.verbose(`We are not audit-logging here (${serverConfig.ENABLE_AUDIT_LOG}).`);
    // }

    try {
      // 1. See if there is a setting for the given user
      let existingSetting = await SettingsModel.findOne({user_id});

      console.log('1. existingSetting', existingSetting);


      // 2a. Merge the setting with the given argument
      // 2b. If we don't have one, insert it.
      if (existingSetting) {

        console.log('we have something, so we need to merge');
        existingSetting = _.merge(existingSetting.toObject(), req.body);

      } else {
        console.log('saving a new setting');

        let newSetting = new SettingsModel(req.body);
        existingSetting = await newSetting.save();
        existingSetting = existingSetting.toObject();
      }
      console.log('existingSetting', existingSetting);
      console.log('--');


      // 3. Save/Update/Delete the jobs
      console.log('Ensure jobs:');
      console.log('..');
      let resultWithJobs = await SettingsController._ensureJobs(req.user, existingSetting); // eslint-disable-line no-unused-vars

      // 4. Update settings with updated job_ids
      console.log('\n\n--');
      console.log('Before the final save', resultWithJobs);
      console.log('--');

      let result = await SettingsModel.findOneAndUpdate(
        {user_id: user_id},
        resultWithJobs,
        {
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );
      return ExpressResult.ok(res, result);

    } catch (err) {
      console.error(err);
      return ExpressResult.error(res, {err});
    }
  }

  /**
   * Makes sure that we have jobs for each of the heartbeat events
   * @private
   */
  static async _ensureJobs(user, settings) {

    let settingsWithJobs = Object.assign({}, settings); // eslint-disable-line no-unused-vars
    console.log('_ensureJobs', settingsWithJobs);

    try {

      await Promise.all(events.map(async event => {

        const doc = {
          tenant_id: user.tenant_id,
          user_id: user.user_id,
          processor: 'nats.publish',
          subject: `strategy-heartbeat_${event.name}`,
          repeatPattern: event.interval, // Todo(AAA): this needs to come from the setting
          nats: {
            user_id: user.user_id
          }
        };

        if (settings[event.name] && settings[event.name].enabled === true && settings[event.name].job_id) {

          // We have a job_id and the setting is enabled,
          // so we potentially have to update the job
          // ... even if we skip that for now
          console.log('We have to update ', event.name);

        } else if (settings[event.name] && settings[event.name].enabled === false && settings[event.name].job_id) {

          // We have a job-reference, but the settings is disabled.
          // Therefore we have to delete the job.

          console.info('Deleting job for event', event.name);

          // Todo(AAA): We need some feature to delete by
          // - tenant_id
          // - user_id
          // - processor
          // - subject
          await superagent
            .delete(`${serverConfig.JOBS_SERVICE_URI}/v1/jobs/by`)
            .query({job_id: settings[event.name].job_id})
            .set('x-access-token', user.token)
            .then(result => {
              console.log('Delete result', result);
              delete settingsWithJobs[event.name].job_id;
            })
            .catch(err => {
              console.error(`Error deleting job ${event.name}`, err);
              logger.error(`Error deleting job ${event.name}`, err);
            });
          console.log('-- delete done');

        } else if (settings[event.name] && settings[event.name].enabled === true && !settings[event.name].job_id) {

          // The setting is enable, but we don't have a job_id
          // So let's create a job
          console.log('Create job for event ', event.name);
          await superagent
            .post(`${serverConfig.JOBS_SERVICE_URI}/v1/jobs`)
            .set('x-access-token', user.token)
            .send(doc)
            .then(result => {
              settingsWithJobs[event.name].job_id = result.body.job_id;
            })
            .catch(err => {
              logger.error(`error with ${event.name}`, err);
            });

        } else if (settings[event.name] && settings[event.name].enabled === false && !settings[event.name].job_id) {
          console.log('nothing to do.');
        } else if (!settings[event.name]) { // eslint-disable-line no-negated-condition
          console.log('No event with name ', event.name);
        } else {
          console.log('Why are we here?');
        }

      }));
    } catch (e) {
      // Todo: Here we have to do some work ... standardizing how we handle errors ...
      logger.trace('[SettingsController._ensureJobs] Error here', e);
      console.error('[SettingsController._ensureJobs] Error here', e);
      throw e;
    }

    console.log('--');
    console.log('_ensureJobs returns', settingsWithJobs);

    return settingsWithJobs;
  }

  // Todo: This is an overall count, which should only work for admins/system
  // Todo: We need a count for a single user => which should always result into 0 or 1
  static count(req, res) {
    return SettingsModel
      .count()
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }
}

module.exports = SettingsController;
