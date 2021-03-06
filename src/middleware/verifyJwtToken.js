const ExpressResult = require('express-result');
const jwt = require('jsonwebtoken');
const cfg = require('./../config/server-config');
const logger = require('winster').instance(); // eslint-disable-line no-unused-vars
const logr = require('./../lib/logr');

function verifyJwtToken(req, res, next) {
  const validationErrors = new ExpressResult.ValidationErrors();
  const token = (req.body && req.body.token) || req.headers['x-access-token'];
  if (!token) {
    validationErrors.add('Property <token> is missing. Put the <token> in either your body or use <x-access-token> in the Http-header.');
  }
  if (validationErrors.length > 0) {
    logr.trace('checkToken /w validationErrors', validationErrors);
    return ExpressResult.unauthorized(res, validationErrors);
  }

  try {
    const decoded = jwt.verify(token, cfg.JWT_SECRET);
    logr.trace('checkToken: valid token', decoded);
    req.user = decoded;
    req.user.token = token; // Todo: this needs to be re-evaluated ... basically this is just a hack for now ...
  } catch (err) {
    validationErrors.add('Invalid token');
    logr.error('checkToken: invalid token', err);
    logr.trace('token', token);
    return ExpressResult.unauthorized(res);
  }
  next();
}

module.exports = verifyJwtToken;
