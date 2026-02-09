<template>
  <div :class="['flex flex-col space-y-1.5', className]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ className?: string }>()
</script>
