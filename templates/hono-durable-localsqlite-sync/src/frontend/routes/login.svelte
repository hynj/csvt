<script lang="ts">
  import { sessionStore } from '../lib/session.svelte';
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { Loader2, LogIn, Database, Wifi } from "@lucide/svelte";
  import { onMount } from 'svelte';

  let loading = $state(false);
  let error = $state<string | null>(null);
  let message = $state<string | null>(null);

  const createSession = async () => {
    loading = true;
    error = null;
    message = null;
    
    try {
      const data = await sessionStore.createSession();
      message = data.message;
      
      // Navigate to home page after successful login
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 1000);
      
    } catch (e) {
      error = `Failed to create session: ${e}`;
      console.error('Login error:', e);
    } finally {
      loading = false;
    }
  };

  // Check for existing session on mount and redirect if already logged in
  onMount(async () => {
    const hasSession = await sessionStore.checkSession(true);
    if (hasSession) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-center items-center min-h-[60vh]">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="flex items-center justify-center gap-2">
          <Database class="h-5 w-5" />
          Session Setup
        </CardTitle>
        <CardDescription>
          Create a new session to start using offline sync
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-4">
        {#if error}
          <div class="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error}
          </div>
        {/if}
        
        {#if message}
          <div class="p-3 text-sm text-green-700 bg-green-50 rounded-lg">
            {message}
          </div>
        {/if}
        
        {#if sessionStore.sessionId}
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Badge variant="default" class="gap-1">
                <Wifi class="h-3 w-3" />
                Connected
              </Badge>
              <span class="text-sm text-muted-foreground">Session active</span>
            </div>
            <div class="p-2 bg-secondary/20 rounded text-xs font-mono break-all">
              {sessionStore.sessionId}
            </div>
          </div>
        {:else}
          <div class="text-center space-y-4">
            <div class="text-sm text-muted-foreground">
              You need a session to use offline sync features. Click below to create a new session.
            </div>
            
            <Button 
              onclick={createSession}
              disabled={loading}
              class="w-full"
            >
              {#if loading}
                <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                Creating Session...
              {:else}
                <LogIn class="h-4 w-4 mr-2" />
                Create Session
              {/if}
            </Button>
          </div>
        {/if}
        
        <div class="text-xs text-muted-foreground text-center">
          <p class="mb-2">
            <strong>What is this?</strong>
          </p>
          <p>
            This app uses Cloudflare Durable Objects for persistent storage. 
            Each session gets its own isolated storage space that syncs across devices.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</div>