// Import the singleton ReactiveKV instance directly
import { reactiveKV } from './reactive-kv.svelte';

// Cache of keys we know exist in storage
const knownStorageKeys = new Set<string>();
let isKeyMapInitialized = false;

// State instances cache to prevent re-initialization
const stateInstances = new Map<string, any>();

// Track if ReactiveKV is being initialized to prevent multiple concurrent inits
let isInitializing = false;

async function ensureReactiveKVInitialized() {
  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return;
  }

  if (reactiveKV.isInitialized) {
    return;
  }

  isInitializing = true;
  try {
    await reactiveKV.initialize();
    
    // Initialize key map after ReactiveKV is ready
    if (!isKeyMapInitialized) {
      const allKeys = reactiveKV.keys || [];
      knownStorageKeys.clear();
      allKeys.forEach((k: string) => knownStorageKeys.add(k));
      isKeyMapInitialized = true;
    }
  } finally {
    isInitializing = false;
  }
}

function createProxy<T extends Record<string, any>>(state: T, key: string): T {
  return new Proxy(state, {
    get(target: any, prop: string | symbol) {
      return target[prop];
    },

    set(target: any, prop: string | symbol, value: any) {
      if (typeof prop === 'string') {
        // Update reactive state immediately
        target[prop] = value;
        
        // Persist to ReactiveKV (async, but don't block)
        const storageKey = `${key}.${prop}`;
        ensureReactiveKVInitialized().then(() => {
          try {
            const serializedValue = JSON.stringify(value);
            reactiveKV.set(storageKey, serializedValue).catch((error: any) => {
              console.warn(`Failed to persist ${storageKey}:`, error);
            });
            knownStorageKeys.add(storageKey);
          } catch (error) {
            console.warn(`Failed to serialize value for ${storageKey}:`, error);
          }
        }).catch(error => {
          console.warn(`Failed to initialize ReactiveKV for ${storageKey}:`, error);
        });
        
        return true;
      }
      
      target[prop] = value;
      return true;
    }
  });
}

export function $persistedState<T extends Record<string, any>>(
  key: string,
  defaults: T
): T {
  // Return existing instance if already created
  if (stateInstances.has(key)) {
    return stateInstances.get(key);
  }

  // Start with defaults immediately (synchronous)
  const state = $state({ ...defaults }) as T;
  const proxy = createProxy(state, key);
  
  // Cache the instance
  stateInstances.set(key, proxy);

  // Load persisted values in background (asynchronous)
  ensureReactiveKVInitialized().then(() => {
    // Check if this state exists in storage
    const hasPersistedData = Array.from(knownStorageKeys)
      .some(storageKey => storageKey.startsWith(`${key}.`));

    if (!hasPersistedData) {
      // New state - persist defaults
      for (const [prop, value] of Object.entries(defaults)) {
        const storageKey = `${key}.${prop}`;
        try {
          const serializedValue = JSON.stringify(value);
          reactiveKV.set(storageKey, serializedValue).catch((error: any) => {
            console.warn(`Failed to persist default ${storageKey}:`, error);
          });
          knownStorageKeys.add(storageKey);
        } catch (error) {
          console.warn(`Failed to serialize default value for ${storageKey}:`, error);
        }
      }
    } else {
      // Load existing state from storage and update reactive state
      for (const [prop, defaultValue] of Object.entries(defaults)) {
        const storageKey = `${key}.${prop}`;
        const stored = reactiveKV.get(storageKey);
        
        if (stored !== null) {
          try {
            const parsedValue = JSON.parse(stored);
            // Update the reactive state with persisted value
            (state as any)[prop] = parsedValue;
          } catch (error) {
            console.warn(`Failed to parse stored value for ${storageKey}:`, error);
            // Keep default value on parse error
          }
        } else {
          // Property doesn't exist in storage, persist the default
          try {
            const serializedValue = JSON.stringify(defaultValue);
            reactiveKV.set(storageKey, serializedValue).catch((error: any) => {
              console.warn(`Failed to persist missing default ${storageKey}:`, error);
            });
            knownStorageKeys.add(storageKey);
          } catch (error) {
            console.warn(`Failed to serialize missing default for ${storageKey}:`, error);
          }
        }
      }
    }
  }).catch(error => {
    console.warn(`Failed to load persisted state for key "${key}":`, error);
  });
  
  return proxy;
}

// Helper function to clear a specific persisted state
export async function clearPersistedState(key: string) {
  await ensureReactiveKVInitialized();

  // Get all keys that start with our prefix
  const keysToDelete = Array.from(knownStorageKeys)
    .filter(k => k.startsWith(`${key}.`));
  
  // Delete all matching keys
  for (const keyToDelete of keysToDelete) {
    await reactiveKV.delete(keyToDelete);
    knownStorageKeys.delete(keyToDelete);
  }

  // Remove from cache
  stateInstances.delete(key);
}

// Helper function to get all stored keys for debugging
export function getPersistedStateKeys(): string[] {
  return Array.from(knownStorageKeys);
}

// Helper to reset everything (useful for testing)
export function resetPersistedState() {
  stateInstances.clear();
  knownStorageKeys.clear();
  isKeyMapInitialized = false;
}