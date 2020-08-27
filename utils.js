'use strict';

function mapLevelToName(level) {
  var res = '';
  switch (level) {
    case bunyan.TRACE:
      res = 'DEBUG';
      break;
    case bunyan.DEBUG:
      res = 'DEBUG';
      break;
    case bunyan.INFO:
      res = 'INFO';
      break;
    case bunyan.WARN:
      res = 'WARN';
      break;
    case bunyan.ERROR:
      res = 'ERROR';
      break;
    case bunyan.FATAL:
      res = 'FATAL';
      break;
  }
  return res;
}

function isObject(obj) {
  return obj === Object(obj);
}

exports.mapLevelToName = mapLevelToName;
exports.isObject = isObject;
