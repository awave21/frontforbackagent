<template>
  <div class="h-screen flex flex-col bg-slate-50 overflow-hidden">
    <!-- Mobile Header (only show when dialog list is visible) -->
    <div
      v-if="showMobileList || !selectedDialogId"
      class="lg:hidden bg-white border-b border-slate-200 px-4 py-3 shrink-0"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-xs">М</span>
          </div>
          <span class="text-slate-900 font-bold">Диалоги</span>
        </div>
        <button
          @click="isSidebarOpen = !isSidebarOpen"
          class="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <MenuIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="flex flex-1 min-h-0">
      <!-- Desktop Sidebar (Navigation) -->
      <DashboardSidebar class="hidden lg:flex" />

      <!-- Mobile Sidebar Overlay -->
      <div
        v-if="isSidebarOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
        @click="isSidebarOpen = false"
      />

      <!-- Mobile Sidebar -->
      <transition
        enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
        enter-from-class="-translate-x-full opacity-0 scale-95"
        enter-to-class="translate-x-0 opacity-100 scale-100"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="translate-x-0 opacity-100 scale-100"
        leave-to-class="-translate-x-full opacity-0 scale-95"
      >
        <div v-if="isSidebarOpen" class="lg:hidden fixed inset-0 z-50 w-full">
          <DashboardSidebar @close="isSidebarOpen = false" />
        </div>
      </transition>

      <!-- Main Content: Two Column Layout -->
      <main class="flex-1 min-w-0 flex overflow-hidden">
        <!-- Left Column: Dialogs List (hidden on mobile when chat is open) -->
        <div
          :class="[
            'w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-slate-200 bg-white',
            !showMobileList && selectedDialogId ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
          ]"
        >
          <DialogsSidebar
            :agents="agents"
            :selected-agent-id="selectedAgentId"
            :selected-dialog-id="selectedDialogId"
            :is-loading="isLoadingAgents"
            @select-agent="handleSelectAgent"
            @select-dialog="handleSelectDialog"
            @create-dialog="handleCreateDialog"
          />
        </div>

        <!-- Right Column: Chat Area -->
        <div
          :class="[
            'flex-1 flex flex-col bg-slate-50',
            showMobileList && selectedDialogId ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <ChatArea
            v-if="selectedDialogId && selectedAgent"
            :key="selectedDialogId"
            :dialog-id="selectedDialogId"
            :agent="selectedAgent"
            :ws-send-message="wsSendMessage"
            :is-ws-connected="isConnected"
            @back="showMobileList = true"
          />
          <DialogsEmptyState
            v-else
            type="no-dialog"
            @create="handleCreateDialog"
          />
        </div>
      </main>
    </div>

    <!-- Auth Modal -->
    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @authenticated="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu as MenuIcon } from 'lucide-vue-next'
import { useAgents } from '../composables/useAgents'
import { useDialogs } from '../composables/useDialogs'
import { useAuth } from '../composables/useAuth'
import { useAgentWebSocket } from '../composables/useAgentWebSocket'
import type { Agent } from '../composables/useAgents'

// Explicit component imports
import DialogsSidebar from '../components/dialogs/DialogsSidebar.vue'
import ChatArea from '../components/dialogs/ChatArea.vue'
import DialogsEmptyState from '../components/dialogs/DialogsEmptyState.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import AuthModal from '../components/AuthModal.vue'

// Auth
const { isAuthenticated } = useAuth()
const showAuthModal = ref(false)

// Sidebar state
const isSidebarOpen = ref(false)


// Route
const route = useRoute()
const router = useRouter()

// Agents
const { agents, isLoading: isLoadingAgents, fetchAgents } = useAgents()

// Dialogs
const { fetchDialogs, createDialog } = useDialogs()

// Selected state
const selectedAgentId = ref<string | null>(route.query.agentId as string || null)
const selectedDialogId = ref<string | null>(route.query.dialogId as string || null)

// Mobile view state (show chat if dialog is preselected)
const showMobileList = ref(!selectedDialogId.value)
const joinedDialogId = ref<string | null>(null)

// WebSocket connection (replaces SSE)
const { 
  connectionState,
  isConnected,
  sendMessage: wsSendMessage,
  joinDialog,
  leaveDialog
} = useAgentWebSocket(computed(() => selectedAgentId.value))

// Computed
const selectedAgent = computed<Agent | undefined>(() => {
  if (!selectedAgentId.value) return undefined
  return agents.value.find(a => a.id === selectedAgentId.value)
})

// Handlers
const handleSelectAgent = async (agentId: string) => {
  selectedAgentId.value = agentId
  selectedDialogId.value = null
  router.push({ query: { ...route.query, agentId, dialogId: undefined } })
  await fetchDialogs(agentId)
}

const handleSelectDialog = (dialogId: string) => {
  selectedDialogId.value = dialogId
  showMobileList.value = false
  router.push({ query: { ...route.query, dialogId } })
}

// Keep selected IDs in sync with URL query changes
watch(() => route.query.agentId, (agentId) => {
  selectedAgentId.value = typeof agentId === 'string' ? agentId : null
})

watch(() => route.query.dialogId, (dialogId) => {
  selectedDialogId.value = typeof dialogId === 'string' ? dialogId : null
  if (selectedDialogId.value) showMobileList.value = false
})

// Sync WebSocket dialog subscription with current state
watch([isConnected, selectedDialogId], ([connected, dialogId]) => {
  if (!connected) {
    joinedDialogId.value = null
    return
  }

  if (joinedDialogId.value && joinedDialogId.value !== dialogId) {
    leaveDialog(joinedDialogId.value)
    joinedDialogId.value = null
  }

  if (dialogId && joinedDialogId.value !== dialogId) {
    const joined = joinDialog(dialogId)
    if (joined) {
      joinedDialogId.value = dialogId
    } else {
      console.warn('[Page] Failed to join dialog (WebSocket not ready):', dialogId)
    }
  }
}, { immediate: true })

const handleCreateDialog = async () => {
  if (!selectedAgentId.value) {
    if (agents.value.length > 0) {
      await handleSelectAgent(agents.value[0].id)
    }
    return
  }

  const newDialog = await createDialog(selectedAgentId.value)
  if (newDialog) {
    handleSelectDialog(newDialog.id)
  }
}

const handleAuthSuccess = () => {
  showAuthModal.value = false
  loadInitialData()
}

// Load initial data
const loadInitialData = async () => {
  await fetchAgents()
  
  if (selectedAgentId.value) {
    await fetchDialogs(selectedAgentId.value)
  } else if (agents.value.length > 0) {
    await handleSelectAgent(agents.value[0].id)
  }
}

// Watch for auth changes
watch(isAuthenticated, (authenticated) => {
  if (authenticated) loadInitialData()
})

// Initialize
onMounted(() => {
  if (isAuthenticated.value) {
    loadInitialData()
  } else {
    showAuthModal.value = true
  }
})

// Define page meta (Nuxt compiler macro)

definePageMeta({
  middleware: 'auth'
})
</script>
