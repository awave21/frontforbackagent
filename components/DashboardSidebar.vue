<template>
  <TooltipProvider :delay-duration="0">
  <aside
    v-bind="$attrs"
    class="bg-white border-r border-slate-200 h-screen lg:h-full lg:relative fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col overflow-hidden"
    :class="[isCollapsed ? 'w-20' : 'w-64']"
  >
    <!-- Top Section (Logo) -->
    <div class="p-4 sm:p-6 border-b border-slate-200 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 shrink-0">
          <div class="w-10 h-10 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <span class="text-white font-bold text-xs sm:text-sm">
              {{ tenant?.name ? tenant.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'ОР' }}
            </span>
          </div>
          <span
            v-show="!isCollapsed"
            class="text-slate-900 font-bold text-xl sm:text-lg whitespace-nowrap truncate"
          >
            {{ tenant?.name || 'Организация' }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <!-- Toggle Button (Desktop) -->
          <button
            @click="toggleSidebar"
            class="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Свернуть/Развернуть"
          >
            <ChevronLeft v-if="!isCollapsed" class="h-5 w-5" />
            <ChevronRight v-else class="h-5 w-5" />
          </button>
          
          <button
            @click="emit('close')"
            class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Middle Section (Scrollable Navigation) -->
    <nav class="flex-1 p-4 sm:p-3 overflow-y-auto min-h-0">
      <ul class="space-y-2">
        <!-- Back Button for Agent Detail -->
        <li v-if="isAgentDetail">
          <TooltipRoot :disabled="!isCollapsed">
            <TooltipTrigger as-child>
              <button
                @click="handleBackToAgents"
                class="w-full flex items-center text-base sm:text-sm font-medium rounded-lg transition-all duration-200 px-4 py-3 sm:py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                :class="[isCollapsed ? 'justify-center px-3' : 'px-4']"
              >
                <ArrowLeft
                  class="w-5 h-5 shrink-0 transition-transform"
                  :class="[!isCollapsed && 'mr-3']"
                />
                <span v-show="!isCollapsed" class="whitespace-nowrap">Назад к агентам</span>
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent side="right" :side-offset="8" class="z-[9999] rounded-md bg-white border border-slate-200 px-3 py-1.5 text-sm text-slate-700 shadow-md">
                Назад к агентам
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </li>

        <li v-for="item in currentMenuItems" :key="item.name">
          <TooltipRoot :disabled="!isCollapsed">
            <TooltipTrigger as-child>
              <NuxtLink
                :to="item.path"
                @click="emit('close')"
                class="flex items-center text-base sm:text-sm font-medium rounded-lg transition-all duration-200"
                :class="[
                  $route.path === item.path
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 sm:py-2.5'
                ]"
              >
                <component
                  :is="item.icon"
                  class="w-5 h-5 shrink-0 transition-transform"
                  :class="[!isCollapsed && 'mr-3']"
                />
                <span
                  v-show="!isCollapsed"
                  class="whitespace-nowrap transition-opacity duration-300"
                >
                  {{ item.name }}
                </span>
              </NuxtLink>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent side="right" :side-offset="8" class="z-[9999] rounded-md bg-white border border-slate-200 px-3 py-1.5 text-sm text-slate-700 shadow-md">
                {{ item.name }}
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </li>
      </ul>
    </nav>

    <!-- Bottom Section (User Info with Dropdown) -->
    <div class="border-t border-slate-200 bg-white shrink-0 p-3">
      <DropdownMenuRoot>
        <DropdownMenuTrigger as-child>
          <button
            class="w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-100 focus:outline-none"
            :class="[isCollapsed ? 'justify-center' : '']"
          >
            <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <span class="text-white font-bold text-xs">
                {{ user?.full_name ? user.full_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U' }}
              </span>
            </div>
            <div v-show="!isCollapsed" class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-900 truncate leading-tight">{{ user?.full_name || 'Пользователь' }}</p>
              <p class="text-xs text-slate-500 truncate leading-tight">{{ user?.email || 'Email не указан' }}</p>
            </div>
            <ChevronsUpDown v-show="!isCollapsed" class="h-4 w-4 text-slate-400 shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            :side="isCollapsed ? 'right' : 'top'"
            :side-offset="8"
            :align="isCollapsed ? 'end' : 'start'"
            class="z-[9999] min-w-56 rounded-xl bg-white border border-slate-200 shadow-lg p-1"
          >
            <!-- User info header -->
            <div class="flex items-center gap-3 px-3 py-2.5">
              <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <span class="text-white font-bold text-xs">
                  {{ user?.full_name ? user.full_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U' }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 truncate">{{ user?.full_name || 'Пользователь' }}</p>
                <p class="text-xs text-slate-500 truncate">{{ user?.email || 'Email не указан' }}</p>
                <p class="text-xs text-indigo-600 font-medium mt-0.5">{{ user?.role ? getRoleDisplayName(user.role) : 'Роль не указана' }}</p>
              </div>
            </div>

            <DropdownMenuSeparator class="h-px bg-slate-200 my-1" />

            <DropdownMenuItem
              class="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer outline-none hover:bg-slate-100 focus:bg-slate-100 transition-colors"
              @select="router.push('/settings')"
            >
              <Settings class="h-4 w-4 text-slate-400" />
              Настройки
            </DropdownMenuItem>

            <DropdownMenuSeparator class="h-px bg-slate-200 my-1" />

            <DropdownMenuItem
              class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg cursor-pointer outline-none hover:bg-red-50 focus:bg-red-50 transition-colors"
              @select="handleLogout"
            >
              <LogOut class="h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>
  </aside>
  </TooltipProvider>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Activity,
  Users,
  Key,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Sparkles,
  Radio,
  Link,
  Database,
  Cpu,
  Code,
  ChevronsUpDown
} from 'lucide-vue-next'
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from 'radix-vue'
import { useAuth } from '../composables/useAuth'

// Auth composable
const { user, tenant, logout } = useAuth()
const route = useRoute()
const router = useRouter()

const emit = defineEmits<{
  close: []
}>()

// Функция для преобразования ролей в русские названия
const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'owner': 'Владелец',
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'user': 'Пользователь',
    'viewer': 'Наблюдатель'
  }
  return roleMap[role] || role
}

// Состояние свернутости
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  if (process.client) {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
  }
}

const handleLogout = () => {
  logout()
  // Перенаправление происходит внутри logout()
}

const isAgentDetail = computed(() => {
  return route.name?.toString().startsWith('agents-id')
})

const handleBackToAgents = () => {
  router.push('/agents')
}

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  }
})

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
    name: 'Диалоги',
    path: '/dialogs',
    icon: MessageSquare
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
  }
]

const agentMenuItems = [
  { id: 'prompt', name: 'Системный промпт', icon: Sparkles, path: (id: string) => `/agents/${id}/prompt` },
  { id: 'channels', name: 'Каналы', icon: Radio, path: (id: string) => `/agents/${id}/channels` },
  { id: 'connections', name: 'Интеграции', icon: Link, path: (id: string) => `/agents/${id}/connections` },
  { id: 'knowledge', name: 'База знаний', icon: Database, path: (id: string) => `/agents/${id}/knowledge` },
  { id: 'functions', name: 'Функции', icon: Code, path: (id: string) => `/agents/${id}/functions` },
  { id: 'model', name: 'Модель', icon: Cpu, path: (id: string) => `/agents/${id}/model` },
  { id: 'chat', name: 'Чат', icon: MessageSquare, path: (id: string) => `/agents/${id}/chat` },
  { id: 'settings', name: 'Настройки', icon: Settings, path: (id: string) => `/agents/${id}/settings` },
]

const currentMenuItems = computed(() => {
  if (isAgentDetail.value) {
    const agentId = route.params.id as string
    const items = agentMenuItems.map(item => ({
      ...item,
      path: item.path(agentId)
    }))
    
    return items
  }
  return menuItems
})
</script>
