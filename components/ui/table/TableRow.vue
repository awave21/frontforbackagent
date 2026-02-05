<template>
  <tr
    :class="['border-b border-slate-100', className]"
    v-bind="attrs"
  >
    <slot />
  </tr>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

const props = defineProps<{
  className?: string
}>()

const attrs = useAttrs()
</script>
