import bunyan from 'bunyan'
import fs from 'fs'

// eslint-disable-next-line no-unused-expressions
fs.existsSync('logs') || fs.mkdirSync('logs')

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
export const logger = bunyan.createLogger({
  name: 'test',
  streams: [
    {
      type: 'rotating-file',
      path: 'logs/info.log',
      period: '1d',
      level: 'info',
      count: 3,
    },
    {
      type: 'rotating-file',
      path: 'logs/error.log',
      period: '1d',
      level: 'error',
      count: 7,
    },
    {
      type: 'rotating-file',
      path: 'logs/trace.log',
      period: '1d',
      level: 'trace',
      count: 3,
    },
  ],
})
