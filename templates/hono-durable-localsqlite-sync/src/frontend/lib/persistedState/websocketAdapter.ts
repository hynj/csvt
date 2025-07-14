import type { SyncAdapter, WebSocketMessage } from './types';

/**
 * WebSocket sync adapter for real-time synchronization
 * 
 * Manages WebSocket connections with automatic reconnection, message queueing,
 * and exponential backoff. Filters out messages from the same session to prevent
 * echo feedback loops.
 */
export class WebSocketSyncAdapter implements SyncAdapter {
  private ws: WebSocket | null = null;
  private wsConnected = false;
  private pendingMessages: WebSocketMessage[] = [];
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private statusHandlers: ((connected: boolean) => void)[] = [];
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_BASE_DELAY = 1000;
  private readonly RECONNECT_MAX_DELAY = 30000;

  constructor(private sessionId: string) {
    this.connect();
  }

  private async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.warn('[PersistedState] Max WebSocket reconnection attempts reached');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      
      console.log(`[PersistedState] Connecting to WebSocket (attempt ${this.reconnectAttempts + 1})`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[PersistedState] WebSocket connected');
        this.wsConnected = true;
        this.reconnectAttempts = 0;
        
        // Notify status handlers
        this.statusHandlers.forEach(handler => handler(true));
        
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        
        // Send pending messages
        while (this.pendingMessages.length > 0) {
          const message = this.pendingMessages.shift()!;
          this.send(message);
        }
        
        // Request initial sync
        this.send({
          type: 'sync',
          timestamp: Date.now(),
          sessionId: this.sessionId
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Ignore our own messages
          if (message.sessionId !== this.sessionId) {
            this.messageHandlers.forEach(handler => handler(message));
          }
        } catch (error) {
          console.error('[PersistedState] Error handling WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`[PersistedState] WebSocket disconnected (code: ${event.code})`);
        this.wsConnected = false;
        
        // Notify status handlers
        this.statusHandlers.forEach(handler => handler(false));
        
        // Attempt reconnection if not a normal close
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS && event.code !== 1000) {
          this.reconnectAttempts++;
          const delay = Math.min(
            this.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts - 1),
            this.RECONNECT_MAX_DELAY
          );
          
          console.log(`[PersistedState] Will attempt reconnect in ${delay}ms`);
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, delay) as any;
        }
      };

      this.ws.onerror = (error) => {
        console.error('[PersistedState] WebSocket error:', error);
      };

    } catch (error) {
      console.error('[PersistedState] Failed to connect WebSocket:', error);
      this.reconnectAttempts++;
      
      // Schedule reconnection
      const delay = Math.min(
        this.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts - 1),
        this.RECONNECT_MAX_DELAY
      );
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay) as any;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later delivery
      this.pendingMessages.push(message);
    }
  }

  onMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onStatusChange(handler: (connected: boolean) => void): void {
    this.statusHandlers.push(handler);
    // Immediately notify with current status
    handler(this.wsConnected);
  }

  isConnected(): boolean {
    return this.wsConnected;
  }

  destroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client destroyed');
      this.ws = null;
    }
    
    this.messageHandlers = [];
    this.statusHandlers = [];
    this.pendingMessages = [];
  }
}