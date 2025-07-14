<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from './ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
  import { Badge } from './ui/badge';
  import { Download, RefreshCw, X } from '@lucide/svelte';
  import { canInstallPWA, installPWA, isPWA } from '../sw-registration';

  let showInstallPrompt = $state(false);
  let isStandalone = $state(false);
  let installing = $state(false);

  onMount(async () => {
    // Check if running as PWA
    isStandalone = isPWA();
    
    // Check if can be installed
    if (!isStandalone) {
      showInstallPrompt = await canInstallPWA();
    }
  });

  const handleInstall = async () => {
    installing = true;
    try {
      const installed = await installPWA();
      if (installed) {
        showInstallPrompt = false;
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      installing = false;
    }
  };

  const closePrompt = () => {
    showInstallPrompt = false;
  };
</script>

{#if showInstallPrompt && !isStandalone}
  <div class="fixed bottom-4 right-4 z-50 max-w-sm">
    <Card class="border-primary/20 bg-background/95 backdrop-blur">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Download class="h-4 w-4 text-primary" />
            <CardTitle class="text-sm">Install App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onclick={closePrompt}
            class="h-6 w-6"
          >
            <X class="h-3 w-3" />
          </Button>
        </div>
        <CardDescription class="text-xs">
          Install this app for offline access and better performance
        </CardDescription>
      </CardHeader>
      
      <CardContent class="pt-0">
        <div class="flex gap-2">
          <Button
            size="sm"
            onclick={handleInstall}
            disabled={installing}
            class="flex-1"
          >
            {#if installing}
              <RefreshCw class="h-3 w-3 mr-1 animate-spin" />
              Installing...
            {:else}
              <Download class="h-3 w-3 mr-1" />
              Install
            {/if}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
{/if}

{#if isStandalone}
  <div class="fixed top-4 right-4 z-50">
    <Badge variant="secondary" class="gap-1">
      <Download class="h-3 w-3" />
      PWA Mode
    </Badge>
  </div>
{/if}