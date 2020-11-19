
## Why I create this libray

From time to time, I found I have to create [Bunyan](https://www.npmjs.com/package/bunyan) instance with different streams(stdout/file/syslog) for different environments.


## How to use

```js
const loggerFactory = require('bunyan-logger-factory');

const myLogger = loggerFactory.init({
  logName: 'my-logger-name',
  logStreams: [
    {
      streamType: process.env.LOGSTREAM,
      streamHost: process.env.LOGHOST,
      streamPort: process.env.LOGPORT,
      streamProto: process.env.LOGPROTO,
    }
  ],
});
```

## Advanced usage

You can also set the transformation to the logger.

### constant
```js
const loggerFactory = require('bunyan-logger-factory');

const myLogger = loggerFactory.init({
  logName: 'my-logger-name',
  logStreams: [
    {
      streamType: process.env.LOGSTREAM,
      streamHost: process.env.LOGHOST,
      streamPort: process.env.LOGPORT,
      streamProto: process.env.LOGPROTO,
    }
  ],
  transform: [
    {
      constant: {
        ipsum: 'xxx',
      },
    },
  ],
});
```
This will add `ipsum: xxx` to each log created.

### clone
```js
const loggerFactory = require('bunyan-logger-factory');

const myLogger = loggerFactory.init({
  logName: 'my-logger-name',
  logStreams: [
    {
      streamType: process.env.LOGSTREAM,
      streamHost: process.env.LOGHOST,
      streamPort: process.env.LOGPORT,
      streamProto: process.env.LOGPROTO,
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
```
This will generate two extra fields `message` and `timestamp` which have exact same value as `msg` and `time**.

### map
```js
const loggerFactory = require('bunyan-logger-factory');
const fn = (v) => {return v + v;};

const myLogger = loggerFactory.init({
  logName: 'my-logger-name',
  logStreams: [
    {
      streamType: process.env.LOGSTREAM,
      streamHost: process.env.LOGHOST,
      streamPort: process.env.LOGPORT,
      streamProto: process.env.LOGPROTO,
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
```
This will populate the value of foo by calling the `fn` function.

### avoidChildTransform

By default, the logger.child will inherit the transformation you set on the parent if there is a `tranform` in the `init` function, you can set `avoidChildTransform` to true to prevent that behavior.

```js
const logger = loggerFactory.init({
  logName: 'test-logger',
  logStreams: [
    {
      streamType: 'FILE',
      streamPath: filePath,
    }
  ],
  avoidChildTransform: true, // the transform only applies on the current logger instance.
  transform: [
    {
      constant: {
        ipsum: 'xxx',
      },
    },
  ],
});

```

### multi streams

It's possible to add multiple stream configs in `logStreams`.

```js
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
```

## License

MIT
