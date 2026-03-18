import { Server } from 'socket.io';
import { logger } from './logger.js';

class SocketManager {
  private io: Server | null = null;
  private static instance: SocketManager;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      socket.on('join', (userId: string) => {
        socket.join(userId);
        logger.info(`User ${userId} joined their notification room`);
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public emitNotification(userId: string, notification: any) {
    if (this.io) {
      this.io.to(userId).emit('notification', notification);
      logger.info(`Emitted real-time notification to user ${userId}`);
    } else {
      logger.warn('Socket.io not initialized. Cannot emit notification.');
    }
  }
}

export const socketManager = SocketManager.getInstance();
