<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="text-center max-w-md w-full">
      <div v-if="!isAuthenticated">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
          Добро пожаловать в МедиАИ
        </h1>
        <p class="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8">
          Ваш медицинский чат-бот dashboard
        </p>
        <button
          @click="showAuthModal = true"
          class="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Войти в систему
          <svg class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>

      <div v-else>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
          Добро пожаловать обратно!
        </h1>
        <p class="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8">
          Перенаправление в dashboard...
        </p>
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
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

// Auth state
const { isAuthenticated } = useAuth()
const showAuthModal = ref(false)

// Show auth modal immediately if not authenticated
onMounted(() => {
  if (!isAuthenticated.value) {
    showAuthModal.value = true
  }
})

// Watch for authentication changes
watch(isAuthenticated, (newAuth) => {
  if (newAuth) {
    // Redirect to dashboard after authentication
    navigateTo('/dashboard')
  } else {
    showAuthModal.value = true
  }
})

// Handle authentication
const handleAuthenticated = () => {
  showAuthModal.value = false
  navigateTo('/dashboard')
}
</script>