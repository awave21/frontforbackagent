<template>
  <div
    ref="scrollContainerRef"
    class="flex-1 overflow-y-auto px-4 py-4"
    @scroll="handleScroll"
  >
    <!-- Load More Indicator -->
    <div v-if="hasMore && !isLoading" class="flex justify-center py-3">
      <button
        @click="$emit('load-more')"
        class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Загрузить ранние сообщения
      </button>
    </div>

    <!-- Loading indicator (top) -->
    <div v-if="isLoading && messages.length > 0" class="flex justify-center py-3">
      <Loader2 class="w-5 h-5 text-indigo-600 animate-spin" />
    </div>

    <!-- Empty State -->
    <div
      v-if="!isLoading && messages.length === 0"
      class="h-full flex items-center justify-center"
    >
      <DialogsEmptyState type="no-messages" />
    </div>

    <!-- Messages -->
    <div v-else class="space-y-4">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @retry="$emit('retry', message.id)"
        @image-click="openLightbox"
      />
    </div>

    <!-- Streaming indicator -->
    <div v-if="isStreaming" class="flex items-center gap-2 py-2 px-3 text-slate-500">
      <div class="flex gap-1">
        <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
        <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
        <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
      </div>
      <span class="text-xs">Агент печатает...</span>
    </div>

    <!-- New Messages Button -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <button
        v-if="showNewMessagesButton"
        @click="handleScrollToBottom"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 z-10"
      >
        <ArrowDown class="w-4 h-4" />
        Новые сообщения
      </button>
    </Transition>

    <!-- Image Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div
          v-if="lightboxImage"
          class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          @click="closeLightbox"
        >
          <button
            @click="closeLightbox"
            class="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
          <img
            :src="lightboxImage"
            class="max-w-full max-h-full object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Loader2, ArrowDown, X } from 'lucide-vue-next'
import MessageBubble from './MessageBubble.vue'
import DialogsEmptyState from './DialogsEmptyState.vue'
import type { Message } from '../../types/dialogs'

const props = defineProps<{
  dialogId: string
  messages: Message[]
  isLoading?: boolean
  isStreaming?: boolean
  hasMore?: boolean
}>()

defineEmits<{
  (e: 'load-more'): void
  (e: 'retry', messageId: string): void
}>()

// Refs
const scrollContainerRef = ref<HTMLElement | null>(null)
const showNewMessagesButton = ref(false)
const isAtBottom = ref(true)
const lightboxImage = ref<string | null>(null)

// Scroll handling
const handleScroll = () => {
  if (!scrollContainerRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  
  isAtBottom.value = distanceFromBottom < 100
  
  if (isAtBottom.value) {
    showNewMessagesButton.value = false
  }
}

const scrollToBottom = (smooth = true) => {
  if (!scrollContainerRef.value) return
  
  scrollContainerRef.value.scrollTo({
    top: scrollContainerRef.value.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  })
  
  showNewMessagesButton.value = false
}

const handleScrollToBottom = () => {
  scrollToBottom(true)
}

// Watch for new messages
watch(() => props.messages.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    // New message added
    const lastMessage = props.messages[props.messages.length - 1]
    
    if (isAtBottom.value || lastMessage?.role === 'user') {
      // Auto-scroll if at bottom or user sent the message
      nextTick(() => scrollToBottom(false))
    } else if (lastMessage?.role === 'agent') {
      // Show "new messages" button if not at bottom
      showNewMessagesButton.value = true
    }
  }
})

// Watch for streaming to keep scroll at bottom
watch(() => props.isStreaming, (streaming) => {
  if (streaming && isAtBottom.value) {
    nextTick(() => scrollToBottom(false))
  }
})

// Lightbox
const openLightbox = (imageUrl: string) => {
  lightboxImage.value = imageUrl
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxImage.value = null
  document.body.style.overflow = ''
}

// Keyboard handler for lightbox
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && lightboxImage.value) {
    closeLightbox()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Initial scroll to bottom
  nextTick(() => scrollToBottom(false))
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
