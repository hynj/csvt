<script lang="ts">
  import { $persistedState, $simplePersistedState } from './persisted-state.svelte.ts';

  // Simple usage with localStorage
  const counter = $simplePersistedState('counter', 0);
  const username = $simplePersistedState('username', '');
  
  // Advanced usage with custom options
  const userPreferences = $persistedState({
    key: 'user-preferences',
    defaultValue: { theme: 'light', language: 'en' },
    storage: 'localStorage',
    debounceMs: 200
  });

  // Session storage example
  const tempData = $persistedState({
    key: 'temp-session-data',
    defaultValue: { timestamp: Date.now() },
    storage: 'sessionStorage'
  });

  // Custom serializer example for complex data
  const complexData = $persistedState({
    key: 'complex-data',
    defaultValue: new Map([['key1', 'value1']]),
    serializer: {
      serialize: (map: Map<string, string>) => JSON.stringify([...map]),
      deserialize: (str: string) => new Map(JSON.parse(str))
    }
  });

  function incrementCounter() {
    counter.current += 1;
  }

  function updateUsername(event: Event) {
    const target = event.target as HTMLInputElement;
    username.current = target.value;
  }

  function toggleTheme() {
    userPreferences.current = {
      ...userPreferences.current,
      theme: userPreferences.current.theme === 'light' ? 'dark' : 'light'
    };
  }
</script>

<div class="p-4 space-y-4">
  <h2 class="text-2xl font-bold">$persistedState Examples</h2>
  
  <!-- Simple counter -->
  <div class="border rounded p-4">
    <h3 class="text-lg font-semibold">Simple Counter (localStorage)</h3>
    <p>Counter: {counter.current}</p>
    <button 
      onclick={incrementCounter}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Increment
    </button>
  </div>

  <!-- Username input -->
  <div class="border rounded p-4">
    <h3 class="text-lg font-semibold">Username (localStorage)</h3>
    <input 
      type="text" 
      value={username.current}
      oninput={updateUsername}
      placeholder="Enter username"
      class="border rounded px-3 py-2 w-full"
    />
    <p class="mt-2">Stored username: {username.current}</p>
  </div>

  <!-- User preferences -->
  <div class="border rounded p-4">
    <h3 class="text-lg font-semibold">User Preferences (localStorage)</h3>
    <p>Theme: {userPreferences.current.theme}</p>
    <p>Language: {userPreferences.current.language}</p>
    <button 
      onclick={toggleTheme}
      class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      Toggle Theme
    </button>
  </div>

  <!-- Session data -->
  <div class="border rounded p-4">
    <h3 class="text-lg font-semibold">Session Data (sessionStorage)</h3>
    <p>Timestamp: {new Date(tempData.current.timestamp).toLocaleString()}</p>
    <button 
      onclick={() => tempData.current = { timestamp: Date.now() }}
      class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
    >
      Update Timestamp
    </button>
  </div>

  <!-- Complex data -->
  <div class="border rounded p-4">
    <h3 class="text-lg font-semibold">Complex Data (Custom Serializer)</h3>
    <p>Map size: {complexData.current.size}</p>
    <button 
      onclick={() => complexData.current.set(`key${Date.now()}`, `value${Date.now()}`)}
      class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Add Item to Map
    </button>
  </div>
</div>