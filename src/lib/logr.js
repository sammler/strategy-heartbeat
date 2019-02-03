const winston = require('winston');
const {createLogger, format, transports} = winston;
const {combine, timestamp, label, printf, colorize} = format; // eslint-disable-line no-unused-vars

const customLevels = {
  levels: {
    trace: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 0
  },
  colors: {
    trace: 'grey',
    debug: 'magenta',
    info: 'cyan',
    warn: 'yellow',
    error: 'red',
    fatal: 'red'
  }
};

winston.addColors(customLevels.colors);

let logger = createLogger({
  exitOnError: false,
  levels: customLevels.levels,
  transports: [
    // new transports.File({
    //   level: 'debug',
    //   filename: './all-logs.log',
    //   handleExceptions: true,
    //   json: true,
    //   maxsize: 5242880, // 5MB
    //   maxFiles: 5,
    //   format: combine(
    //     timestamp()
    //   )
    // }),
    new transports.Console({
      level: 'trace',
      handleExceptions: true,
      format: combine(
        colorize(),
        format.simple()
      )
    })
  ]
});

module.exports = logger;
