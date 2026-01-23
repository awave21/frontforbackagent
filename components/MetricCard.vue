<template>
  <div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
    <div class="flex items-center justify-between mb-3 sm:mb-4">
      <p class="text-xs sm:text-sm font-normal text-slate-600">
        {{ title }}
      </p>
      <div class="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
        <component
          :is="iconComponent"
          class="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white"
        />
      </div>
    </div>

    <p class="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
      {{ value }}
    </p>

    <div class="flex items-center">
      <span
        :class="[
          'text-sm font-medium',
          changeType === 'positive'
            ? 'text-green-600'
            : changeType === 'negative'
            ? 'text-red-600'
            : 'text-slate-600'
        ]"
      >
        <ArrowUpIcon v-if="changeType === 'positive'" class="inline h-3 w-3 mr-1" />
        {{ change }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, DollarSign, ShoppingCart, TrendingUp, Bot, Zap, ArrowUpIcon } from 'lucide-vue-next'

interface Props {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: string
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'Users':
      return Users
    case 'DollarSign':
      return DollarSign
    case 'ShoppingCart':
      return ShoppingCart
    case 'TrendingUp':
      return TrendingUp
    case 'Bot':
      return Bot
    case 'Zap':
      return Zap
    default:
      return Users
  }
})
</script>