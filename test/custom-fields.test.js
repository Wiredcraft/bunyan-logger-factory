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
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
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
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
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
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
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
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
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
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
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
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
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
  it('should be able to use mapLevelToName', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
      transform: [
        {
          clone: {
            level: 'logLevel',
          },
        },
        {
          map: {
            logLevel: loggerFactory.mapLevelToName,
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
      diff[0].logLevel.should.equal('INFO');
      done();
    }, 1000);
  });
  it('should throw if overriding the core fields', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
      transform: [
        {
          map: {
            level: loggerFactory.mapLevelToName,
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    try {
      logger.info({ foo: 'bar' }, 'test message');
    } catch (err) {
      err.message.should.contain('core field');
      done();
    }
  });
  it('should be able to use deep clone and map', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const fn = (v) => {
      return v + v;
    };
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
      transform: [
        {
          clone: {
            foo: 'qux.quz',
          },
        },
        {
          map: {
            'qux.quz': fn,
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
        msg: 'test message',
      });
      diff[0].qux.should.eql({
        quz: 'barbar',
      });

      done();
    }, 500);
  });
  it('should be able to inherit for childLogger', (done) => {
    const filePath = path.resolve(__dirname, '../logs/app.log');
    const logger = loggerFactory.init({
      logName: 'test-logger',
      logStreams: [
        {
          streamType: 'FILE',
          streamPath: filePath,
        }
      ],
      avoidChildTransform: false,
      transform: [
        {
          constant: {
            ipsum: 'xxx',
          },
        },
      ],
    });
    const differ = new LogDiffer(filePath);
    differ.setupBaseline();
    const child = logger.child({ qux: 111 });
    child.info({ foo: 'bar' }, 'this is a message');
    setTimeout(() => {
      const diff = differ.diffLines();
      diff.length.should.equal(1);
      diff[0].should.include({
        foo: 'bar',
        msg: 'this is a message',
        ipsum: 'xxx',
      });
      done();
    }, 500);
  });
});
