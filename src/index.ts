import cookieParser from 'cookie-parser'
import cors from 'cors'
import fs from 'fs'
import helmet from 'helmet'
import contentSecurityPolicy from 'helmet-csp'
import http from 'http'
import {ReasonPhrases, StatusCodes} from 'http-status-codes'
import path from 'path'
import {Server, Socket} from 'socket.io'

import express, {Application, NextFunction, Request, Response} from 'express'

import {CONNECT_DB} from './config/database.config'
import {ConstantAPI} from './constants/api.constant'
import {Controller} from './controllers/types.d'
import {SocketEvent} from './events'
import {errorMiddleware} from './middlewares/error.middleware'
import {HttpException} from './utils/exception/http.exception'

export class App {
  public app: Application

  public constructor(controllers: Controller[]) {
    this.app = express()
    CONNECT_DB()
      .then(() => console.warn('Connected DB'))
      .catch(err => {
        console.warn(err)
      })

    this.initializeConfig()
    this.initializeRoutes()
    this.initializeControllers(controllers)
    this.initializeErrorHandling()
  }

  private initializeConfig(): void {
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(express.urlencoded({extended: true}))
    this.app.use(
      contentSecurityPolicy({
        useDefaults: true,
        directives: {
          defaultSrc: 'self',
          scriptSrc: 'self',
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
          contentSecurityPolicy: "font-src 'self' data:",
          connectSrc: 'self',
        },
        reportOnly: false,
      }),
    )
    this.app.use(helmet())
    this.app.use(cookieParser())
    if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public', {recursive: true})
    }
    this.app.use(express.static(path.join(__dirname, '../public')))
  }

  private initializeRoutes(): void {
    this.app.get(ConstantAPI.ROOT, (req: Request, res: Response, next: NextFunction) => {
      try {
        return res.status(StatusCodes.OK).json({
          status: {
            code: StatusCodes.OK,
            msg: StatusCodes.OK,
          },
          msg: ReasonPhrases.OK,
        })
      } catch (err: any) {
        return next(
          new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR, err.message),
        )
      }
    })
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller: Controller) => {
      this.app.use(ConstantAPI.API + controller.path, controller.router)
    })
    this.app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const err = {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        statusMsg: ReasonPhrases.NOT_FOUND,
        msg: ReasonPhrases.NOT_FOUND,
      }
      next(err)
    })
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware)
  }
}

export class SocketServer {
  public io: Server
  public onlineUsers: {[x: string]: string | undefined} = {}

  public constructor(httpServer: http.Server, events: SocketEvent[]) {
    this.io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => {
          callback(null, origin)
        },
        methods: ['GET', 'POST'],
      },
      pingInterval: 3000,
      pingTimeout: 8000,
    })
    this.initializeEvents(events)
  }

  private initializeEvents(events: SocketEvent[]) {
    this.io.on('connection', (socket: Socket) => {
      events.forEach(event => socket.addListener(event.eventName, event.listener(this.io, socket, this.onlineUsers)))
      // socket.on('disconnect', () => {
      //   console.log(socket.data)

      //   console.log('disconnected2!')
      // })
    })
  }
}
