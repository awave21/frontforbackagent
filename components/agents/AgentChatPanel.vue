<template>
  <div class="flex flex-col h-[600px] bg-background rounded-md border border-border overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 class="font-bold text-slate-900">Тестовый чат с агентом</h3>
        </div>
        <p
          v-if="chatContextLabel"
          class="text-[10px] text-slate-500 uppercase tracking-widest"
        >
          {{ chatContextLabel }}
        </p>
      </div>
      <button
        @click="clearChat"
        class="text-xs text-slate-500 hover:text-slate-800 transition-colors"
      >
        Очистить историю
      </button>
    </div>

    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/30"
    >
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
          <MessageSquare class="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <p class="font-medium text-slate-900">Начните диалог</p>
          <p class="text-sm text-slate-500 max-w-[240px] mx-auto mt-1">Отправьте сообщение, чтобы проверить работу вашего агента в реальном времени</p>
        </div>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex flex-col"
        :class="[msg.role === 'user' ? 'items-end' : 'items-start']"
      >
        <div
          class="max-w-[80%] rounded-lg px-5 py-3 text-sm leading-relaxed markdown-content"
          :class="[
            msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
          ]"
        >
          <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">{{ msg.content }}</div>
          <div v-else v-html="renderAgentContent(msg.content)"></div>
        </div>
        <div class="flex flex-col gap-1.5 mt-1.5">
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-400 px-1 uppercase font-semibold tracking-wider">
              {{ msg.role === 'user' ? 'Вы' : agent?.name || 'Агент' }}
            </span>
          </div>
          <div
            v-if="msg.role === 'agent' && msg.tokens && (msg.tokens.prompt !== null || msg.tokens.completion !== null || msg.tokens.total !== null)"
            class="flex flex-wrap gap-1.5 text-[10px]"
          >
            <span
              v-if="msg.tokens.prompt !== null && msg.tokens.prompt !== undefined"
              class="text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200"
            >
              Промпт: <span class="font-mono font-semibold">{{ msg.tokens.prompt }}</span>
            </span>
            <span
              v-if="msg.tokens.completion !== null && msg.tokens.completion !== undefined"
              class="text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200"
            >
              Ответ: <span class="font-mono font-semibold">{{ msg.tokens.completion }}</span>
            </span>
            <span
              v-if="msg.tokens.total !== null && msg.tokens.total !== undefined"
              class="text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200"
            >
              Всего: <span class="font-mono font-semibold">{{ msg.tokens.total }}</span>
            </span>
          </div>
          <div
            v-if="msg.role === 'agent' && msg.tools_called && msg.tools_called.length > 0"
            class="flex flex-wrap gap-1.5"
          >
            <span
              v-for="(tool, toolIndex) in msg.tools_called"
              :key="toolIndex"
              class="text-[10px] text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md font-medium border border-indigo-100"
              :title="`Аргументы: ${JSON.stringify(tool.args)}`"
            >
              🔧 {{ tool.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="isTyping" class="flex flex-col items-start">
        <div class="bg-white border border-slate-100 rounded-lg rounded-tl-none px-5 py-4">
          <div class="flex gap-1.5">
            <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-white border-t border-slate-100">
      <form @submit.prevent="sendMessage" class="relative flex items-center gap-3">
        <textarea
          ref="inputArea"
          v-model="userInput"
          @input="autoResize"
          @keydown.enter.prevent="sendMessage"
          placeholder="Напишите сообщение..."
          rows="1"
          class="flex-1 bg-slate-50 border border-slate-100 rounded-md px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none max-h-32"
        ></textarea>
        <button
          type="submit"
          :disabled="!userInput.trim() || isTyping"
          class="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send class="w-5 h-5" />
        </button>
      </form>
      <p class="text-[10px] text-center text-slate-400 mt-3 uppercase font-medium tracking-widest">
        Агент использует модель {{ agent?.model }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { MessageSquare, Send } from 'lucide-vue-next'
import { useAgentEditorStore } from '~/composables/useAgentEditorStore'
import { createSafeMarkdownRenderer } from '~/utils/safe-markdown'

const md = createSafeMarkdownRenderer({
  linkify: true,
  breaks: false,
  typographer: true
})

const renderAgentContent = (content: unknown) => {
  if (typeof content !== 'string') return ''
  return md.render(content)
}

const store = useAgentEditorStore()
const { messages, userInput, isTyping, chatContextLabel, agent } = storeToRefs(store)

const messagesContainer = ref<HTMLElement | null>(null)
const inputArea = ref<HTMLTextAreaElement | null>(null)

const autoResize = () => {
  if (inputArea.value) {
    inputArea.value.style.height = 'auto'
    inputArea.value.style.height = inputArea.value.scrollHeight + 'px'
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value) return
  const sent = await store.sendMessage()
  if (sent && inputArea.value) {
    inputArea.value.style.height = 'auto'
  }
  await scrollToBottom()
}

const clearChat = async () => {
  await store.clearChat()
  await scrollToBottom()
}

watch(agent, (value) => {
  if (value) {
    store.ensureChatLoaded()
    scrollToBottom()
  }
}, { immediate: true })

onMounted(() => {
  store.ensureChatLoaded()
})
</script>

<style scoped>
.markdown-content :deep(p) {
  margin-bottom: 0.5rem;
}
.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-content :deep(ul), .markdown-content :deep(ol) {
  margin-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.markdown-content :deep(ul) {
  list-style-type: disc;
}
.markdown-content :deep(ol) {
  list-style-type: decimal;
}
.markdown-content :deep(code) {
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}
.markdown-content :deep(pre) {
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}
.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}
</style>
