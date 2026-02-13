<template>
  <div class="w-full px-5 py-5 flex flex-col gap-5">
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
                    Войдите в систему, чтобы получить доступ к управлению агентами
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


          <!-- Stats Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <!-- Active Agents -->
            <div class="bg-white rounded-xl border border-border p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-muted-foreground">Активные</p>
              </div>
              <p class="text-3xl font-bold text-green-600">
                {{ activeAgentsCount }}
              </p>
            </div>

            <!-- Total Agents -->
            <div class="bg-white rounded-xl border border-border p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-muted-foreground">Всего агентов</p>
              </div>
              <p class="text-3xl font-bold text-foreground">
                {{ totalAgentsCount }}
              </p>
            </div>

            <!-- Draft Agents -->
            <div class="bg-white rounded-xl border border-border p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-muted-foreground">
                  Черновики
                </p>
              </div>
              <p class="text-3xl font-bold text-indigo-600">
                {{ draftAgentsCount }}
              </p>
            </div>
          </div>

          <!-- Agents List Section -->
          <div v-if="agentsLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <div v-else-if="agents.length === 0" class="text-center py-12">
            <Bot class="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-foreground mb-2">Нет агентов</h3>
            <p class="text-muted-foreground mb-4">Создайте своего первого AI-агента</p>
            <NuxtLink
              v-if="isAuthenticated && canEditAgents"
              to="/agents/new"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Создать агента
            </NuxtLink>
          </div>

          <div v-else class="space-y-5">
            <AgentDetailCard
              v-for="agent in agents"
              :key="agent.id"
              :agent-id="agent.id"
              :title="agent.name"
              :icon="getAgentIcon(agent)"
              :avatar-color="getAgentColor(agent)"
              :border-color="getAgentBorderColor(agent)"
              :type="getAgentType(agent)"
              :stats-bg-color="getAgentStatsBgColor(agent)"
              :stats-text-color="getAgentStatsTextColor(agent)"
              :stats="getAgentStats(agent)"
              :status="agent.status"
            />
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

import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Settings,
  MoreVerticalIcon,
  UserCheck,
  Activity,
  FileCheck,
  AlertCircle,
  Bot,
  X,
  Loader2,
} from "lucide-vue-next";
import { useAgents, type Agent } from "../../composables/useAgents";
import { useAuth } from "../../composables/useAuth";
import { usePermissions } from "../../composables/usePermissions";

// Router
const router = useRouter();

// Layout state
const { pageTitle } = useLayoutState()

// Auth state
const { isAuthenticated, tenant } = useAuth();

// Permissions
const { canEditAgents } = usePermissions();

// Get agents data
const { agents, fetchAgents, isLoading: agentsLoading, error: agentsError } = useAgents();

// Computed stats from real data
const totalAgentsCount = computed(() => agents.value.length);
const activeAgentsCount = computed(() => 
  agents.value.filter(agent => agent.status === 'published').length
);
const draftAgentsCount = computed(() => 
  agents.value.filter(agent => agent.status === 'draft').length
);

// UI state
const showAuthModal = ref(false);

// Load agents on mount
onMounted(async () => {
  pageTitle.value = 'Мои агенты'
  
  if (isAuthenticated.value) {
    try {
      await fetchAgents();
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }
});

// Watch for authentication changes
watch(isAuthenticated, async (newAuth) => {
  if (newAuth) {
    await fetchAgents();
  }
});


// Handle authentication
const handleAuthenticated = () => {
  showAuthModal.value = false;
};

// Helper functions for agent display
const getAgentIcon = (agent: Agent) => {
  // Simple mapping based on agent name
  if (agent.name.toLowerCase().includes('запис')) return 'UserCheck'
  if (agent.name.toLowerCase().includes('диагностик')) return 'Activity'
  if (agent.name.toLowerCase().includes('документац')) return 'FileCheck'
  return 'Bot'
}

const getAgentColor = (agent: Agent) => {
  const colors = [
    'from-sky-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-cyan-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500'
  ]
  // Use agent ID or name hash for consistent colors
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getAgentBorderColor = (agent: Agent) => {
  const colors = [
    'border-sky-100',
    'border-purple-100',
    'border-emerald-100',
    'border-orange-100',
    'border-indigo-100'
  ]
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getAgentType = (agent: Agent) => {
  // Extract meaningful type from system prompt
  if (agent.system_prompt.toLowerCase().includes('пациент')) return 'Управление пациентами'
  if (agent.system_prompt.toLowerCase().includes('диагностик') || agent.system_prompt.toLowerCase().includes('анализ')) return 'Медицинский анализ'
  if (agent.system_prompt.toLowerCase().includes('документ')) return 'Документооборот'
  return 'Общий помощник'
}

const getAgentStatsBgColor = (agent: Agent) => {
  const colors = ['bg-sky-50', 'bg-purple-50', 'bg-emerald-50', 'bg-orange-50', 'bg-indigo-50']
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getAgentStatsTextColor = (agent: Agent) => {
  const colors = ['text-sky-600', 'text-purple-600', 'text-emerald-600', 'text-orange-600', 'text-indigo-600']
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const parseCostAmount = (value: string | undefined) => {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

const formatCost = (value: string | undefined, currency: 'USD' | 'RUB') => {
  const safeAmount = parseCostAmount(value)
  const maxFractionDigits = safeAmount !== 0 && Math.abs(safeAmount) < 1 ? 4 : 2

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: maxFractionDigits
    }).format(safeAmount)
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFractionDigits
  }).format(safeAmount)
}

const formatExactCostTooltip = (value: string | undefined, currency: 'USD' | 'RUB') => {
  const rawValue = typeof value === 'string' && value.trim() ? value.trim() : '0'
  return `Точное значение: ${rawValue} ${currency}`
}

const getAgentStats = (agent: Agent) => {
  // Real data from agent
  const statusLabel = agent.status === 'published' ? 'Опубликован' : 'Черновик';
  const modelName = agent.model?.split(':')[1] || agent.model || 'Не указана';
  
  return [
    { value: statusLabel, label: 'Статус' },
    { value: modelName, label: 'Модель' },
    { value: agent.version?.toString() || '1', label: 'Версия' },
    { value: new Date(agent.updated_at).toLocaleDateString('ru-RU'), label: 'Обновлен' },
    {
      value: formatCost(agent.total_cost_usd, 'USD'),
      label: 'Расход USD',
      tooltip: formatExactCostTooltip(agent.total_cost_usd, 'USD')
    },
    {
      value: formatCost(agent.total_cost_rub, 'RUB'),
      label: 'Расход RUB',
      tooltip: formatExactCostTooltip(agent.total_cost_rub, 'RUB')
    }
  ]
}
</script>
