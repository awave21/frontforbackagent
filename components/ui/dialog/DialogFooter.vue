<template>
  <div :class="['flex items-center justify-end gap-3 pt-4', className]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ className?: string }>()
</script>
