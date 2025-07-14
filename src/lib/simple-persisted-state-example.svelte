<script lang="ts">
  import { $persistedState } from './simple-persisted-state.svelte.ts';

  // Simple counter state - automatically persisted
  const counter = $persistedState('counter', { count: 0 });

  // User profile state - shows multiple properties
  const userProfile = $persistedState('userProfile', {
    name: '',
    email: '',
    age: 0,
    preferences: {
      theme: 'light',
      notifications: true
    }
  });

  // Settings state
  const appSettings = $persistedState('appSettings', {
    autoSave: true,
    darkMode: false,
    language: 'en'
  });

  function incrementCounter() {
    counter.count += 1;
  }

  function decrementCounter() {
    counter.count -= 1;
  }

  function resetCounter() {
    counter.count = 0;
  }

  function updateProfile() {
    userProfile.name = 'John Doe';
    userProfile.email = 'john@example.com';
    userProfile.age = 30;
  }

  function toggleTheme() {
    userProfile.preferences = {
      ...userProfile.preferences,
      theme: userProfile.preferences.theme === 'light' ? 'dark' : 'light'
    };
  }

  function toggleDarkMode() {
    appSettings.darkMode = !appSettings.darkMode;
  }
</script>

<div class="p-6 space-y-6">
  <h2 class="text-2xl font-bold">Simple $persistedState Examples</h2>
  
  <div class="bg-blue-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">Counter (Simple State)</h3>
    <p class="text-3xl font-bold mb-4">{counter.count}</p>
    <div class="flex gap-2">
      <button 
        onclick={incrementCounter}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        +1
      </button>
      <button 
        onclick={decrementCounter}
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        -1
      </button>
      <button 
        onclick={resetCounter}
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
  </div>

  <div class="bg-green-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">User Profile (Complex State)</h3>
    <div class="space-y-2 mb-4">
      <p><strong>Name:</strong> {userProfile.name || 'Not set'}</p>
      <p><strong>Email:</strong> {userProfile.email || 'Not set'}</p>
      <p><strong>Age:</strong> {userProfile.age}</p>
      <p><strong>Theme:</strong> {userProfile.preferences.theme}</p>
      <p><strong>Notifications:</strong> {userProfile.preferences.notifications ? 'On' : 'Off'}</p>
    </div>
    <div class="flex gap-2">
      <button 
        onclick={updateProfile}
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Set Profile
      </button>
      <button 
        onclick={toggleTheme}
        class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
      >
        Toggle Theme
      </button>
    </div>
  </div>

  <div class="bg-yellow-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">App Settings</h3>
    <div class="space-y-2 mb-4">
      <label class="flex items-center space-x-2">
        <input 
          type="checkbox" 
          bind:checked={appSettings.autoSave}
        />
        <span>Auto Save</span>
      </label>
      <label class="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={appSettings.darkMode}
          onchange={toggleDarkMode}
        />
        <span>Dark Mode</span>
      </label>
      <p><strong>Language:</strong> {appSettings.language}</p>
    </div>
  </div>

  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">API Benefits</h3>
    <ul class="list-disc list-inside space-y-1 text-sm">
      <li><strong>Zero setup:</strong> Just declare your state and it's automatically persisted</li>
      <li><strong>Immediate use:</strong> No async/await required - starts with defaults, loads persisted values in background</li>
      <li><strong>Type safe:</strong> Full TypeScript support with inferred types</li>
      <li><strong>Automatic sync:</strong> Integrates with your existing ReactiveKV + SQLite + Durable Objects</li>
      <li><strong>Offline first:</strong> Works immediately, syncs when online</li>
      <li><strong>Instance caching:</strong> Same key returns the same reactive instance</li>
    </ul>
  </div>

  <div class="bg-indigo-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">Usage Comparison</h3>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <h4 class="font-semibold text-sm">Before (Manual ReactiveKV)</h4>
        <pre class="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`// Multiple steps required
await reactiveKV.initialize();

// Manual get/set operations
const count = reactiveKV.get('counter') || '0';
await reactiveKV.set('counter', '1');

// Manual reactivity
let counter = $state(parseInt(count));
$effect(() => {
  reactiveKV.set('counter', counter.toString());
});`}</code></pre>
      </div>
      <div>
        <h4 class="font-semibold text-sm">After ($persistedState)</h4>
        <pre class="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto"><code>{`// One line declaration
const counter = $persistedState('counter', {
  count: 0
});

// Use like normal reactive state
counter.count += 1;`}</code></pre>
      </div>
    </div>
  </div>
</div>