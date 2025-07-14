<script lang="ts">
  import { client } from "./api.js";
  import { persistedState } from "$lib/persistedState";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Wifi, WifiOff, Plus, Minus, RotateCcw, Server, AlertCircle } from "@lucide/svelte";

  // Create persisted counter state with 200ms debounce
  const counter = persistedState<number>('counter', 0, 200);
  
  let message: string = $state("");
  let loading: boolean = $state(false);

  const increment = async () => {
    counter.update(n => n + 1);
    message = `Incremented to ${counter.value} (auto-syncing...)`;
  };

  const decrement = async () => {
    counter.update(n => Math.max(0, n - 1));
    message = `Decremented to ${counter.value} (auto-syncing...)`;
  };

  const reset = async () => {
    counter.set(0);
    message = `Reset to 0 (auto-syncing...)`;
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

  const forceSync = async () => {
    loading = true;
    try {
      await counter.forceSave();
      message = "Manual sync completed!";
    } catch (error) {
      message = "Sync error: " + error;
    } finally {
      loading = false;
    }
  };
</script>

<Card class="w-full max-w-md mx-auto">
  <CardHeader>
    <div class="flex items-center justify-between">
      <div>
        <CardTitle>Persisted Counter</CardTitle>
        <CardDescription>
          Offline-first with real-time sync
        </CardDescription>
      </div>
      
      <div class="flex items-center gap-2">
        {#if counter.isLoading}
          <Badge variant="secondary">Loading...</Badge>
        {/if}
        
        {#if counter.isSaving}
          <Badge variant="secondary" class="animate-pulse">Saving...</Badge>
        {/if}
        
        {#if counter.isOnline}
          <Badge variant="default" class="gap-1">
            <Wifi class="h-3 w-3" />
            Online
          </Badge>
        {:else}
          <Badge variant="destructive" class="gap-1">
            <WifiOff class="h-3 w-3" />
            Offline
          </Badge>
        {/if}
      </div>
    </div>
  </CardHeader>

  <CardContent class="space-y-4">
    {#if counter.error}
      <div class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
        <AlertCircle class="h-4 w-4" />
        <span>Error: {counter.error.message}</span>
      </div>
    {/if}

    <div class="text-center">
      <div class="text-4xl font-bold mb-4">{counter.value}</div>
      
      <div class="flex gap-2 justify-center">
        <Button 
          onclick={increment}
          disabled={counter.isLoading}
          size="sm"
        >
          <Plus class="h-4 w-4 mr-1" />
          Increment
        </Button>
        
        <Button 
          onclick={decrement}
          disabled={counter.isLoading}
          variant="destructive"
          size="sm"
        >
          <Minus class="h-4 w-4 mr-1" />
          Decrement
        </Button>
        
        <Button 
          onclick={reset}
          disabled={counter.isLoading}
          variant="outline"
          size="sm"
        >
          <RotateCcw class="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
    
    <div class="flex gap-2 justify-center">
      <Button 
        onclick={testAPI}
        disabled={loading}
        variant="secondary"
        size="sm"
      >
        <Server class="h-4 w-4 mr-1" />
        {loading ? 'Testing...' : 'Test API'}
      </Button>
      
      <Button 
        onclick={forceSync}
        disabled={loading || counter.isLoading}
        variant="secondary"
        size="sm"
      >
        {loading ? 'Syncing...' : 'Force Sync'}
      </Button>
    </div>
    
    {#if message}
      <div class="p-3 bg-secondary/20 rounded-lg text-sm">
        {message}
      </div>
    {/if}
    
    <div class="text-xs text-muted-foreground text-center">
      This counter uses offline-first architecture with local SQLite storage that syncs with 
      Cloudflare Durable Objects. Updates work instantly offline and sync automatically when online.
    </div>
  </CardContent>
</Card>