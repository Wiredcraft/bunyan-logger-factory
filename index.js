'use strict';

const bsyslog = require('bunyan-syslog');
const bunyan = require('bunyan');

const getStream = config => {
  let stream;
  switch (config.logStream.toUpperCase()) {
    case 'FILE':
      stream = { path: config.logPath || './logs/app.log' };
      break;
    case 'SYSLOG':
      stream = {
        type: 'raw',
        stream: bsyslog.createBunyanStream({
          name: config.logName,
          host: config.logHost,
          port: parseInt(config.logPort, 10),
          facility: bsyslog.facility.local0,
          type: config.logProto
        })
      };
      break;
    case 'STDOUT':
    default:
      stream = { stream: process.stdout };
  }
  return stream;
};

const noStackErrSerializers = function(err) {
  return { message: err.message, name: err.name, code: err.code };
};

exports.init = function(config) {
  return bunyan.createLogger({
    name: config.logName,
    streams: [getStream(config)],
    serializers: {
      // customize err serializer coz buyan std err serializer doesn't work without err.stack
      err:
        process.env.NODE_ENV === 'production'
          ? noStackErrSerializers
          : bunyan.stdSerializers.err,
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
  });
};

exports.getStream = getStream;
