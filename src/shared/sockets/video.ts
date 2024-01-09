import { Server, Socket } from 'socket.io';

export let socketIOVideoObject: Server;

export class SocketIOVideoHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOVideoObject = io;
  }

  public listen(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.io.on('connection', (socket: Socket) => {
      console.log('Video SocketIO Handler');
    });
  }
}
