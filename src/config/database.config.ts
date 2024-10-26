import {connect} from 'mongoose'

import {Mode} from '../constants/mode.constant'

export const CONNECT_DB = async () => {
  try {
    const DB_URL = process.env.CURRENT_MODE === Mode.DEVELOPMENT ? process.env.DB_LOCAL : process.env.DB_PROD
    await connect(DB_URL as string)
  } catch (err) {
    console.warn(err)
  }
}
