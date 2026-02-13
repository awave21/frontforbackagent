<template>
  <NuxtLink
    :to="`/agents/${agent.id}/prompt`"
    class="bg-white rounded-xl border p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer block"
    :class="borderColor"
  >
    <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
      <div
        class="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br flex-shrink-0"
        :class="avatarColor"
      >
        <Bot class="h-6 w-6 sm:h-7 sm:w-7 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-base sm:text-lg font-bold text-slate-900 truncate">
          {{ agent.name }}
        </h3>
        <div class="flex items-center gap-1.5 mt-1">
          <div
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="agent.status === 'published' ? 'bg-green-500' : 'bg-slate-400'"
          ></div>
          <span
            class="text-xs sm:text-sm font-medium"
            :class="agent.status === 'published' ? 'text-green-600' : 'text-slate-500'"
          >
            {{ agent.status === 'published' ? 'Активен' : 'Черновик' }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:gap-4">
      <div>
        <p class="text-sm sm:text-base font-semibold text-slate-900 truncate">
          {{ agent.model || '—' }}
        </p>
        <p class="text-xs font-normal text-slate-500">
          Модель
        </p>
      </div>
      <div>
        <p class="text-sm sm:text-base font-semibold text-slate-900">
          v{{ agent.version }}
        </p>
        <p class="text-xs font-normal text-slate-500">
          Версия
        </p>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bot } from 'lucide-vue-next'
import type { Agent } from '~/composables/useAgents'

type Props = {
  agent: Agent
}

const props = defineProps<Props>()

const gradients = [
  'from-sky-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-cyan-500',
  'from-indigo-500 to-purple-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
]

const borders = [
  'border-sky-100',
  'border-purple-100',
  'border-emerald-100',
  'border-indigo-100',
  'border-amber-100',
  'border-rose-100',
]

const colorIndex = computed(() => {
  let hash = 0
  for (const ch of props.agent.id) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  return Math.abs(hash) % gradients.length
})

const avatarColor = computed(() => gradients[colorIndex.value])
const borderColor = computed(() => borders[colorIndex.value])
</script>
