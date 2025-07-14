<script lang="ts">
  import { onMount } from 'svelte';
  import { $persistedState, setReactiveKVStore } from './persisted-state.svelte.ts';

  // Mock ReactiveKV implementation for example
  // In your real app, import your actual ReactiveKV class
  class MockReactiveKV {
    private data = new Map<string, string>();

    get(key: string): string | null {
      return this.data.get(key) ?? null;
    }

    async set(key: string, value: string): Promise<void> {
      this.data.set(key, value);
      console.log(`ReactiveKV: Set ${key} = ${value}`);
    }

    async delete(key: string): Promise<void> {
      this.data.delete(key);
      console.log(`ReactiveKV: Deleted ${key}`);
    }
  }

  // Initialize ReactiveKV store
  let reactiveKV: MockReactiveKV;
  
  onMount(() => {
    reactiveKV = new MockReactiveKV();
    setReactiveKVStore(reactiveKV);
  });

  // Now you can use $persistedState with ReactiveKV
  const userProfile = $persistedState({
    key: 'user-profile',
    defaultValue: { name: '', email: '', age: 0 },
    storage: 'reactiveKV',
    debounceMs: 300
  });

  const appSettings = $persistedState({
    key: 'app-settings',
    defaultValue: { 
      notifications: true, 
      darkMode: false,
      autoSync: true 
    },
    storage: 'reactiveKV'
  });

  function updateProfile() {
    userProfile.current = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
  }

  function toggleDarkMode() {
    appSettings.current = {
      ...appSettings.current,
      darkMode: !appSettings.current.darkMode
    };
  }

  function toggleNotifications() {
    appSettings.current = {
      ...appSettings.current,
      notifications: !appSettings.current.notifications
    };
  }
</script>

<div class="p-6 space-y-6">
  <h2 class="text-2xl font-bold">$persistedState with ReactiveKV Integration</h2>
  
  <div class="bg-blue-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">User Profile (ReactiveKV)</h3>
    <div class="space-y-2">
      <p><strong>Name:</strong> {userProfile.current.name || 'Not set'}</p>
      <p><strong>Email:</strong> {userProfile.current.email || 'Not set'}</p>
      <p><strong>Age:</strong> {userProfile.current.age || 'Not set'}</p>
    </div>
    <button 
      onclick={updateProfile}
      class="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Update Profile
    </button>
  </div>

  <div class="bg-green-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">App Settings (ReactiveKV)</h3>
    <div class="space-y-2">
      <label class="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={appSettings.current.darkMode}
          onchange={toggleDarkMode}
        />
        <span>Dark Mode</span>
      </label>
      <label class="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={appSettings.current.notifications}
          onchange={toggleNotifications}
        />
        <span>Notifications</span>
      </label>
      <p><strong>Auto Sync:</strong> {appSettings.current.autoSync ? 'Enabled' : 'Disabled'}</p>
    </div>
  </div>

  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">Benefits of $persistedState</h3>
    <ul class="list-disc list-inside space-y-1 text-sm">
      <li>Clean, declarative API - just declare your state and it's automatically persisted</li>
      <li>Type-safe with full TypeScript support</li>
      <li>Multiple storage backends: localStorage, sessionStorage, ReactiveKV</li>
      <li>Automatic debouncing to prevent excessive writes</li>
      <li>Custom serialization for complex data types</li>
      <li>Seamless integration with Svelte 5 runes</li>
      <li>SSR-safe with proper window checks</li>
    </ul>
  </div>

  <div class="bg-yellow-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">Usage Comparison</h3>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <h4 class="font-semibold text-sm">Before (Manual ReactiveKV)</h4>
        <pre class="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`// Multiple steps required
const reactiveKV = new ReactiveKV();
await reactiveKV.initialize();

// Manual get/set operations
const value = reactiveKV.get('key');
await reactiveKV.set('key', newValue);

// Manual reactivity tracking
let state = $state(initialValue);
$effect(() => {
  reactiveKV.set('key', state);
});`}</code></pre>
      </div>
      <div>
        <h4 class="font-semibold text-sm">After ($persistedState)</h4>
        <pre class="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`// One line declaration
const state = $persistedState({
  key: 'key',
  defaultValue: initialValue,
  storage: 'reactiveKV'
});

// Use like normal reactive state
state.current = newValue;`}</code></pre>
      </div>
    </div>
  </div>
</div>