const morgan = require('morgan');
const json = require('morgan-json');
const logr = require('./../../lib/logr');

const format = json(':method :url :status :res[content-length] bytes :response-time ms');

module.exports = {
  configure: app => {
    app.use(morgan(format, {stream: {write: message => logr.info(message)}}));
  }
};
