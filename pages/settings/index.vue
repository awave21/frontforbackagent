<template>
  <div class="w-full px-5 py-5 flex flex-col gap-5">
    <!-- Auth Status Banner -->
    <div v-if="!isAuthenticated" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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


    <!-- Settings Sections -->
    <div class="flex flex-col gap-4">
      <!-- Team Management Section -->
      <NuxtLink
        v-if="canManageMembers"
        to="/settings/team"
        class="block bg-background rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-md transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users class="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-foreground mb-1">
                Участники организации
              </h3>
              <p class="text-sm text-muted-foreground">
                Управление участниками и их ролями
              </p>
            </div>
          </div>
          <svg class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>

      <!-- Placeholder for other settings -->
      <div class="bg-background rounded-xl border border-border p-12 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings class="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2">
            Дополнительные настройки
          </h3>
          <p class="text-muted-foreground text-sm">
            Функционал настроек будет доступен в ближайшее время
          </p>
        </div>
      </div>
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

import { ref, onMounted } from 'vue'
import { AlertCircle, Settings, Users } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'
import { usePermissions } from '../../composables/usePermissions'

// Layout state
const { pageTitle } = useLayoutState()

// Auth state
const { isAuthenticated } = useAuth()
const { canManageMembers } = usePermissions()
const showAuthModal = ref(false)

// Set page title
onMounted(() => {
  pageTitle.value = 'Настройки'
})

// Auth handler
const handleAuthenticated = () => {
  showAuthModal.value = false
}
</script>
