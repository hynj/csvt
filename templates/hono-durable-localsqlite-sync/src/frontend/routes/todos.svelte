<script lang="ts">
  import TodoApp from "$lib/TodoApp.svelte";
  import { checkSessionAndRedirect } from '../lib/session.svelte';
  import { onMount } from 'svelte';

  // Check session on page load
  onMount(() => {
    checkSessionAndRedirect();
  });
</script>

<div class="container mx-auto p-4">
  <TodoApp />
</div>