const ExpressResult = require('express-result');

const HeartbeatsModel = require('./heartbeats.model').Model;

class HeartbeatsController {

  // /v1/heartbeats
  static async getMine(req, res) {
    let {user_id} = req.user;

    return HeartbeatsModel
      .find({user_id: user_id})
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

  static async countMine(req, res) {
    return HeartbeatsModel
      .countDocuments()
      .exec()
      .then(result => ExpressResult.ok(res, result))
      .catch(err => ExpressResult.error(res, err));
  }

  static async deleteMine(/* req, res */) {
    throw new Error('Not implemented');
  }

  static async postMine(req, res) {

    let heartbeatRaw = req.body;
    let validationErrors = [];

    // Common validations
    validationErrors = validationErrors.concat(HeartbeatsController._validateHeartbeat(heartbeatRaw));
    if (validationErrors.length > 0) {
      return ExpressResult.error(res, {message: 'Invalid input, see `validationErrors`.', validationErrors});
    }

    // Action/User validations
    validationErrors = validationErrors.concat(HeartbeatsController._validateHeartbeatAction(heartbeatRaw, req.user));
    if (validationErrors.length > 0) {
      return ExpressResult.error(res, {
        message: 'User is not to allowed to perform the action, see , see `validationErrors`.',
        validationErrors
      });
    }

    let model = new HeartbeatsModel(heartbeatRaw);
    try {
      let result = await model.save();
      return ExpressResult.ok(res, result);
    } catch (err) {
      return ExpressResult.error(res, err);
    }
  }

  static _validateHeartbeat(heartbeat) {
    let errors = [];
    let requiredArgs = [
      'user_id',
      'event',
      'publishedAt',
      'startedAt',
      'finishedAt'
    ];
    requiredArgs.forEach(arg => {
      if (!heartbeat[arg]) {
        errors.push(`Argument '${arg}' cannot be null or empty.`);
      }
    });

    return errors;
  }

  static _validateHeartbeatAction(heartbeat, user) {
    let errors = [];
    if (heartbeat.user_id !== user.user_id) {
      errors.push(`User '${heartbeat.user_id}' is not allowed to perform action on behalf of user '${user.user_id}'`);
    }
    return errors;
  }

}

module.exports = HeartbeatsController;
