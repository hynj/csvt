<script lang="ts">
  import { persistedState } from '$lib/persistedState';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Trash2, Plus, AlertCircle, Wifi, WifiOff } from '@lucide/svelte';

  interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
  }

  // Create persisted todo list with 200ms debounce
  const todos = persistedState<Todo[]>('todos', [], 200);
  
  let newTodoText = $state('');
  
  function addTodo(event?: Event) {
    event?.preventDefault();
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: newTodoText.trim(),
        completed: false,
        createdAt: Date.now()
      };
      
      todos.update(list => [...list, newTodo]);
      newTodoText = '';
    }
  }
  
  function toggleTodo(id: string) {
    todos.update(list => 
      list.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }
  
  function deleteTodo(id: string) {
    todos.update(list => list.filter(todo => todo.id !== id));
  }
  
  function clearCompleted() {
    todos.update(list => list.filter(todo => !todo.completed));
  }
  
  // Use derived state with runes
  const activeTodos = $derived(todos.value.filter(todo => !todo.completed));
  const completedTodos = $derived(todos.value.filter(todo => todo.completed));
  const totalTodos = $derived(todos.value.length);
</script>

<Card class="w-full max-w-2xl mx-auto">
  <CardHeader>
    <div class="flex items-center justify-between">
      <div>
        <CardTitle>Todo List</CardTitle>
        <CardDescription>
          Synced across all your devices in real-time
        </CardDescription>
      </div>
      
      <div class="flex items-center gap-2">
        {#if todos.isLoading}
          <Badge variant="secondary">Loading...</Badge>
        {/if}
        
        {#if todos.isSaving}
          <Badge variant="secondary" class="animate-pulse">Saving...</Badge>
        {/if}
        
        {#if todos.isOnline}
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
    {#if todos.error}
      <div class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
        <AlertCircle class="h-4 w-4" />
        <span>Error: {todos.error.message}</span>
      </div>
    {/if}
    
    <!-- Add new todo -->
    <form onsubmit={addTodo} class="flex gap-2">
      <Input
        type="text"
        bind:value={newTodoText}
        placeholder="What needs to be done?"
        disabled={todos.isLoading}
        class="flex-1"
        onkeydown={(e) => e.key === 'Enter' && addTodo(e)}
      />
      <Button type="submit" disabled={todos.isLoading || !newTodoText.trim()}>
        <Plus class="h-4 w-4 mr-1" />
        Add
      </Button>
    </form>
    
    <!-- Todo lists -->
    {#if totalTodos === 0 && !todos.isLoading}
      <div class="text-center py-8 text-muted-foreground">
        No todos yet. Add one above to get started!
      </div>
    {:else}
      <!-- Active todos -->
      {#if activeTodos.length > 0}
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Active ({activeTodos.length})
          </h3>
          {#each activeTodos as todo (todo.id)}
            <div class="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg group">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                disabled={todos.isLoading}
              />
              <span class="flex-1">{todo.text}</span>
              <Button
                variant="ghost"
                size="icon"
                onclick={() => deleteTodo(todo.id)}
                disabled={todos.isLoading}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          {/each}
        </div>
      {/if}
      
      <!-- Completed todos -->
      {#if completedTodos.length > 0}
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-muted-foreground">
              Completed ({completedTodos.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onclick={clearCompleted}
              disabled={todos.isLoading}
            >
              Clear completed
            </Button>
          </div>
          {#each completedTodos as todo (todo.id)}
            <div class="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg group opacity-60">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                disabled={todos.isLoading}
              />
              <span class="flex-1 line-through">{todo.text}</span>
              <Button
                variant="ghost"
                size="icon"
                onclick={() => deleteTodo(todo.id)}
                disabled={todos.isLoading}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
    
    <!-- Summary -->
    {#if totalTodos > 0}
      <div class="pt-4 border-t text-sm text-muted-foreground text-center">
        {activeTodos.length} {activeTodos.length === 1 ? 'item' : 'items'} left
      </div>
    {/if}
  </CardContent>
</Card>