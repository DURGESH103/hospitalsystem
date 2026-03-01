import { io } from 'socket.io-client';
import { config } from '../config';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isReconnecting = false;
  }

  connect(token, onReconnect) {
    if (this.socket?.connected) return;

    this.socket = io(config.wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('WebSocket connected');
      }
      this.reconnectAttempts = 0;
      
      if (this.isReconnecting && onReconnect) {
        onReconnect();
      }
      this.isReconnecting = false;
    });
    
    this.socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('WebSocket disconnected:', reason);
      }
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('reconnect_attempt', () => {
      this.reconnectAttempts++;
      this.isReconnecting = true;
      if (process.env.NODE_ENV === 'development') {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      }
    });
    
    this.socket.on('error', (error) => console.error('WebSocket error:', error));

    // Register all existing listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
