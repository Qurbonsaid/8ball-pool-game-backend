import {Server, Socket} from 'socket.io'

import {SocketConstants} from '../constants/socket.constants'
import {
  changeGameTurn,
  gameOver,
  startGame,
  updateBall,
  updateData,
  updateHand,
  updatePlayer,
  updateStick,
  userOffline,
} from './game.events'

export interface SocketEvent {
  eventName: string | symbol
  listener: (io: Server, socket: Socket, chatUsers: {[x: string]: string | undefined}) => (...args: any[]) => void
}

export const Events: SocketEvent[] = [
  {eventName: SocketConstants.START_GAME, listener: startGame},
  {eventName: SocketConstants.GAME_CHANGE_TURN, listener: changeGameTurn},
  {eventName: SocketConstants.UPDATE_STICK, listener: updateStick},
  {eventName: SocketConstants.UPDATE_BALL, listener: updateBall},
  {eventName: SocketConstants.UPDATE_HAND, listener: updateHand},
  {eventName: SocketConstants.UPDATE_PLAYERS, listener: updatePlayer},
  {eventName: SocketConstants.GAME_OVER, listener: gameOver},
  {eventName: SocketConstants.DISCONNECT, listener: userOffline},
  {eventName: SocketConstants.UPDATE_DATA, listener: updateData},
]
