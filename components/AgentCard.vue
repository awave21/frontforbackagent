<template>
  <div class="bg-white rounded-xl border p-4 sm:p-6" :class="agent.borderColor">
    <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
      <div class="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br flex-shrink-0" :class="agent.color">
        <component
          :is="iconComponent"
          class="h-6 w-6 sm:h-7 sm:w-7 text-white"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-base sm:text-lg font-bold text-slate-900 truncate">
          {{ agent.name }}
        </h3>
        <div class="flex items-center gap-1.5 mt-1">
          <div class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          <span class="text-xs sm:text-sm font-medium" :class="agent.statusColor">
            {{ agent.status }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:gap-4">
      <div v-for="stat in agent.stats" :key="stat.label">
        <p class="text-xl sm:text-2xl font-bold text-slate-900">
          {{ stat.value }}
        </p>
        <p class="text-xs font-normal text-slate-600">
          {{ stat.label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserCheck, Activity, FileCheck } from 'lucide-vue-next'

interface Agent {
  id: number
  name: string
  icon: string
  color: string
  borderColor: string
  stats: Array<{
    value: string
    label: string
  }>
  status: string
  statusColor: string
}

interface Props {
  agent: Agent
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  switch (props.agent.icon) {
    case 'UserCheck':
      return UserCheck
    case 'Activity':
      return Activity
    case 'FileCheck':
      return FileCheck
    default:
      return UserCheck
  }
})
</script>