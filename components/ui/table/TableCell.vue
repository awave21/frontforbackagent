<template>
  <td
    :class="['px-4 py-3 text-sm text-slate-600', className]"
    v-bind="attrs"
  >
    <slot />
  </td>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

const props = defineProps<{
  className?: string
}>()

const attrs = useAttrs()
</script>
