<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      :class="[
        'fixed left-1/2 top-1/2 z-[60] w-full -translate-x-1/2 -translate-y-1/2',
        'rounded-2xl bg-white shadow-xl shadow-indigo-900/20 ring-1 ring-indigo-100',
        'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      ]"
      v-bind="{ ...forwarded, ...$attrs }"
      @pointer-down-outside="onPointerDownOutside"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>

<script setup lang="ts">
import {
  type DialogContentEmits,
  type DialogContentProps,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'radix-vue'

const props = withDefaults(defineProps<DialogContentProps & { className?: string }>(), {
  className: 'max-w-xl px-4 sm:px-0'
})

const emits = defineEmits<DialogContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)

const onPointerDownOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (target?.closest('[data-sonner-toaster]')) {
    event.preventDefault()
  }
}
</script>
