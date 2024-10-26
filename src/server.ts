#!/usr/bin/env ts-node
import 'core-js/stable'
import dotenv from 'dotenv'
import http from 'http'
import 'regenerator-runtime/runtime'

import {Events} from './events'
import {App, SocketServer} from './index'
import {Routes} from './routes'

dotenv.config()

const {app} = new App(Routes)

const normalizePort = (val: string) => {
  const port = parseInt(val, 10)

  if (Number.isNaN(port)) {
    return val
  }

  if (port >= 0) {
    return port
  }

  return false
}

const port = normalizePort(process.env.PORT as string)
app.set('port', port)

/**
 * Create HTTP server.
 */
const server = http.createServer(app)

/**
 * Create Socket Server
 */
new SocketServer(server, Events)

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port || 8080}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)

    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)

    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
  const addr = server.address()
  const bind = typeof addr === 'string' ? `${addr}` : `${addr?.port || ''}`
  console.warn(
    `⚡️[server]: Server is running at http://localhost:${bind} in ${
      process.env.CURRENT_MODE || 'development'
    } environment`,
  )
}

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)
