import { setReactiveKVStore, $persistedState } from './persisted-state.svelte.ts';

/**
 * Setup helper for integrating $persistedState with your existing ReactiveKV
 * 
 * Usage in your app:
 * ```ts
 * import { setupPersistedStateWithReactiveKV } from '$lib/setup-persisted-state';
 * import { ReactiveKV } from './your-reactive-kv'; // your existing implementation
 * 
 * const reactiveKV = new ReactiveKV();
 * await reactiveKV.initialize();
 * setupPersistedStateWithReactiveKV(reactiveKV);
 * ```
 */
export function setupPersistedStateWithReactiveKV(reactiveKVInstance: any) {
  // Ensure the instance has the required methods
  if (
    typeof reactiveKVInstance.get !== 'function' ||
    typeof reactiveKVInstance.set !== 'function' ||
    typeof reactiveKVInstance.delete !== 'function'
  ) {
    throw new Error('ReactiveKV instance must have get, set, and delete methods');
  }

  setReactiveKVStore(reactiveKVInstance);
}

/**
 * Creates a factory function for $persistedState with ReactiveKV as default storage
 */
export function createReactiveKVPersistedState<T>(key: string, defaultValue: T) {
  return $persistedState({
    key,
    defaultValue,
    storage: 'reactiveKV' as const,
    debounceMs: 200 // Good default for network-synced storage
  });
}

// Re-export for convenience
export { $persistedState, $simplePersistedState } from './persisted-state.svelte.ts';