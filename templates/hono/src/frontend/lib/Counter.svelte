<script lang="ts">
  import { client } from "./api";

  let count: number = $state(0);
  let message: string = $state("");
  let loading: boolean = $state(false);

  const increment = () => {
    count += 1;
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

  const testEcho = async () => {
    loading = true;
    try {
      const response = await client.echo.$post({
        json: { count, timestamp: Date.now() },
      });
      console.log(response);
      const data = await response.json();
      message = `Echo: ${JSON.stringify(data.echo)}`;
    } catch (error) {
      message = "Error: " + error;
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex flex-col gap-4 p-4 border rounded-lg">
  <div class="flex gap-2">
    <button 
      onclick={increment}
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      count is {count}
    </button>
  </div>
  
  <div class="flex gap-2">
    <button 
      onclick={testAPI}
      disabled={loading}
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Test Hello API'}
    </button>
    
    <button 
      onclick={testEcho}
      disabled={loading}
      class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Test Echo API'}
    </button>
  </div>
  
  {#if message}
    <div class="p-2 bg-gray-100 rounded text-sm">
      {message}
    </div>
  {/if}
</div>
