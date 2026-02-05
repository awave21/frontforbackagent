<template>
  <div :class="['overflow-hidden rounded-2xl border border-slate-200', wrapperClass]">
    <table
      class="min-w-full divide-y divide-slate-100 text-left"
      v-bind="attrs"
    >
      <slot />
    </table>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

const props = defineProps<{
  wrapperClass?: string
}>()

const attrs = useAttrs()
</script>
