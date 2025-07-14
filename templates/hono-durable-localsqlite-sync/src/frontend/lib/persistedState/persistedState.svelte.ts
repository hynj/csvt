import type { PersistedStateOptions, PersistedStateReturn, WebSocketMessage } from './types';
import { SQLiteStorageAdapter } from './sqliteAdapter';
import { WebSocketSyncAdapter } from './websocketAdapter';

/**
 * Creates a persisted state with debouncing, local storage, and real-time sync
 */
export function createPersistedState<T>(
  key: string,
  initialValue: T,
  options: PersistedStateOptions = {}
): PersistedStateReturn<T> {
  // Generate a unique session ID for this instance
  const instanceSessionId = crypto.randomUUID();
  
  const {
    debounceMs = 300,
    storage = new SQLiteStorageAdapter(instanceSessionId),
    sync = new WebSocketSyncAdapter(instanceSessionId),
    onConflict = (local, remote) => remote // Default: last-write-wins (prefer remote)
  } = options;

  // Reactive state
  let value = $state(initialValue);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let error = $state<Error | null>(null);
  let isOnline = $state(sync.isConnected());
  
  // Internal state
  let saveTimeout: number | null = null;
  let isInitialized = false;
  let isUpdatingFromRemote = false;
  let lastSavedValue: string | null = null;

  // Load initial value from storage
  const loadInitialValue = async () => {
    try {
      const stored = await storage.getItem(key);
      if (stored !== null) {
        value = JSON.parse(stored);
        lastSavedValue = stored;
      } else {
        // Set initial value as last saved
        lastSavedValue = JSON.stringify(initialValue);
      }
    } catch (e) {
      error = e as Error;
      console.warn('[PersistedState] Failed to load from storage:', e);
    } finally {
      isLoading = false;
      // Mark as initialized after loading
      setTimeout(() => {
        isInitialized = true;
      }, 0);
    }
  };

  // Save function with timestamp
  const saveToStorage = async () => {
    try {
      const serialized = JSON.stringify(value);
      
      // Skip if value unchanged
      if (serialized === lastSavedValue) {
        return;
      }
      
      const timestamp = await storage.setItem(key, serialized);
      lastSavedValue = serialized;
      
      // Sync via WebSocket if connected
      sync.send({
        type: 'set',
        key,
        value: serialized,
        timestamp,
        sessionId: instanceSessionId
      });
      
      error = null;
    } catch (e) {
      error = e as Error;
      console.error('[PersistedState] Failed to save:', e);
      throw e;
    }
  };

  // Debounced save
  const debouncedSave = () => {
    // Only save if initialized and not from remote update
    if (!isLoading && isInitialized && !isUpdatingFromRemote) {
      if (saveTimeout) clearTimeout(saveTimeout);
      isSaving = true;
      
      saveTimeout = setTimeout(async () => {
        try {
          await saveToStorage();
        } finally {
          isSaving = false;
        }
      }, debounceMs) as any;
    }
  };

  // Handle remote updates
  sync.onMessage(async (message: WebSocketMessage) => {
    if (message.type === 'set' && message.key === key && message.value !== undefined) {
      try {
        const remoteValue = JSON.parse(message.value);
        const localData = await storage.getWithTimestamp(key);
        
        // Conflict resolution
        if (localData && message.timestamp && localData.updated_at > message.timestamp) {
          // Local is newer - skip remote update
          return;
        }
        
        // Apply remote update
        isUpdatingFromRemote = true;
        value = remoteValue;
        lastSavedValue = message.value;
        await storage.setItem(key, message.value, message.timestamp);
        
        // Reset flag after a microtask
        queueMicrotask(() => {
          isUpdatingFromRemote = false;
        });
        
      } catch (e) {
        console.error('[PersistedState] Error handling remote update:', e);
      }
    } else if (message.type === 'sync_response' && message.data) {
      // Handle full sync response
      const remoteValue = message.data[key];
      if (remoteValue !== undefined) {
        try {
          isUpdatingFromRemote = true;
          value = JSON.parse(remoteValue);
          lastSavedValue = remoteValue;
          await storage.setItem(key, remoteValue);
          
          queueMicrotask(() => {
            isUpdatingFromRemote = false;
          });
        } catch (e) {
          console.error('[PersistedState] Error handling sync response:', e);
        }
      }
    }
  });

  // Subscribe to connection status changes
  sync.onStatusChange((connected) => {
    isOnline = connected;
  });

  // Watch for changes and persist with debouncing
  $effect(() => {
    // Access the value to create a dependency
    const _ = value;
    debouncedSave();
  });

  // Initialize
  loadInitialValue();

  return {
    get value() { return value; },
    get isLoading() { return isLoading; },
    get isSaving() { return isSaving; },
    get error() { return error; },
    get isOnline() { return isOnline; },
    
    set: (newValue: T) => {
      value = newValue;
    },
    
    update: (updater: (value: T) => T) => {
      value = updater(value);
    },
    
    forceSave: async () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      isSaving = true;
      try {
        await saveToStorage();
      } finally {
        isSaving = false;
      }
    },
    
    refresh: async () => {
      isLoading = true;
      try {
        await loadInitialValue();
      } finally {
        isLoading = false;
      }
    }
  };
}

// Singleton storage and sync adapters for shared use
let sharedStorage: SQLiteStorageAdapter | null = null;
let sharedSync: WebSocketSyncAdapter | null = null;

// Use a stable session ID based on the browser session
const getSharedSessionId = () => {
  const stored = sessionStorage.getItem('persisted-state-session-id');
  if (stored) return stored;
  
  const newId = crypto.randomUUID();
  sessionStorage.setItem('persisted-state-session-id', newId);
  return newId;
};

/**
 * Convenience function that uses shared adapters for all persisted states
 * This ensures all states share the same WebSocket connection and SQLite database
 */
export function persistedState<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 300
): PersistedStateReturn<T> {
  const sharedSessionId = getSharedSessionId();
  
  // Initialize shared adapters on first use
  if (!sharedStorage) {
    sharedStorage = new SQLiteStorageAdapter(sharedSessionId);
  }
  if (!sharedSync) {
    sharedSync = new WebSocketSyncAdapter(sharedSessionId);
  }

  return createPersistedState(key, initialValue, {
    debounceMs,
    storage: sharedStorage,
    sync: sharedSync
  });
}