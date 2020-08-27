'use strict';

const chai = require('chai');
const path = require('path');
const LogDiffer = require('log-file-differ');
chai.should();
const loggerFactory = require('../index');
describe('custom fields', () => {
  it('should set static custom fields', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStream: 'FILE',
      logPath: filePath,
      transform: [
        {
          constant: {
            ipsum: 'xxx',
            lorem: 'yyy',
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    logger.info({ foo: 'bar' }, 'this is a message');
    setTimeout(() => {
      const diff = differ.diffLines();
      diff.length.should.equal(1);
      diff[0].should.include({
        foo: 'bar',
        msg: 'this is a message',
        ipsum: 'xxx',
        lorem: 'yyy',
      });
      done();
    }, 500);
  });
  it('should clone value from fields', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStream: 'FILE',
      logPath: filePath,
      transform: [
        {
          clone: {
            msg: 'message',
            time: 'timestamp',
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    logger.info({ foo: 'bar' }, 'this is another message');
    setTimeout(() => {
      const diff = differ.diffLines();
      diff.length.should.equal(1);
      diff[0].should.include({
        foo: 'bar',
        msg: 'this is another message',
        message: 'this is another message',
      });
      diff[0].time.should.be.equal(diff[0].timestamp);
      done();
    }, 500);
  });
  it('should clone value with deep path', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStream: 'FILE',
      logPath: filePath,
      transform: [
        {
          clone: {
            msg: 'root.leaf',
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    logger.info({ foo: 'bar' }, 'a message');
    setTimeout(() => {
      const diff = differ.diffLines();
      diff.length.should.equal(1);
      diff[0].should.include({
        foo: 'bar',
        msg: 'a message',
      });
      diff[0].root.should.be.eql({
        leaf: 'a message',
      });
      done();
    }, 500);
  });
  it('should map value', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const fn = (v) => {
      return v + v;
    };
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStream: 'FILE',
      logPath: filePath,
      transform: [
        {
          map: {
            foo: 'hello world',
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    logger.info({ foo: 'bar' }, 'test message');
    setTimeout(() => {
      const diff = differ.diffLines();
      diff.length.should.equal(1);
      diff[0].should.include({
        foo: 'hello world',
        msg: 'test message',
      });
      done();
    }, 500);
  });
  it('should map with function', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const fn = (v) => {
      return v + v;
    };
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStream: 'FILE',
      logPath: filePath,
      transform: [
        {
          map: {
            foo: fn,
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    logger.info({ foo: 'bar' }, 'test message');
    setTimeout(() => {
      const diff = differ.diffLines();
      diff.length.should.equal(1);
      diff[0].should.include({
        foo: 'barbar',
        msg: 'test message',
      });
      done();
    }, 500);
  });

  it('should be able to mix map and clone', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const fn = (v) => {
      return v + v;
    };
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStream: 'FILE',
      logPath: filePath,
      transform: [
        {
          clone: {
            foo: 'qux',
          },
        },
        {
          map: {
            qux: fn,
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    logger.info({ foo: 'bar' }, 'test message');
    setTimeout(() => {
      const diff = differ.diffLines();
      diff.length.should.equal(1);
      diff[0].should.include({
        foo: 'bar',
        qux: 'barbar',
        msg: 'test message',
      });
      done();
    }, 500);
  });
});