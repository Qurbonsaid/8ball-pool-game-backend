export class SocketException extends Error {
  public eventName: string

  public msg: string

  public constructor(eventName: string, msg: string) {
    super(msg)
    this.eventName = eventName
    this.msg = msg
  }
}
