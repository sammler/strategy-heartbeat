const ExpressResult = require('express-result');
const logger = require('winster').instance();
const superagent = require('superagent');
const _ = require('lodash');

const serverConfig = require('./../../config/server-config');
const SettingsModel = require('./settings.model').Model;

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
    name: 'every_month',
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
    const {user_id, token} = req.user;

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
      let result = await SettingsModel.findOne({user_id});

      // 2a. Merge the setting with the given argument
      // 2b. If we don't have one, insert it.
      if (result) {

        result = _.merge(result.toObject(), req.body);

      } else {

        let newSetting = new SettingsModel(req.body);
        result = await newSetting.save();
        result = result.toObject();
      }

      let modifiedSetting = await SettingsController._syncJobs(req.user, token, result);
      let modifiedResult = await SettingsModel.findOneAndUpdate(
        {user_id},
        modifiedSetting,
        {
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );

      return ExpressResult.ok(res, modifiedResult);

    } catch (err) {
      logger.error(`[createUpdateMine] An error occurred and is thrown`, err);
      return ExpressResult.error(res, err);
    }
  }

  static async _syncJobs(user, token, setting) {

    // If settings.enabled === false, delete all settings and return the modified object
    // Otherwise sync ...
    if (setting.enabled) {
      await Promise.all(events.map(async event => {

        let syncJobResult = await SettingsController._syncJob(user, event, setting[event.name]);
        setting[event.name] = syncJobResult;

      }));

    } else {
      await SettingsController._deleteAllJobsByNatsChannel(token, 'strategy-heartbeat');
      events.forEach(event => {
        setting[event.name].enabled = false;
        delete setting[event.name].job_id;
      });
    }
    return setting;
  }

  static async _syncJob(user, event, settingForEvent) {

    // Create // Update
    // Just update all the time ...
    // We can optimize later on ...
    if (settingForEvent.enabled) {

      const doc = {
        tenant_id: user.tenant_id,
        user_id: user.user_id,
        processor: 'nats.publish',
        job_identifier: `strategy-heartbeat_${event.name}`,
        repeatPattern: event.interval, // Todo(AAA): this needs to come from the setting
        nats: {
          channel: 'strategy-heartbeat',
          data: {
            event: event.name,
            tenant_id: user.tenant_id,
            user_id: user.user_id
          }
        }
      };

      await superagent
        .post(`${serverConfig.JOBS_SERVICE_URI}/v1/jobs`)
        .set('x-access-token', user.token)
        .send(doc)
        .then(result => {
          settingForEvent.job_id = result.body.job_id;
        })
        .catch(err => {
          logger.error(`error with ${event.name}`, err);
          throw new Error(`error with ${event.name}: ${err.message}`);
        });
    }

    // Delete
    // In case the event is not enabled, always try to delete it
    // ... not optimal, but don't care right now, we can optimize this later on ...
    if (!settingForEvent.enabled) {
      await superagent
        .delete(`${serverConfig.JOBS_SERVICE_URI}/v1/jobs/job_identifier/strategy-heartbeat_${event.name}`)
        .set('x-access-token', user.token)
        .catch(err => {
          logger.error(`Error deleting job ${event.name}`, err);
          throw err;
        });
      delete settingForEvent.job_id;
    }

    // Return settingForEvent
    return settingForEvent;

  }

  static async _deleteAllJobsByNatsChannel(token, channel) {

    await superagent
      .delete(`${serverConfig.JOBS_SERVICE_URI}/v1/jobs/nats/channel/${channel}`)
      .set('x-access-token', token)
      .then(result => {
        logger.trace('delete by nats.channel', result.body);
      })
      .catch(err => {
        logger.error('delete by nats.channel => error', err);
        throw err;
      });
  }

  static async deleteMine(req, res) {
    const {user_id} = req.user;

    return SettingsModel
      .findOneAndDelete({
        user_id
      })
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
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
