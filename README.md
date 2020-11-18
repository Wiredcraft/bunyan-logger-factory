
## Why I create this libray

From time to time, I found I have to create [Bunyan](https://www.npmjs.com/package/bunyan) instance with different streams(stdout/file/syslog) for different environments.


## How to use

```js
const loggerFactory = require('bunyan-logger-factory');

const myLogger = loggerFactory.init({
  logName: 'my-logger-name',
  logStream: process.env.LOGSTREAM,
  logHost: process.env.LOGHOST,
  logPort: process.env.LOGPORT,
  logProto: process.env.LOGPROTO
});
```

## Advanced usage

You can also set the transformation to the logger.

### constant
```js
const loggerFactory = require('bunyan-logger-factory');

const myLogger = loggerFactory.init({
  logName: 'my-logger-name',
  logStream: process.env.LOGSTREAM,
  logHost: process.env.LOGHOST,
  logPort: process.env.LOGPORT,
  logProto: process.env.LOGPROTO,
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
  logStream: process.env.LOGSTREAM,
  logHost: process.env.LOGHOST,
  logPort: process.env.LOGPORT,
  logProto: process.env.LOGPROTO,
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
  logStream: process.env.LOGSTREAM,
  logHost: process.env.LOGHOST,
  logPort: process.env.LOGPORT,
  logProto: process.env.LOGPROTO,
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
  logStream: 'FILE',
  logPath: filePath,
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

To be compatible with previous versions. When there is `logStream` key in config, multi streams config key `logStreams` would be dismissed.

Using `logStreams` config key to set multi streams when `loggerFactory.init`.

```js
const logger = loggerFactory.init({
  logName: 'multiStream',
  logStreams: [
    {
      logStream: 'stdout'
    }, 
    {
      logName: 'multiStream',
      logStream: 'syslog',
      logHost: 'localhost',
      logPort: 514,
      logProto: 'tcp'
    }
  ]
});
```

## License

MIT
