<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs">{{ tenant?.name ? tenant.name.charAt(0).toUpperCase() : 'О' }}</span>
          </div>
          <span class="text-slate-900 font-bold">{{ tenant?.name || 'Организация' }}</span>
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
      <DashboardSidebar class="hidden lg:flex" />

      <!-- Mobile Sidebar Overlay -->
      <div
        v-if="isSidebarOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
        @click="isSidebarOpen = false"
      ></div>

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
                    Войдите в систему для создания агента
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

          <!-- Header -->
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">Создать нового агента</h1>
              <p class="text-slate-500 mt-1">Настройте базовые параметры вашего будущего AI-помощника</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="handleCancel"
                class="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                Отменить
              </button>
              <button
                @click="handleCreate"
                :disabled="creating || !isValid"
                class="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
              >
                <Loader2 v-if="creating" class="h-4 w-4 animate-spin" />
                <Plus v-else class="h-4 w-4" />
                Создать
              </button>
            </div>
          </div>

          <!-- Tabs Navigation (Styled like the edit page) -->
          <div class="flex items-center gap-1 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
            <button
              class="px-5 py-3 text-sm font-medium transition-all relative whitespace-nowrap text-indigo-600 bg-indigo-50 rounded-t-lg"
            >
              Основная настройка
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
            <button
              disabled
              class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap"
            >
              Подключения
            </button>
            <button
              disabled
              class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap"
            >
              База знаний
            </button>
            <button
              disabled
              class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap"
            >
              Модель
            </button>
          </div>

          <!-- Content Card -->
          <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <form @submit.prevent="handleCreate" class="space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-2">Название агента *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Например: Агент поддержки"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-2">Модель ИИ *</label>
                  <select
                    v-model="form.model"
                    required
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Выберите модель</option>
                    <option v-if="isLoadingModels && !modelGroups.length" value="" disabled>
                      Загрузка моделей...
                    </option>
                    <option v-else-if="modelsError && !modelGroups.length" value="" disabled>
                      Не удалось загрузить модели
                    </option>
                    <option v-else-if="!modelGroups.length" value="" disabled>
                      Нет доступных моделей
                    </option>

                    <optgroup
                      v-for="group in modelGroups"
                      :key="group.group"
                      :label="group.group"
                    >
                      <option
                        v-for="option in group.options"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </optgroup>
                  </select>
                  <p v-if="modelsError" class="mt-2 text-xs text-rose-600">
                    {{ modelsError }}
                  </p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-900 mb-2">Часовой пояс</label>
                <Popover v-model:open="tzOpen">
                  <PopoverTrigger as-child>
                    <button
                      type="button"
                      role="combobox"
                      :aria-expanded="tzOpen"
                      class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all hover:bg-white"
                    >
                      <span :class="form.timezone ? 'text-slate-900' : 'text-slate-400'">
                        {{ selectedTimezoneLabel }}
                      </span>
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[--reka-popper-anchor-width] p-0" align="start">
                    <Command v-model="form.timezone" @update:model-value="tzOpen = false">
                      <CommandInput placeholder="Поиск часового пояса..." />
                      <CommandEmpty>Часовой пояс не найден</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            v-for="tz in timezoneOptions"
                            :key="tz.value"
                            :value="tz.value"
                          >
                            <Check
                              class="mr-2 h-4 w-4"
                              :class="form.timezone === tz.value ? 'opacity-100' : 'opacity-0'"
                            />
                            {{ tz.label }}
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p class="mt-1.5 text-xs text-slate-400">Часовой пояс используется агентом при работе с датами и временем</p>
              </div>

              <div>
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-900">Системный промпт *</h3>
                  <p class="text-xs text-slate-500 mt-1">Выберите готовый шаблон или создайте свой вариант</p>
                </div>

                <!-- Template Selector Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  <button
                    v-for="template in promptTemplates"
                    :key="template.id"
                    type="button"
                    @click="selectedTemplate = template.id; handleTemplateChange(template.id)"
                    class="text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm"
                    :class="[
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    ]"
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        :class="[
                          selectedTemplate === template.id
                            ? 'bg-indigo-600'
                            : 'bg-slate-100'
                        ]"
                      >
                        <component
                          :is="getTemplateIcon(template.id)"
                          class="h-5 w-5"
                          :class="[
                            selectedTemplate === template.id
                              ? 'text-white'
                              : 'text-slate-400'
                          ]"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4
                          class="text-sm font-semibold mb-1"
                          :class="[
                            selectedTemplate === template.id
                              ? 'text-indigo-900'
                              : 'text-slate-900'
                          ]"
                        >
                          {{ template.name }}
                        </h4>
                        <p class="text-xs text-slate-500 line-clamp-2">
                          {{ template.description }}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <!-- Prompt Text Area -->
                <div class="relative">
                  <textarea
                    v-model="form.system_prompt"
                    required
                    rows="12"
                    :placeholder="selectedTemplate === 'custom' ? 'Опишите роль и поведение агента. Например:\n\nВы — профессиональный помощник медицинской клиники...' : 'Шаблон загружен. Вы можете отредактировать его под свои нужды.'"
                    class="w-full px-5 py-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"
                  ></textarea>
                  <div class="absolute top-3 right-3">
                    <span
                      v-if="selectedTemplate !== 'custom'"
                      class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700"
                    >
                      Шаблон: {{ promptTemplates.find(t => t.id === selectedTemplate)?.name }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="pt-4 flex items-center justify-end border-t border-slate-100">
                <p class="text-xs text-slate-400">* Обязательные поля для заполнения</p>
              </div>
            </form>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MenuIcon,
  AlertCircle,
  Loader2,
  Plus,
  Sparkles,
  Calendar,
  ClipboardList,
  FileText,
  BellRing,
  MessageCircle,
  Check,
  ChevronsUpDown
} from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/components/ui/command'
import { useAgents } from '../../composables/useAgents'
import { useAuth } from '../../composables/useAuth'
import { useActiveModels } from '~/composables/useActiveModels'

// Auth and Router
const { isAuthenticated, tenant } = useAuth()
const router = useRouter()
const { createAgent } = useAgents()
const {
  modelGroups,
  isLoading: isLoadingModels,
  error: modelsError,
  fetchActiveModels,
  getFirstModelValue
} = useActiveModels()

// State
const isSidebarOpen = ref(false)
const showAuthModal = ref(false)
const creating = ref(false)

// Prompt templates
const promptTemplates = [
  {
    id: 'custom',
    name: 'Свой вариант',
    description: 'Создайте собственный системный промпт',
    prompt: ''
  },
  {
    id: 'appointment',
    name: 'Агент записи на прием',
    description: 'Помощник для записи пациентов к врачам',
    prompt: `Вы — профессиональный помощник медицинской клиники, специализирующийся на записи пациентов на прием к врачам.

Ваши основные задачи:
- Помогать пациентам выбрать подходящего специалиста
- Уточнять симптомы и направлять к нужному врачу
- Предлагать доступное время для записи
- Подтверждать записи и отправлять напоминания
- Отвечать на вопросы о подготовке к приему

Стиль общения:
- Вежливый и участливый тон
- Ясные и понятные формулировки
- Эмпатия к состоянию пациента
- Профессионализм без медицинского жаргона

Важно: Вы не ставите диагнозы и не даете медицинских советов, только помогаете с организационными вопросами.`
  },
  {
    id: 'consultation',
    name: 'Агент первичной консультации',
    description: 'Первичный сбор информации о симптомах',
    prompt: `Вы — интеллектуальный помощник для первичной консультации пациентов в медицинской клинике.

Ваши функции:
- Собирать информацию о симптомах и жалобах пациента
- Задавать уточняющие вопросы о длительности, характере симптомов
- Выяснять наличие хронических заболеваний и аллергий
- Рекомендовать подходящего специалиста для обращения
- Определять срочность обращения (плановое/срочное/экстренное)

Принципы работы:
- Задавайте вопросы последовательно, не перегружая пациента
- Используйте простой язык без медицинской терминологии
- Проявляйте внимание и заботу
- При тревожных симптомах рекомендуйте срочное обращение

ВАЖНО: Вы НЕ врач и НЕ ставите диагнозы. Ваша задача — собрать информацию и направить к нужному специалисту.`
  },
  {
    id: 'documentation',
    name: 'Агент документации',
    description: 'Помощь с медицинскими документами и справками',
    prompt: `Вы — помощник по работе с медицинской документацией в клинике.

Ваши задачи:
- Консультировать пациентов по получению справок и выписок
- Объяснять процедуру оформления документов
- Информировать о сроках готовности документов
- Помогать заполнять формы и заявления
- Отвечать на вопросы о медицинских картах

Области помощи:
- Справки для работы/учебы
- Выписки из медицинских карт
- Направления на обследования
- Копии результатов анализов
- Документы для страховых компаний

Стиль общения:
- Четкий и структурированный
- Понятные пошаговые инструкции
- Терпеливое объяснение бюрократических процедур
- Указание точных сроков и требований`
  },
  {
    id: 'results',
    name: 'Агент информирования о результатах',
    description: 'Уведомление пациентов о готовых результатах',
    prompt: `Вы — помощник для информирования пациентов о результатах анализов и обследований.

Ваши функции:
- Уведомлять пациентов о готовности результатов
- Объяснять способы получения результатов (лично, онлайн, по почте)
- Помогать интерпретировать референсные значения
- Рекомендовать обратиться к врачу для расшифровки
- Отвечать на вопросы о сроках готовности анализов

Важные правила:
- Сообщайте факты о готовности, но НЕ интерпретируйте результаты
- Всегда рекомендуйте консультацию с врачом для расшифровки
- Объясняйте, что такое референсные значения
- При отклонениях от нормы мягко рекомендуйте записаться к врачу
- Не пугайте и не успокаивайте преждевременно

Тон: информативный, спокойный, поддерживающий.`
  },
  {
    id: 'support',
    name: 'Агент общей поддержки',
    description: 'Универсальный помощник клиники',
    prompt: `Вы — универсальный помощник медицинской клиники.

Вы помогаете пациентам с широким спектром вопросов:
- Расписание работы клиники и специалистов
- Стоимость услуг и процедур
- Правила подготовки к анализам и обследованиям
- Местоположение и схема проезда
- Страховые программы и скидки
- Общие вопросы о работе клиники

Ваш стиль:
- Дружелюбный и отзывчивый
- Быстрые и точные ответы
- Готовность помочь с любым вопросом
- Перенаправление к профильным специалистам при необходимости

Помните: 
- Вы представляете клинику, будьте вежливы и профессиональны
- Если не знаете ответа, предложите связаться с администратором
- Не давайте медицинских советов, направляйте к врачам`
  }
]

const selectedTemplate = ref('custom')

const timezoneOptions = [
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Kaliningrad', label: 'Калининград (UTC+2)' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Omsk', label: 'Омск (UTC+6)' },
  { value: 'Asia/Novosibirsk', label: 'Новосибирск (UTC+7)' },
  { value: 'Asia/Krasnoyarsk', label: 'Красноярск (UTC+7)' },
  { value: 'Asia/Irkutsk', label: 'Иркутск (UTC+8)' },
  { value: 'Asia/Yakutsk', label: 'Якутск (UTC+9)' },
  { value: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
  { value: 'Asia/Magadan', label: 'Магадан (UTC+11)' },
  { value: 'Asia/Kamchatka', label: 'Камчатка (UTC+12)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Лондон (UTC+0)' },
  { value: 'Europe/Berlin', label: 'Берлин (UTC+1)' },
  { value: 'Europe/Istanbul', label: 'Стамбул (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Дубай (UTC+4)' },
  { value: 'Asia/Almaty', label: 'Алматы (UTC+6)' },
  { value: 'Asia/Bangkok', label: 'Бангкок (UTC+7)' },
  { value: 'Asia/Shanghai', label: 'Шанхай (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Токио (UTC+9)' },
  { value: 'America/New_York', label: 'Нью-Йорк (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Лос-Анджелес (UTC-8)' },
]

const tzOpen = ref(false)

const form = ref({
  name: '',
  model: '',
  timezone: 'Europe/Moscow',
  system_prompt: ''
})

const selectedTimezoneLabel = computed(() =>
  timezoneOptions.find(tz => tz.value === form.value.timezone)?.label ?? 'Выберите часовой пояс'
)

const handleTemplateChange = (templateId: string) => {
  const template = promptTemplates.find(t => t.id === templateId)
  if (template && template.id !== 'custom') {
    form.value.system_prompt = template.prompt
  } else if (template?.id === 'custom') {
    // Keep current value or clear for custom
    form.value.system_prompt = form.value.system_prompt || ''
  }
}

const getTemplateIcon = (templateId: string) => {
  const iconMap: Record<string, any> = {
    custom: Sparkles,
    appointment: Calendar,
    consultation: ClipboardList,
    documentation: FileText,
    results: BellRing,
    support: MessageCircle
  }
  return iconMap[templateId] || Sparkles
}

const isValid = computed(() => {
  return form.value.name.trim() !== '' && 
         form.value.model !== '' && 
         form.value.system_prompt.trim() !== ''
})

const handleCreate = async () => {
  if (!isValid.value) return
  
  try {
    creating.value = true
    const newAgent = await createAgent({
      ...form.value,
      timezone: form.value.timezone || 'Europe/Moscow',
      status: 'draft',
      version: 1,
      llm_params: {
        temperature: 0.7,
        max_tokens: 1000
      }
    })
    
    // Redirect to the newly created agent's edit page
    router.push(`/agents/${newAgent.id}`)
  } catch (error) {
    console.error('Error creating agent:', error)
  } finally {
    creating.value = false
  }
}

const handleCancel = () => {
  router.push('/agents')
}

const handleAuthenticated = () => {
  showAuthModal.value = false
}

onMounted(async () => {
  await fetchActiveModels()

  if (!form.value.model) {
    form.value.model = getFirstModelValue()
  }
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
