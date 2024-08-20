import { Server } from "socket.io";

export class IoServer {
  private static _instance: Server;

  static set io(io: Server) {
    this._instance = io;
  }

  static get io() {
    return this._instance;
  }
}
