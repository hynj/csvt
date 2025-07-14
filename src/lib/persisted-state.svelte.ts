import { untrack } from 'svelte';

// Interface for ReactiveKV integration (can be imported from your existing ReactiveKV)
interface ReactiveKVStore {
  get(key: string): string | null;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

// Global ReactiveKV instance (to be set by your app)
let globalReactiveKV: ReactiveKVStore | null = null;

export function setReactiveKVStore(store: ReactiveKVStore) {
  globalReactiveKV = store;
}

export interface PersistedStateOptions<T> {
  key: string;
  defaultValue: T;
  storage?: 'localStorage' | 'sessionStorage' | 'reactiveKV';
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
  debounceMs?: number;
}

type PersistedStateValue<T> = {
  current: T;
};

const defaultSerializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse
};

export function $persistedState<T>(
  keyOrOptions: string | PersistedStateOptions<T>,
  defaultValue?: T
): PersistedStateValue<T> {
  let options: PersistedStateOptions<T>;
  
  if (typeof keyOrOptions === 'string') {
    if (defaultValue === undefined) {
      throw new Error('defaultValue is required when key is provided as string');
    }
    options = {
      key: keyOrOptions,
      defaultValue,
      storage: 'localStorage',
      serializer: defaultSerializer,
      debounceMs: 100
    };
  } else {
    options = {
      storage: 'localStorage',
      serializer: defaultSerializer,
      debounceMs: 100,
      ...keyOrOptions
    };
  }

  const { key, defaultValue: def, storage, serializer, debounceMs } = options;

  // Initialize value from storage
  let initialValue = def;
  
  if (typeof window !== 'undefined') {
    try {
      let storedValue: string | null = null;
      
      if (storage === 'localStorage' && window.localStorage) {
        storedValue = localStorage.getItem(key);
      } else if (storage === 'sessionStorage' && window.sessionStorage) {
        storedValue = sessionStorage.getItem(key);
      } else if (storage === 'reactiveKV') {
        if (globalReactiveKV) {
          storedValue = globalReactiveKV.get(key);
        } else {
          console.warn(`ReactiveKV store not set. Use setReactiveKVStore() to configure it.`);
        }
      }
      
      if (storedValue !== null) {
        initialValue = serializer!.deserialize(storedValue);
      }
    } catch (error) {
      console.warn(`Failed to load persisted state for key "${key}":`, error);
    }
  }

  // Create the reactive state
  let state = $state<T>(initialValue);
  let debounceTimeout: number | undefined;

  // Function to persist state to storage
  const persistState = async (value: T) => {
    if (typeof window === 'undefined') return;
    
    try {
      const serializedValue = serializer!.serialize(value);
      
      if (storage === 'localStorage' && window.localStorage) {
        localStorage.setItem(key, serializedValue);
      } else if (storage === 'sessionStorage' && window.sessionStorage) {
        sessionStorage.setItem(key, serializedValue);
      } else if (storage === 'reactiveKV') {
        if (globalReactiveKV) {
          await globalReactiveKV.set(key, serializedValue);
        } else {
          console.warn(`ReactiveKV store not set. Use setReactiveKVStore() to configure it.`);
        }
      }
    } catch (error) {
      console.warn(`Failed to persist state for key "${key}":`, error);
    }
  };

  // Debounced persist function
  const debouncedPersist = (value: T) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    debounceTimeout = setTimeout(() => {
      persistState(value);
    }, debounceMs);
  };

  // Track changes to state and persist them
  $effect(() => {
    const currentValue = state;
    untrack(() => {
      debouncedPersist(currentValue);
    });
  });

  return {
    get current() {
      return state;
    },
    set current(value: T) {
      state = value;
    }
  };
}

// Convenience function for simple use cases
export function $simplePersistedState<T>(key: string, defaultValue: T) {
  return $persistedState(key, defaultValue);
}