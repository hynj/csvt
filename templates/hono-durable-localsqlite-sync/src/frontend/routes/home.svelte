<script lang="ts">
import svelteLogo from '../assets/svelte.svg'
  import Counter from '../lib/Counter.svelte'
import { Button } from "$lib/components/ui/button/index.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
import { Badge } from "$lib/components/ui/badge";
import { sessionStore, checkSessionAndRedirect } from '../lib/session.svelte';
import { onMount } from 'svelte';

  // Check session on page load
  onMount(() => {
    checkSessionAndRedirect();
  });
  
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  
  const logout = async () => {
    try {
      await sessionStore.destroySession();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
</script>

<main class="container mx-auto p-4">
  <div class="text-center mb-8">
    <h1 class="text-4xl font-bold mb-4">
      Welcome to {{projectTitle}}!
    </h1>
    <p class="text-lg text-muted-foreground mb-6">
      Offline-first Svelte app with Cloudflare Durable Objects sync
    </p>
    
    <div class="flex justify-center gap-4 mb-6">
      <Button onclick={() => navigate('/hello')} variant="outline">
        Counter Demo
      </Button>
      <Button onclick={() => navigate('/todos')}>
        Todo App
      </Button>
      <Button onclick={logout} variant="secondary" size="sm">
        Logout
      </Button>
    </div>
    
    {#if sessionStore.sessionId}
      <div class="mb-4">
        <Badge variant="default">Session: {sessionStore.sessionId.slice(0, 8)}...</Badge>
      </div>
    {/if}
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
        <CardDescription>What makes this template special</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="flex items-center gap-2">
          <Badge variant="secondary">Offline-First</Badge>
          <span class="text-sm">Works without internet</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="secondary">Real-time Sync</Badge>
          <span class="text-sm">Automatic synchronization</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="secondary">SQLite Storage</Badge>
          <span class="text-sm">Fast local database</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="secondary">Durable Objects</Badge>
          <span class="text-sm">Persistent cloud storage</span>
        </div>
      </CardContent>
    </Card>
    
    <Counter />
  </div>

  <div class="mt-8 text-center">
    <p class="text-sm text-muted-foreground">
      Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer" class="underline">SvelteKit</a>, the official Svelte app framework powered by Vite!
    </p>
  </div>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>

