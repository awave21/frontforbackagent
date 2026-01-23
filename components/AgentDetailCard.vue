<template>
  <div class="bg-white rounded-xl border p-7" :class="borderColor">
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-5">
        <div
          class="flex items-center justify-center w-18 h-18 rounded-xl bg-gradient-to-br"
          :class="avatarColor"
        >
          <component :is="iconComponent" class="h-9 w-9 text-white" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">
            {{ title }}
          </h3>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <div
                class="w-2.5 h-2.5 bg-green-500 rounded-full"
              ></div>
              <span class="text-sm font-semibold text-green-600"
                >Активен</span
              >
            </div>
            <div class="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span class="text-sm text-slate-600"
              >{{ type }}</span
            >
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          v-if="agentId"
          :to="`/agents/${agentId}`"
          class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium hover:bg-slate-100 transition-colors"
        >
          <Settings class="h-4 w-4" />
          Настроить
        </NuxtLink>
        <button
          v-else
          class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-slate-900 font-medium"
        >
          <Settings class="h-4 w-4" />
          Настроить
        </button>
        <button class="p-3 bg-slate-50 rounded-lg">
          <MoreVerticalIcon class="h-5 w-5 text-slate-600" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg p-4"
        :class="statsBgColor"
      >
        <p class="text-3xl font-bold mb-1" :class="statsTextColor">{{ stat.value }}</p>
        <p class="text-sm text-slate-600">{{ stat.label }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserCheck, Activity, FileCheck, Settings, MoreVerticalIcon } from 'lucide-vue-next'

interface Stat {
  value: string
  label: string
}

interface Props {
  title: string
  icon: string
  avatarColor: string
  borderColor: string
  type: string
  stats: Stat[]
  statsBgColor: string
  statsTextColor: string
  agentId?: string
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  switch (props.icon) {
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