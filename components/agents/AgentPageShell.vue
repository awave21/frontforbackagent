<template>
  <div class="h-full p-6 max-w-7xl mx-auto">
    <div class="h-full flex flex-col">
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
              Войдите в систему для редактирования агента
            </p>
          </div>
        </div>
        <button
          @click="showAuthModal = true"
          class="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Войти
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="agent" class="flex flex-col flex-1 min-h-0 gap-4">
      <div class="flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <!-- Page title (breadcrumb, lowercase) -->
          <h1 class="text-sm text-slate-400 font-normal">
            {{ title }}
          </h1>
          <span class="text-slate-300">/</span>
          <!-- Agent name (same level, slightly emphasized) -->
          <span class="text-sm text-slate-500 font-normal">
            {{ agent.name }}
          </span>
        </div>
        <div v-if="!$props.hideActions">
          <div v-if="canEditAgents" class="flex items-center gap-3">
            <button
              @click="handleCancel"
              class="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors"
            >
              Отменить
            </button>
            <button
              @click="handleSave"
              :disabled="isSaving"
              class="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
              <Check v-else class="h-4 w-4" />
              Сохранить
            </button>
          </div>
          <div v-else class="text-sm text-slate-500">
            Режим просмотра
          </div>
        </div>
      </div>

      <slot />
    </div>

    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @authenticated="handleAuthenticated"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from '#app'
import { storeToRefs } from 'pinia'
import { AlertCircle, Check, Loader2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { usePermissions } from '~/composables/usePermissions'
import { useAgentEditorStore } from '~/composables/useAgentEditorStore'
import AuthModal from '~/components/AuthModal.vue'

type Props = {
  title: string
  hideActions?: boolean
}

defineProps<Props>()

const showAuthModal = ref(false)
const route = useRoute()
const store = useAgentEditorStore()
const { agent, isLoading, isSaving } = storeToRefs(store)
const { isAuthenticated } = useAuth()
const { canEditAgents } = usePermissions()

const resolveAgentId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

watch(
  () => route.params.id,
  (id) => {
    const resolved = resolveAgentId(id as string | string[] | undefined)
    if (resolved) {
      store.ensureAgentLoaded(resolved)
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  await store.saveAgent()
}

const handleCancel = () => {
  navigateTo('/agents')
}

const handleAuthenticated = () => {
  showAuthModal.value = false
  window.location.reload()
}
</script>
