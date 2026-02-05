<template>
  <div class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 flex-shrink-0">
    <!-- Back Button (mobile) -->
    <button
      @click="$emit('back')"
      class="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" />
    </button>

    <!-- Agent Avatar -->
    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
      <span class="text-white font-bold text-sm">
        {{ agentInitials }}
      </span>
    </div>

    <!-- Agent Info -->
    <div class="flex-1 min-w-0">
      <h2 class="text-sm font-semibold text-slate-900 truncate">
        {{ agent.name }}
      </h2>
      
      <!-- Status -->
      <div class="flex items-center gap-1.5">
        <!-- Streaming indicator (only when agent is enabled) -->
        <template v-if="isStreaming && isEnabled">
          <Loader2 class="w-3 h-3 text-indigo-600 animate-spin" />
          <span class="text-xs text-indigo-600 font-medium">В работе...</span>
        </template>
        
        <!-- Disabled status -->
        <template v-else-if="!isEnabled">
          <span class="w-2 h-2 bg-slate-400 rounded-full" />
          <span class="text-xs text-slate-500">Выключен</span>
        </template>
        
        <!-- Enabled status -->
        <template v-else>
          <span class="w-2 h-2 bg-green-500 rounded-full" />
          <span class="text-xs text-slate-500">Включен</span>
        </template>
      </div>
    </div>

    <!-- Toggle Switch -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-slate-500 hidden sm:inline">
        {{ isEnabled ? 'Вкл' : 'Выкл' }}
      </span>
      <button
        @click="toggleEnabled"
        class="relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :class="[
          isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
        ]"
        role="switch"
        :aria-checked="isEnabled"
      >
        <span
          class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
          :class="[
            isEnabled ? 'translate-x-5' : 'translate-x-0'
          ]"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useAgentEnabled } from '../../composables/useAgentEnabled'
import type { Agent } from '../../composables/useAgents'

const props = defineProps<{
  agent: Agent
  isStreaming?: boolean
}>()

defineEmits<{
  (e: 'back'): void
}>()

// Agent enabled state
const { isAgentEnabled, toggleAgentEnabled } = useAgentEnabled()

// Computed
const isEnabled = computed(() => isAgentEnabled(props.agent.id))

const agentInitials = computed(() => {
  if (!props.agent.name) return '?'
  return props.agent.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Methods
const toggleEnabled = () => {
  toggleAgentEnabled(props.agent.id)
}
</script>
