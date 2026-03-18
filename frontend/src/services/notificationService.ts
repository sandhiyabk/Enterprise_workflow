import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

class NotificationService {
  private socket: Socket | null = null;

  async getNotifications(userId: string): Promise<Notification[]> {
    const response = await fetch(`${API_BASE_URL}/notifications/${userId}`);
    const data = await response.json();
    return data.notifications || [];
  }

  connectSocket(userId: string, onNotification: (notification: Notification) => void) {
    if (this.socket) return;

    this.socket = io(API_BASE_URL);

    this.socket.on('connect', () => {
      console.log('Connected to notification socket');
      this.socket?.emit('join', userId);
    });

    this.socket.on('notification', (notification: Notification) => {
      onNotification(notification);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification socket');
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const notificationService = new NotificationService();
