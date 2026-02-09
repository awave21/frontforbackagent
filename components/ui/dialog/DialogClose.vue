<template>
  <DialogClose
    :class="[
      'absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-indigo-400',
      className
    ]"
  >
    <slot>
      <X class="h-5 w-5" />
    </slot>
    <span class="sr-only">Закрыть</span>
  </DialogClose>
</template>

<script setup lang="ts">
import { DialogClose } from 'radix-vue'
import { X } from 'lucide-vue-next'

defineProps<{ className?: string }>()
</script>
