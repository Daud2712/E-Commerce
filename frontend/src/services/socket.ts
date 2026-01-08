import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

type UserRole = 'BUYER' | 'SELLER' | 'RIDER';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private role: UserRole | null = null;
  private isConnected: boolean = false;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('[SOCKET] Connected with ID:', this.socket?.id);
        this.isConnected = true;

        // Automatically rejoin room on connect/reconnect
        if (this.userId && this.role) {
          this.joinRoomByRole(this.userId, this.role);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('[SOCKET] Disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('[SOCKET] Connection error:', error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.role = null;
    this.isConnected = false;
  }

  private joinRoomByRole(userId: string, role: UserRole) {
    if (!this.socket || !this.isConnected) {
      console.warn('[SOCKET] Cannot join room - socket not connected');
      return;
    }

    switch (role) {
      case 'BUYER':
        console.log(`[SOCKET] Buyer ${userId} joining room: user-${userId}`);
        this.socket.emit('join', userId);
        break;
      case 'SELLER':
        console.log(`[SOCKET] Seller ${userId} joining room: seller-${userId}`);
        this.socket.emit('joinSeller', userId);
        break;
      case 'RIDER':
        console.log(`[SOCKET] Rider ${userId} joining room: rider-${userId}`);
        this.socket.emit('joinRider', userId);
        break;
    }
  }

  joinUser(userId: string) {
    this.userId = userId;
    this.role = 'BUYER';

    if (this.socket && this.isConnected) {
      this.joinRoomByRole(userId, 'BUYER');
    } else {
      console.log('[SOCKET] Waiting for connection to join buyer room...');
    }
  }

  joinSeller(sellerId: string) {
    this.userId = sellerId;
    this.role = 'SELLER';

    if (this.socket && this.isConnected) {
      this.joinRoomByRole(sellerId, 'SELLER');
    } else {
      console.log('[SOCKET] Waiting for connection to join seller room...');
    }
  }

  joinRider(riderId: string) {
    this.userId = riderId;
    this.role = 'RIDER';

    if (this.socket && this.isConnected) {
      this.joinRoomByRole(riderId, 'RIDER');
    } else {
      console.log('[SOCKET] Waiting for connection to join rider room...');
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
