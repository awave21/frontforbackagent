<template>
  <aside class="w-64 lg:w-64 bg-white border-r border-slate-200 min-h-screen lg:relative fixed inset-y-0 left-0 z-50">
    <!-- Logo Section -->
    <div class="p-4 sm:p-6 border-b border-slate-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">М</span>
          </div>
          <span class="text-slate-900 font-bold text-xl sm:text-lg">МедиАИ</span>
        </div>
        <button
          @click="emit('close')"
          class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="p-4 sm:p-6">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.name">
          <NuxtLink
            :to="item.path"
            @click="emit('close')"
            class="flex items-center px-4 py-3 sm:py-2 text-base sm:text-sm font-medium rounded-lg transition-colors duration-200"
            :class="[
              $route.path === item.path
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 mr-3"
            />
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- User Info -->
    <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-slate-200 bg-white">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-sm">ДИ</span>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-900">Др. Иванов</p>
          <p class="text-xs text-slate-600">Главный врач</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  Bot,
  Activity,
  Users,
  Key,
  Settings,
  X
} from 'lucide-vue-next'

// Props не нужны для этого компонента, так как логика открытия/закрытия
// обрабатывается в родительском компоненте через v-if

const emit = defineEmits<{
  close: []
}>()

const menuItems = [
  {
    name: 'Панель управления',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Мои агенты',
    path: '/agents',
    icon: Bot
  },
  {
    name: 'Аналитика',
    path: '/analytics',
    icon: Activity
  },
  {
    name: 'Пациенты',
    path: '/patients',
    icon: Users
  },
  {
    name: 'API Ключи',
    path: '/api-keys',
    icon: Key
  },
  {
    name: 'Настройки',
    path: '/settings',
    icon: Settings
  }
]
</script>