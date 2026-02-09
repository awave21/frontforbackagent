<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs">М</span>
          </div>
          <span class="text-slate-900 font-bold">МедиАИ</span>
        </div>
        <button
          @click="isSidebarOpen = !isSidebarOpen"
          class="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <MenuIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="flex">
      <!-- Desktop Sidebar -->
      <DashboardSidebar class="hidden lg:block" />

      <!-- Mobile Sidebar Overlay -->
      <transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 backdrop-blur-0"
        enter-to-class="opacity-100 backdrop-blur-sm"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 backdrop-blur-sm"
        leave-to-class="opacity-0 backdrop-blur-0"
      >
        <div
          v-if="isSidebarOpen"
          class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          @click="isSidebarOpen = false"
        ></div>
      </transition>

      <!-- Mobile Sidebar -->
      <transition
        enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
        enter-from-class="-translate-x-full opacity-0 scale-95"
        enter-to-class="translate-x-0 opacity-100 scale-100"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="translate-x-0 opacity-100 scale-100"
        leave-to-class="-translate-x-full opacity-0 scale-95"
      >
        <div
          v-if="isSidebarOpen"
          class="lg:hidden fixed inset-0 z-50 w-full"
        >
          <DashboardSidebar @close="isSidebarOpen = false" />
        </div>
      </transition>

      <!-- Main Content -->
      <main class="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-10">
        <div class="max-w-4xl mx-auto">
          <!-- Auth Status Banner -->
          <div v-if="!isAuthenticated" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <AlertCircle class="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <h3 class="text-sm font-medium text-yellow-800">
                    Требуется аутентификация
                  </h3>
                  <p class="text-sm text-yellow-700 mt-1">
                    Зарегистрируйтесь или войдите в систему для доступа к настройкам
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="showAuthModal = true"
                  class="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Войти
                </button>
              </div>
            </div>
          </div>

          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8">
            <div class="mb-4 sm:mb-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
                Настройки
              </h1>
              <p class="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Управление настройками системы и профиля
              </p>
            </div>
          </div>

          <!-- Settings Sections -->
          <div class="space-y-4">
            <!-- Team Management Section -->
            <NuxtLink
              v-if="canManageMembers"
              to="/settings/team"
              class="block bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users class="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-slate-900 mb-1">
                      Участники организации
                    </h3>
                    <p class="text-sm text-slate-600">
                      Управление участниками и их ролями
                    </p>
                  </div>
                </div>
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </NuxtLink>

            <!-- Placeholder for other settings -->
            <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div class="max-w-md mx-auto">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings class="h-8 w-8 text-slate-400" />
                </div>
                <h3 class="text-lg font-semibold text-slate-900 mb-2">
                  Дополнительные настройки
                </h3>
                <p class="text-slate-600 text-sm">
                  Функционал настроек будет доступен в ближайшее время
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Auth Modal -->
    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @authenticated="handleAuthenticated"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - definePageMeta is auto-imported in Nuxt 3
definePageMeta({
  middleware: 'auth'
})

import { ref } from 'vue'
import { MenuIcon, AlertCircle, Settings, Users } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'
import { usePermissions } from '../../composables/usePermissions'

// Mobile sidebar state
const isSidebarOpen = ref(false)

// Auth state
const { isAuthenticated } = useAuth()
const { canManageMembers } = usePermissions()
const showAuthModal = ref(false)

// Auth handler
const handleAuthenticated = () => {
  showAuthModal.value = false
}
</script>
