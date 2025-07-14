<script lang="ts">
  import { client } from "./api";
  import { onMount } from "svelte";

  let count: number = $state(0);
  let sessionId: string = $state("");
  let message: string = $state("");
  let loading: boolean = $state(false);

  // Load initial counter value on mount
  onMount(async () => {
    await loadCounterValue();
  });

  const loadCounterValue = async () => {
    loading = true;
    try {
      const response = await client.counter.$get();
      const data = await response.json();
      count = data.value;
      sessionId = data.sessionId;
      message = `Loaded counter from session: ${sessionId.slice(0, 8)}...`;
    } catch (error) {
      message = "Error loading counter: " + error;
    } finally {
      loading = false;
    }
  };

  const increment = async () => {
    loading = true;
    try {
      const response = await client.counter.increment.$post();
      const data = await response.json();
      count = data.value;
      sessionId = data.sessionId;
      message = `Incremented! Session: ${sessionId.slice(0, 8)}...`;
    } catch (error) {
      message = "Error: " + error;
    } finally {
      loading = false;
    }
  };

  const decrement = async () => {
    loading = true;
    try {
      const response = await client.counter.decrement.$post();
      const data = await response.json();
      count = data.value;
      sessionId = data.sessionId;
      message = `Decremented! Session: ${sessionId.slice(0, 8)}...`;
    } catch (error) {
      message = "Error: " + error;
    } finally {
      loading = false;
    }
  };

  const reset = async () => {
    loading = true;
    try {
      const response = await client.counter.reset.$post();
      const data = await response.json();
      count = data.value;
      sessionId = data.sessionId;
      message = `Reset! Session: ${sessionId.slice(0, 8)}...`;
    } catch (error) {
      message = "Error: " + error;
    } finally {
      loading = false;
    }
  };

  const testAPI = async () => {
    loading = true;
    try {
      const response = await client.hello.$get();
      const data = await response.json();
      message = data.message;
    } catch (error) {
      message = "Error: " + error;
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex flex-col gap-4 p-4 border rounded-lg">
  <div class="text-center">
    <h3 class="text-lg font-semibold mb-2">Stateful Counter (Durable Objects)</h3>
    <div class="text-3xl font-bold mb-4">{count}</div>
  </div>
  
  <div class="flex gap-2 justify-center">
    <button 
      onclick={increment}
      disabled={loading}
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? 'Loading...' : '+'}
    </button>
    
    <button 
      onclick={decrement}
      disabled={loading}
      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
    >
      {loading ? 'Loading...' : '-'}
    </button>
    
    <button 
      onclick={reset}
      disabled={loading}
      class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Reset'}
    </button>
  </div>
  
  <div class="flex gap-2 justify-center">
    <button 
      onclick={testAPI}
      disabled={loading}
      class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Test Hello API'}
    </button>
  </div>
  
  {#if message}
    <div class="p-2 bg-gray-100 rounded text-sm">
      {message}
    </div>
  {/if}
  
  <div class="text-xs text-gray-500 text-center">
    This counter persists across browser sessions using Durable Objects with SQL storage backend.
    Each browser gets its own counter instance based on session cookies.
  </div>
</div>
