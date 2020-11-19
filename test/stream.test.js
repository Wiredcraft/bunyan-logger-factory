'use strict';

const chai = require('chai');
chai.should();
const loggerFactory = require('../index');
describe('getStream', () => {
  it('should work with stdout', () => {
    const stm = loggerFactory.getStream({
      streamType: 'STDOUT'
    });
    stm.stream.should.be.eql(process.stdout);
  });
  it('logstream should support lowercase', () => {
    const stm = loggerFactory.getStream({
      streamType: 'stdout'
    });
    stm.stream.should.be.eql(process.stdout);
  });
  it('should work with file', () => {
    const stm = loggerFactory.getStream({
      streamType: 'FILE',
      streamPath: './foo/bar'
    });
    stm.should.be.eql({ path: './foo/bar' });
  });
  it('should work with syslog', () => {
    const stm = loggerFactory.getStream({
      streamType: 'SYSLOG',
      streamHost: 'localhost',
      streamPort: 514,
      streamProto: 'tcp'
    });
    stm.type.should.be.equal('raw');
  });
  it('should able to set name for syslog', () => {
    const stm = loggerFactory.getStream({
      streamName: 'foo',
      streamType: 'SYSLOG',
      streamHost: 'localhost',
      streamPort: 514,
      streamProto: 'tcp'
    });
    stm.type.should.be.equal('raw');
    stm.stream.name.should.be.equal('foo');
  });
  it('should able to set multi streams', () => {
    const logger = loggerFactory.init({
      logName: 'multiStream',
      logStreams: [
        {
          streamType: 'stdout'
        },
        {
          streamType: 'syslog',
          streamHost: 'localhost',
          streamPort: 514,
          streamProto: 'tcp'
        }
      ]
    });
    logger.streams.length.should.be.equal(2);
  });
});
