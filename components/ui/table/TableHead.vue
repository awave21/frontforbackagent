<template>
  <th
    :class="['px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400', className]"
    scope="col"
    v-bind="attrs"
  >
    <slot />
  </th>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

const props = defineProps<{
  className?: string
}>()

const attrs = useAttrs()
</script>
