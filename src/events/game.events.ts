import {Server, Socket} from 'socket.io'

import {SocketConstants} from '../constants/socket.constants'
import {GameStatus} from '../constants/status.constant'
import {GameModel} from '../models'
import {SocketException} from '../utils/exception/socket.exception'

export const startGame =
  (io: Server, socket: Socket, onlineUsers: any) =>
  async ({username, gameCode, displayName = username}: {username: string; gameCode: string; displayName: string}) => {
    try {
      onlineUsers[username] = socket.id
      socket.data = {username}
      const game =
        (await GameModel.findById(gameCode)) ||
        (await GameModel.create({
          _id: gameCode,
          player1: username,
          player1Name: displayName,
        }))
      if (game.status === GameStatus.PLAYING && game.player2 !== username) {
        throw new SocketException(SocketConstants.START_GAME, 'Match is already started!')
      }
      if (game.player1 === username) {
        socket.emit(SocketConstants.START_GAME, {
          status: true,
          msg: 'Game successfully created!',
          data: game,
        })
      } else {
        if (!onlineUsers[game.player1]) {
          await game.deleteOne()
          throw new SocketException(SocketConstants.JOIN_GAME, 'Game is closed!')
        }
        game.player2 = username
        game.player2Name = displayName
        game.status = GameStatus.PLAYING
        await game.save()
        io.to(onlineUsers[game.player1]).emit(SocketConstants.GAME_STARTED, {
          status: true,
          msg: 'Player2 successfully joined to game!',
          data: game,
        })
        socket.emit(SocketConstants.JOIN_GAME, {
          status: true,
          msg: 'Successfully joined to game!',
          data: game,
        })
      }
    } catch (err: any) {
      console.warn(err)
      socket.emit(SocketConstants.START_GAME, {status: false, msg: err.toString()})
    }
  }

export const changeGameTurn =
  (io: Server, socket: Socket, onlineUsers: any) => (opponent: string, currentTurn: number, fault: boolean) => {
    if (onlineUsers[opponent]) {
      io.to(onlineUsers[opponent]).emit(SocketConstants.GAME_CHANGE_TURN, currentTurn, fault)
    } else {
      socket.emit(SocketConstants.GAME_CHANGE_TURN, {status: false, msg: 'Opponent left the game!'})
    }
  }

export const updateStick = (io: Server, socket: Socket, onlineUsers: any) => (opponent: string, data: any) => {
  if (onlineUsers[opponent]) {
    io.to(onlineUsers[opponent]).emit(SocketConstants.UPDATE_STICK, data)
  } else {
    socket.emit(SocketConstants.UPDATE_STICK, {status: false, msg: 'Opponent left the game!'})
  }
}

export const updateBall = (io: Server, socket: Socket, onlineUsers: any) => (opponent: string, data: any) => {
  if (onlineUsers[opponent]) {
    io.to(onlineUsers[opponent]).emit(SocketConstants.UPDATE_BALL, data)
  } else {
    socket.emit(SocketConstants.UPDATE_BALL, {status: false, msg: 'Opponent left the game!'})
  }
}

export const updateHand = (io: Server, socket: Socket, onlineUsers: any) => (opponent: string, data: any) => {
  if (onlineUsers[opponent]) {
    io.to(onlineUsers[opponent]).emit(SocketConstants.UPDATE_HAND, data)
  } else {
    socket.emit(SocketConstants.UPDATE_HAND, {status: false, msg: 'Opponent left the game!'})
  }
}

export const updatePlayer = (io: Server, socket: Socket, onlineUsers: any) => (opponent: string, data: any) => {
  if (onlineUsers[opponent]) {
    io.to(onlineUsers[opponent]).emit(SocketConstants.UPDATE_PLAYERS, data)
  } else {
    socket.emit(SocketConstants.UPDATE_HAND, {status: false, msg: 'Opponent left the game!'})
  }
}

export const gameOver =
  (io: Server, socket: Socket, onlineUsers: any) => async (opponent: string, winner: string, gameCode: string) => {
    if (onlineUsers[opponent]) {
      const game = await GameModel.findById(gameCode)

      if (!game) {
        throw new SocketException(SocketConstants.GAME_OVER, 'Game is not found!')
      }

      if (process.env.APP_URL) {
        const res = await fetch(process.env.APP_URL, {
          method: 'POST',
          body: JSON.stringify({
            method: 'win',
            roomID: gameCode,
            winnerID: winner,
            timeStart: game.updatedAt,
          }),
        })

        if (!res.ok) {
          console.warn('Win request error:', await res.text())
        }
      }

      io.to(onlineUsers[opponent]).emit(SocketConstants.GAME_OVER, {
        winner,
        winnerName: game.player1 === winner ? game.player1Name : game.player2Name,
      })
      await game.deleteOne()
    } else {
      socket.emit(SocketConstants.GAME_OVER, {status: false, msg: 'Opponent left the game!'})
    }
  }

export const userOffline = (io: Server, socket: Socket, onlineUsers: any) => async () => {
  try {
    const {username} = socket.data
    if (username) {
      onlineUsers[username] = undefined
      const game = await GameModel.findOne({
        $or: [{player1: username}, {player2: username}],
        status: GameStatus.PLAYING,
      })
      if (!game) {
        throw new SocketException(SocketConstants.OFFLINE, 'Game is not found!')
      }

      const opponent = (game.player1 === username ? game.player2 : game.player1) as string

      if (process.env.APP_URL) {
        const res = await fetch(process.env.APP_URL, {
          method: 'POST',
          body: JSON.stringify({
            method: 'win',
            roomID: game._id,
            winnerID: opponent,
            timeStart: game.updatedAt,
          }),
        })

        if (!res.ok) {
          console.warn('Win request error:', await res.text())
        }
      }

      io.to(onlineUsers[opponent]).emit(SocketConstants.OFFLINE, {
        displayName: game.player1 === username ? game.player1Name : game.player2Name,
      })

      await game.deleteOne()
    }
  } catch (err: any) {
    console.warn(err)
    socket.emit(SocketConstants.OFFLINE, {status: false, msg: 'delete error'})
  }
}

export const updateData = (io: Server, socket: Socket, onlineUsers: any) => (to: string, data: any) => {
  try {
    io.to(onlineUsers[to]).emit(SocketConstants.UPDATE_DATA, data)
  } catch (err: any) {
    console.warn(err)
    socket.emit(SocketConstants.OFFLINE, {status: false, msg: 'Opponent is offline'})
  }
}
