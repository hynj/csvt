<script lang="ts">
  let count: number = $state(0)
  const increment = () => {
    count += 1
  }
  const decrement = () => {
    count -= 1
  }
</script>

<div class="flex gap-4 items-center">
  <button onclick={decrement} class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
    -
  </button>
  <span class="text-xl font-semibold min-w-[3rem] text-center">
    {count}
  </span>
  <button onclick={increment} class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
    +
  </button>
</div>
