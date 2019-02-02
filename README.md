
## Why I create this libray

From time to time, I found I have to create [Bunyan](https://www.npmjs.com/package/bunyan) instance with different streams(stdout/file/syslog) for different environments.


## How to use

```
const loggerFactory = require('bunyan-logger-factory');

const myLogger = loggerFactory.init({
  logName: 'my-logger-name',
  logStream: process.env.LOGSTREAM,
  logHost: process.env.LOGHOST,
  logPort: process.env.LOGPORT,
  logProto: process.env.LOGPROTO
});
```


## License

MIT
