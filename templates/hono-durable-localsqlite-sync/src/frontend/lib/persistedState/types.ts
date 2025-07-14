export interface WebSocketMessage {
  type: 'set' | 'delete' | 'sync' | 'sync_response' | 'sync_request' | 'sync_changes' | 'error'
  key?: string
  value?: string
  data?: Record<string, string>
  timestamp: number
  sessionId?: string
  message?: string
  since?: number
  changes?: Array<{ key: string; value: string; updated_at: number }>
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string, timestamp?: number): Promise<number>
  removeItem(key: string): Promise<void>
  getWithTimestamp(key: string): Promise<{ value: string; updated_at: number } | null>
}

export interface SyncAdapter {
  send(message: WebSocketMessage): void
  onMessage(handler: (message: WebSocketMessage) => void): void
  onStatusChange(handler: (connected: boolean) => void): void
  isConnected(): boolean
  destroy?: () => void
}

export interface PersistedStateOptions {
  debounceMs?: number
  storage?: StorageAdapter
  sync?: SyncAdapter
  onConflict?: (local: any, remote: any) => any
}

export interface PersistedStateReturn<T> {
  value: T
  isLoading: boolean
  isSaving: boolean
  error: Error | null
  isOnline: boolean
  set: (newValue: T) => void
  update: (updater: (value: T) => T) => void
  forceSave: () => Promise<void>
  refresh: () => Promise<void>
}