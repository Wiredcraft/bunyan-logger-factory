'use strict';

const bsyslog = require('bunyan-syslog');
const bunyan = require('bunyan');
const { isObject, mapLevelToName } = require('./utils');
// those fields can't be overridden
const coreFields = ['v', 'level', 'time'];

const getStream = (config) => {
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
          type: config.logProto,
        }),
      };
      break;
    case 'STDOUT':
    default:
      stream = { stream: process.stdout };
  }
  return stream;
};

const noStackErrSerializers = function (err) {
  return { message: err.message, name: err.name, code: err.code };
};
const reducer = (acc, cur) => {
  if (cur.constant) {
    return Object.assign({}, acc, cur.constant);
  }
  if (cur.clone && isObject(cur.clone)) {
    const kv = cur.clone;
    Object.keys(kv).map((k) => {
      const destKey = kv[k];
      // nested field, only support the 1st level
      if (destKey.indexOf('.') > -1) {
        const [first, second] = destKey.split('.');
        acc[first] = {};
        acc[first][second] = acc[k];
      } else {
        acc[destKey] = acc[k];
      }
    });
    return acc;
  }
  if (cur.map && isObject(cur.map)) {
    const kv = cur.map;
    Object.keys(kv).map((k) => {
      if (coreFields.includes(k)) {
        throw new Error(`${k} is core field, can not be overridden`);
      }
      const v = kv[k];
      if (k.indexOf('.') > -1) {
        const [first, second] = k.split('.');
        acc[first][second] =
          typeof v === 'function' ? v(acc[first][second]) : v;
      } else {
        acc[k] = typeof kv[k] === 'function' ? v(acc[k]) : v;
      }
    });
    return acc;
  }
  return acc;
};

const buildLogger = (logger, xform) => {
  logger._emit = (rec, noemit) => {
    const xformed = xform.reduce(reducer, rec);
    bunyan.prototype._emit.call(logger, xformed, noemit);
  };
  return logger;
};

exports.init = function (config) {
  let logger = bunyan.createLogger({
    name: config.logName,
    streams: [getStream(config)],
    serializers: {
      // customize err serializer coz buyan std err serializer doesn't work without err.stack
      err:
        process.env.NODE_ENV === 'production'
          ? noStackErrSerializers
          : bunyan.stdSerializers.err,
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res,
    },
  });

  if (config.transform && Array.isArray(config.transform)) {
    logger = buildLogger(logger, config.transform);
  }
  return logger;
};

exports.getStream = getStream;
exports.mapLevelToName = mapLevelToName;
