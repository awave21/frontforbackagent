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
        <div
          v-if="isSidebarOpen"
          class="lg:hidden fixed inset-0 z-50 w-full"
        >
          <DashboardSidebar @close="isSidebarOpen = false" />
        </div>
      </transition>

      <!-- Main Content -->
      <main class="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-10">
        <div class="max-w-5xl mx-auto">
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
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Agent Edit Content -->
          <div v-else-if="agent" class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-slate-900">
                  Редактирование агента
                </h1>
                <p class="text-slate-500 mt-1">
                  {{ agent.name }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="handleCancel"
                  class="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                >
                  Отменить
                </button>
                <button
                  @click="handleSave"
                  :disabled="saving"
                  class="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
                >
                  <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
                  <Check v-else class="h-4 w-4" />
                  Сохранить
                </button>
              </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="flex items-center gap-1 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="px-5 py-3 text-sm font-medium transition-all relative whitespace-nowrap"
                :class="[
                  activeTab === tab.id
                    ? 'text-indigo-600 bg-indigo-50 rounded-t-lg'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                ]"
              >
                {{ tab.label }}
                <div
                  v-if="activeTab === tab.id"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                ></div>
              </button>
            </div>

            <!-- Tab Content: System Prompt -->
            <div v-if="activeTab === 'prompt'" class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-bold text-slate-900">Системный промпт</h3>
                  <p class="text-sm text-slate-500 mt-1">
                    Основные инструкции для агента, определяющие его поведение и роль
                  </p>
                </div>
                
                <!-- Tools Dropdown -->
                <div class="relative group">
                  <button
                    type="button"
                    class="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-all"
                  >
                    <Wrench class="h-4 w-4 text-slate-500" />
                    Инструменты
                    <ChevronDown class="h-4 w-4 text-slate-400" />
                  </button>
                  
                  <div class="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
                    <div class="px-4 py-2 border-b border-slate-50 mb-1">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Доступные инструменты</p>
                    </div>
                    
                    <div class="max-h-64 overflow-y-auto px-1">
                      <!-- SQNS Tools -->
                      <div v-if="isSqnsEnabled && sqnsToolsList.length" class="mb-2">
                        <div class="px-3 py-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50/50 rounded-md mx-2 mb-1">SQNS Интеграция</div>
                          <button
                          v-for="tool in sqnsToolsList"
                          :key="tool.name"
                          @click="addToolToPrompt(tool.name, tool.description)"
                          class="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group/item"
                        >
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-mono font-bold text-indigo-600">{{ tool.name }}</span>
                            <span class="text-[10px] text-indigo-500 opacity-0 group-hover/item:opacity-100">+ Вставить</span>
                          </div>
                          <p class="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{{ tool.description }}</p>
                        </button>
                      </div>
                      
                      <!-- Custom Tools -->
                      <div v-if="boundTools.length" class="mb-2">
                        <div class="px-3 py-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50/50 rounded-md mx-2 mb-1">Пользовательские</div>
                        <button
                          v-for="binding in boundTools"
                          :key="binding.tool_id"
                          @click="addToolToPrompt(getToolName(binding.tool_id))"
                          class="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group/item"
                        >
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-mono font-bold text-emerald-600">{{ getToolName(binding.tool_id) }}</span>
                            <span class="text-[10px] text-emerald-500 opacity-0 group-hover/item:opacity-100">+ Вставить</span>
                          </div>
                          <p class="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{{ getToolDescription(binding.tool_id) }}</p>
                        </button>
                      </div>
                      
                      <div v-if="!isSqnsEnabled && !boundTools.length" class="px-4 py-4 text-center">
                        <p class="text-xs text-slate-400">Нет подключенных инструментов</p>
                        <button 
                          @click="activeTab = 'connections'"
                          class="text-[10px] text-indigo-600 font-bold mt-2 hover:underline"
                        >
                          Подключить в настройках
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="relative">
                <textarea
                  v-model="form.system_prompt"
                  rows="12"
                  class="w-full px-5 py-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"
                  placeholder="Введите инструкции для агента..."
                ></textarea>
              </div>

              <div class="mt-6">
                <button
                  type="button"
                  class="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles class="h-4 w-4" />
                  Сгенерировать с помощью ИИ
                </button>
              </div>
            </div>

            <!-- Tab Content: Channels -->
            <div v-else-if="activeTab === 'channels'" class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div class="mb-6">
                <h3 class="text-lg font-bold text-slate-900">Каналы связи</h3>
                <p class="text-sm text-slate-500 mt-1">
                  Подключите мессенджеры и другие каналы для общения с вашими клиентами через агента.
                </p>
              </div>

              <div v-if="loadingChannels" class="flex justify-center py-12">
                <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
              </div>

              <div v-else class="space-y-5">
                <!-- Telegram Bot -->
                <div
                  class="p-6 border rounded-2xl transition-all"
                  :class="[
                    telegramChannel
                      ? 'border-indigo-100 bg-indigo-50/30'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  ]"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex gap-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Send class="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900">Telegram Bot</h4>
                        <p class="text-sm text-slate-500 mt-1">
                          Подключите Telegram-бота для автоматического общения с клиентами.
                        </p>
                        <div v-if="telegramChannel" class="mt-3">
                          <span
                            class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                            :class="telegramChannel.webhook_enabled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                          >
                            {{ telegramChannel.webhook_enabled ? 'Активен' : 'Неактивен' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      v-if="telegramChannel"
                      @click="showChannelEditSheet = true"
                      class="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Настроить
                    </button>
                    <button
                      v-else
                      @click="showChannelEditSheet = true"
                      class="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Подключить
                    </button>
                  </div>
                </div>

                <!-- WhatsApp (Coming Soon) -->
                <div class="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 opacity-60">
                  <div class="flex items-start justify-between">
                    <div class="flex gap-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                        <MessageSquare class="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900">WhatsApp</h4>
                        <p class="text-sm text-slate-500 mt-1">
                          Интеграция с WhatsApp Business API для общения с клиентами.
                        </p>
                      </div>
                    </div>
                    <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 uppercase">
                      Скоро
                    </span>
                  </div>
                </div>

                <!-- Web Widget (Coming Soon) -->
                <div class="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 opacity-60">
                  <div class="flex items-start justify-between">
                    <div class="flex gap-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                        <MessageSquare class="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900">Виджет на сайт</h4>
                        <p class="text-sm text-slate-500 mt-1">
                          Встраиваемый чат-виджет для вашего сайта.
                        </p>
                      </div>
                    </div>
                    <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 uppercase">
                      Скоро
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Content: Chat -->
            <div v-else-if="activeTab === 'chat'" class="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <!-- Chat Header -->
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-3">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 class="font-bold text-slate-900">Тестовый чат с агентом</h3>
                  </div>
                  <p
                    v-if="chatContextLabel"
                    class="text-[10px] text-slate-500 uppercase tracking-widest"
                  >
                    {{ chatContextLabel }}
                  </p>
                </div>
                <button 
                  @click="clearChat"
                  class="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Очистить историю
                </button>
              </div>

              <!-- Messages Area -->
              <div 
                ref="messagesContainer"
                class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/30"
              >
                <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                    <MessageSquare class="w-8 h-8 text-indigo-500" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">Начните диалог</p>
                    <p class="text-sm text-slate-500 max-w-[240px] mx-auto mt-1">Отправьте сообщение, чтобы проверить работу вашего агента в реальном времени</p>
                  </div>
                </div>

                <div 
                  v-for="(msg, index) in messages" 
                  :key="index"
                  class="flex flex-col"
                  :class="[msg.role === 'user' ? 'items-end' : 'items-start']"
                >
                  <div 
                    class="max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm markdown-content"
                    :class="[
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                    ]"
                  >
                    <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">{{ msg.content }}</div>
                    <div v-else v-html="md.render(msg.content)"></div>
                  </div>
                  <div class="flex flex-col gap-1.5 mt-1.5">
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] text-slate-400 px-1 uppercase font-semibold tracking-wider">
                        {{ msg.role === 'user' ? 'Вы' : agent?.name || 'Агент' }}
                      </span>
                    </div>
                    <!-- Детальная информация о токенах -->
                    <div 
                      v-if="msg.role === 'agent' && msg.tokens && (msg.tokens.prompt !== null || msg.tokens.completion !== null || msg.tokens.total !== null)" 
                      class="flex flex-wrap gap-1.5 text-[10px]"
                    >
                      <span 
                        v-if="msg.tokens.prompt !== null && msg.tokens.prompt !== undefined"
                        class="text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200"
                      >
                        Промпт: <span class="font-mono font-semibold">{{ msg.tokens.prompt }}</span>
                      </span>
                      <span 
                        v-if="msg.tokens.completion !== null && msg.tokens.completion !== undefined"
                        class="text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200"
                      >
                        Ответ: <span class="font-mono font-semibold">{{ msg.tokens.completion }}</span>
                      </span>
                      <span 
                        v-if="msg.tokens.total !== null && msg.tokens.total !== undefined"
                        class="text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200"
                      >
                        Всего: <span class="font-mono font-semibold">{{ msg.tokens.total }}</span>
                      </span>
                    </div>
                    <!-- Инструменты, вызванные агентом -->
                    <div 
                      v-if="msg.role === 'agent' && msg.tools_called && msg.tools_called.length > 0"
                      class="flex flex-wrap gap-1.5"
                    >
                      <span 
                        v-for="(tool, toolIndex) in msg.tools_called"
                        :key="toolIndex"
                        class="text-[10px] text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md font-medium border border-indigo-100"
                        :title="`Аргументы: ${JSON.stringify(tool.args)}`"
                      >
                        🔧 {{ tool.name }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Agent is typing loader -->
                <div v-if="isTyping" class="flex flex-col items-start">
                  <div class="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                    <div class="flex gap-1.5">
                      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                      <div class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Input Area -->
              <div class="p-4 bg-white border-t border-slate-100">
                <form @submit.prevent="sendMessage" class="relative flex items-center gap-3">
                  <textarea
                    ref="inputArea"
                    v-model="userInput"
                    @input="autoResize"
                    @keydown.enter.prevent="sendMessage"
                    placeholder="Напишите сообщение..."
                    rows="1"
                    class="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none max-h-32"
                  ></textarea>
                  <button
                    type="submit"
                    :disabled="!userInput.trim() || isTyping"
                    class="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100"
                  >
                    <Send class="w-5 h-5" />
                  </button>
                </form>
                <p class="text-[10px] text-center text-slate-400 mt-3 uppercase font-medium tracking-widest">
                  Агент использует модель {{ agent?.model }}
                </p>
              </div>
            </div>

            <!-- Tab Content: Model -->
            <div v-else-if="activeTab === 'model'" class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Model Selection -->
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Cpu class="w-4 h-4 text-slate-400" />
                    Модель ИИ
                  </label>
                  <select
                    v-model="form.model"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="openai:gpt-4o-mini">GPT-4o Mini (Быстрая)</option>
                    <option value="openai:gpt-4o">GPT-4o (Умная)</option>
                    <option value="openai:gpt-4">GPT-4 (Классическая)</option>
                    <option value="anthropic:claude-3-haiku">Claude 3 Haiku</option>
                    <option value="anthropic:claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>

                <!-- Temperature -->
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                    <span class="flex items-center gap-2">
                      <Settings class="w-4 h-4 text-slate-400" />
                      Температура
                    </span>
                    <span class="text-indigo-600 font-mono">{{ form.llm_params.temperature }}</span>
                  </label>
                  <input
                    v-model.number="form.llm_params.temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div class="flex justify-between text-[10px] text-slate-400 mt-2 uppercase font-medium">
                    <span>Точный</span>
                    <span>Креативный</span>
                  </div>
                </div>
              </div>

              <div class="pt-6 border-t border-slate-100">
                <label class="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Database class="w-4 h-4 text-slate-400" />
                  Максимальное количество токенов
                </label>
                <div class="flex items-center gap-4">
                  <input
                    v-model.number="form.llm_params.max_tokens"
                    type="number"
                    min="1"
                    max="4000"
                    class="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-mono"
                  />
                  <p class="text-xs text-slate-500 italic">
                    Определяет максимальную длину ответа агента.
                  </p>
                </div>
              </div>
            </div>

            <!-- Tab Content: Settings -->
            <div v-else-if="activeTab === 'settings'" class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
              <div class="max-w-2xl space-y-8">
                <!-- Agent Name -->
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-3">Название агента</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="Введите название..."
                  />
                </div>

                <!-- Agent Status -->
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-3">Статус агента</label>
                  <div class="flex gap-4">
                    <button
                      type="button"
                      @click="form.status = 'draft'"
                      class="flex-1 flex flex-col p-4 border-2 rounded-2xl transition-all text-left"
                      :class="[
                        form.status === 'draft'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      ]"
                    >
                      <span class="font-bold text-slate-900">Черновик</span>
                      <span class="text-xs text-slate-500 mt-1">Агент доступен только вам для тестирования</span>
                    </button>
                    <button
                      type="button"
                      @click="form.status = 'published'"
                      class="flex-1 flex flex-col p-4 border-2 rounded-2xl transition-all text-left"
                      :class="[
                        form.status === 'published'
                          ? 'border-green-600 bg-green-50/50 ring-4 ring-green-50'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      ]"
                    >
                      <span class="font-bold text-slate-900">Опубликован</span>
                      <span class="text-xs text-slate-500 mt-1">Агент готов к интеграции и работе</span>
                    </button>
                  </div>
                </div>

                <!-- Delete Section -->
                <div class="pt-8 border-t border-red-50">
                  <h4 class="text-sm font-bold text-red-600 mb-2">Опасная зона</h4>
                  <p class="text-xs text-slate-500 mb-4">Удаление агента приведет к безвозвратной потере всех его настроек и истории.</p>
                  <button
                    type="button"
                    @click="handleDelete"
                    class="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                  >
                    Удалить агента
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab Content: Connections -->
            <div v-else-if="activeTab === 'connections'" class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div class="mb-6">
                <h3 class="text-lg font-bold text-slate-900">Инструменты и подключения</h3>
                <p class="text-sm text-slate-500 mt-1">
                  Подключите внешние инструменты и API для расширения возможностей вашего агента.
                  Мы поддерживаем различные CRM-системы и сервисы.
                </p>
              </div>

              <div class="space-y-5">
                <!-- SQNS Integration -->
                <IntegrationCard
                  title="SQNS"
                  description="Интеграция с CRM для управления визитами и бронированием."
                  :status="isSqnsEnabled ? (sqnsStatus?.sqnsStatus === 'error' ? 'error' : 'active') : 'inactive'"
                  :status-label="sqnsStatusLabel"
                  :host="sqnsHostLabel"
                  :last-sync="formattedSqnsSyncAt"
                  :error="sqnsErrorMessage"
                  :icon="Link"
                  @enable="showSqnsModal = true"
                  @disable="handleSqnsDisable"
                >
                  <template #extra>
                    <!-- SQNS Tools (Inside Card) -->
                    <div v-if="isSqnsEnabled && sqnsToolsList.length" class="space-y-4 pt-4 border-t border-indigo-100/30">
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Доступные инструменты SQNS</p>
                        </div>
                        <div class="grid gap-3">
                          <details
                            v-for="tool in sqnsToolsList"
                            :key="tool.name"
                            class="group rounded-xl border border-indigo-100/30 bg-white/50 shadow-sm overflow-hidden"
                          >
                            <summary class="flex items-center justify-between p-3 cursor-pointer hover:bg-indigo-50/30 transition-colors list-none">
                              <div class="flex items-center gap-2">
                                <p class="text-xs font-bold text-slate-700">{{ tool.displayName }}</p>
                                <div v-if="tool.requiredFields?.length" class="flex gap-1">
                                  <span
                                    v-for="field in tool.requiredFields.slice(0, 2)"
                                    :key="field"
                                    class="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] text-indigo-600 font-medium"
                                  >
                                    {{ field }}
                                  </span>
                                  <span v-if="tool.requiredFields.length > 2" class="text-[8px] text-slate-400">...</span>
                                </div>
                              </div>
                              <ChevronDown class="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div class="px-3 pb-3 space-y-2">
                              <p class="text-xs text-slate-600 leading-normal">
                                {{ tool.description }}
                              </p>
                              <div v-if="tool.requiredFields?.length" class="flex flex-wrap gap-1.5 pt-1">
                                <p class="text-[9px] text-slate-400 w-full font-medium uppercase tracking-wider">Обязательные поля:</p>
                                <span
                                  v-for="field in tool.requiredFields"
                                  :key="field"
                                  class="rounded-full border border-indigo-100/50 bg-indigo-50/50 px-2 py-0.5 text-[9px] text-indigo-600 font-medium"
                                >
                                  {{ field }}
                                </span>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>

                      <div v-if="sqnsResources.length || sqnsServices.length" class="flex flex-wrap gap-4 pt-2">
                        <div v-if="sqnsResources.length" class="space-y-2">
                          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ресурсы</div>
                          <div class="flex flex-wrap gap-1.5">
                            <span
                              v-for="resource in sqnsResources"
                              :key="resource.id"
                              class="rounded-full border border-indigo-100/50 bg-indigo-50/50 px-2 py-0.5 text-[9px] text-indigo-700 font-medium"
                            >
                              {{ resource.name }}
                            </span>
                          </div>
                        </div>
                        <div v-if="sqnsServices.length" class="space-y-2">
                          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Услуги</div>
                          <div class="flex flex-wrap gap-1.5">
                            <span
                              v-for="service in sqnsServices"
                              :key="service.id"
                              class="rounded-full border border-emerald-100/50 bg-emerald-50/50 px-2 py-0.5 text-[9px] text-emerald-700 font-medium"
                            >
                              {{ service.name }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </IntegrationCard>

                <!-- Klientiks CRM Integration -->
                <IntegrationCard
                  title="Klientiks CRM"
                  description="Эффективный инструмент для управления медицинской клиникой и медицинскими работниками."
                  status="soon"
                  status-label="скоро"
                  :icon="Link"
                />
              </div>

              <!-- Standard Tools Section -->
              <div class="mt-10 pt-10 border-t border-slate-100">
                <div class="mb-6">
                  <h3 class="text-lg font-bold text-slate-900">Пользовательские инструменты</h3>
                  <p class="text-sm text-slate-500 mt-1">Подключите вебхуки или другие API инструменты.</p>
                </div>

                <div v-if="loadingTools" class="flex justify-center py-12">
                  <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
                </div>

                <div
                  v-else-if="availableTools.length === 0"
                  class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
                >
                  <Link class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p class="text-slate-500">Нет доступных инструментов. Создайте их в разделе "Инструменты".</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="tool in availableTools"
                    :key="tool.id"
                    class="p-5 border rounded-2xl transition-all flex items-start justify-between group"
                    :class="[
                      boundTools.some(bt => bt.tool_id === tool.id)
                        ? 'border-indigo-100 bg-indigo-50/30'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    ]"
                  >
                    <div class="flex gap-4">
                      <div class="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                        <component :is="tool.execution_type === 'http_webhook' ? Link : Database" class="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900 text-sm">{{ tool.name }}</h4>
                        <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ tool.description || 'Нет описания' }}</p>
                      </div>
                    </div>

                    <button
                      @click="toggleTool(tool)"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      :class="[
                        boundTools.some(bt => bt.tool_id === tool.id)
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      ]"
                    >
                      {{ boundTools.some(bt => bt.tool_id === tool.id) ? 'Подключено' : 'Подключить' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Other tabs (Placeholders) -->
            <div v-else class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <div class="max-w-md mx-auto">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <component :is="tabs.find(t => t.id === activeTab)?.icon || Settings" class="h-8 w-8 text-slate-400" />
                </div>
                <h3 class="text-lg font-bold text-slate-900">Раздел "{{ tabs.find(t => t.id === activeTab)?.label }}"</h3>
                <p class="text-slate-500 mt-2">
                  Этот раздел находится в разработке. Здесь будут располагаться настройки для {{ tabs.find(t => t.id === activeTab)?.label.toLowerCase() }}.
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
  <SQNSModal
    :is-open="showSqnsModal"
    :is-submitting="isSqnsSubmitting"
    @close="showSqnsModal = false"
    @submit="handleSqnsSubmit"
  />
  
  <ChannelEditSheet
    v-if="agent"
    :open="showChannelEditSheet"
    :agent-id="agent.id"
    :current-token="telegramChannel?.bot_token"
    @update:open="showChannelEditSheet = $event"
    @saved="handleChannelSaved"
    @deleted="handleChannelDeleted"
  />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - definePageMeta is auto-imported in Nuxt 3
definePageMeta({
  middleware: 'auth'
})

import { computed, onMounted, nextTick, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore - Nuxt 3 auto-imports
import { navigateTo } from '#app'
import {
  MenuIcon,
  AlertCircle,
  Loader2,
  Check,
  Sparkles,
  Link,
  Database,
  Cpu,
  Settings,
  MessageSquare,
  X,
  Send,
  ChevronDown,
  Wrench,
  Radio
} from 'lucide-vue-next'
// @ts-ignore - Nuxt 3 auto-imports
import { useAgents, type Agent, type AgentStatus } from '../../composables/useAgents'
// @ts-ignore - Nuxt 3 auto-imports
import { useAuth } from '../../composables/useAuth'
import { useApiFetch } from '../../composables/useApiFetch'
import { useAgentSession } from '../../composables/useAgentSession'
import { useToast } from '../../composables/useToast'
import SQNSModal from '../../components/SQNSModal.vue'
import IntegrationCard from '../../components/IntegrationCard.vue'
import ChannelEditSheet from '../../components/ChannelEditSheet.vue'

// Route and composables
const route = useRoute()
const router = useRouter()
const {
  getAgent,
  updateAgent,
  deleteAgent,
  isLoading: apiLoading,
  error: apiError,
  sqnsStatus,
  sqnsResources,
  sqnsServices,
  sqnsError,
  fetchSqnsStatus,
  enableSqns,
  disableSqns,
  fetchSqnsResources,
  fetchSqnsServices
} = useAgents()
const { isAuthenticated, token } = useAuth()
const apiFetch = useApiFetch()
const { success: toastSuccess, error: toastError } = useToast()

// State
const isSidebarOpen = ref(false)
const showAuthModal = ref(false)
const agent = ref<Agent | null>(null)
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const activeTab = ref('prompt')

// Tools state
const availableTools = ref<any[]>([])
const boundTools = ref<any[]>([])
const loadingTools = ref(false)
const showSqnsModal = ref(false)
const isSqnsSubmitting = ref(false)
const sqnsHintsLoaded = ref(false)

// Channels state
const telegramChannel = ref<{
  id?: string
  bot_token?: string
  webhook_enabled?: boolean
  webhook_endpoint?: string
} | null>(null)
const loadingChannels = ref(false)
const showChannelEditSheet = ref(false)

const fetchToolsData = async () => {
  if (!agent.value) return
  try {
    loadingTools.value = true
    const [allTools, currentBindings] = await Promise.all([
      apiFetch<any[]>('/tools', { headers: { Authorization: `Bearer ${token.value}` } }),
      apiFetch<any[]>(`/agents/${agent.value.id}/tools`, { headers: { Authorization: `Bearer ${token.value}` } })
    ])
    availableTools.value = allTools
    boundTools.value = currentBindings
  } catch (err) {
    console.error('Failed to fetch tools:', err)
  } finally {
    loadingTools.value = false
  }
}

const toggleTool = async (tool: any) => {
  if (!agent.value) return
  const isBound = boundTools.value.some(bt => bt.tool_id === tool.id)
  
  try {
    if (isBound) {
      await apiFetch(`/agents/${agent.value.id}/tools/${tool.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` }
      })
    } else {
      await apiFetch(`/agents/${agent.value.id}/tools/${tool.id}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: {
          permission_scope: 'read',
          timeout_ms: 15000
        }
      })
    }
    await fetchToolsData()
  } catch (err) {
    console.error('Failed to toggle tool:', err)
  }
}

const getToolName = (toolId: string) => {
  const tool = availableTools.value.find(t => t.id === toolId)
  return tool?.name || 'Инструмент'
}

const getToolDescription = (toolId: string) => {
  const tool = availableTools.value.find(t => t.id === toolId)
  return tool?.description || ''
}

const addToolToPrompt = (name: string, description?: string) => {
  const toolText = `${name}()`
  const textarea = document.querySelector('textarea[placeholder="Введите инструкции для агента..."]') as HTMLTextAreaElement
  
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const scrollTop = textarea.scrollTop
    const text = form.value.system_prompt
    
    form.value.system_prompt = text.substring(0, start) + toolText + text.substring(end)
    
    // Restore focus and cursor position after Vue update
    nextTick(() => {
      textarea.focus({ preventScroll: true })
      textarea.scrollTop = scrollTop
      const newCursorPos = start + toolText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
    
    toastSuccess('Инструмент добавлен', `Инструмент ${name}() вставлен`)
  } else {
    // Fallback if textarea not found
    form.value.system_prompt += (form.value.system_prompt ? ' ' : '') + toolText
    toastSuccess('Инструмент добавлен', `Инструмент ${name}() добавлен в конец`)
  }
}

// Chat state
const { getSessionId, setSessionId, clearSessionId } = useAgentSession()
const messages = ref<{ 
  role: 'user' | 'agent'
  content: string
  tokens?: {
    prompt?: number
    completion?: number
    total?: number
  }
  tools_called?: Array<{
    name: string
    tool_call_id: string | null
    args: Record<string, any>
  }>
}[]>([])

// Persist messages to localStorage
const STORAGE_MESSAGES_KEY = 'agent-chat-messages'
const saveMessages = () => {
  if (process.client && agent.value) {
    localStorage.setItem(`${STORAGE_MESSAGES_KEY}-${agent.value.id}`, JSON.stringify(messages.value))
  }
}

const loadMessages = () => {
  if (process.client && agent.value) {
    const stored = localStorage.getItem(`${STORAGE_MESSAGES_KEY}-${agent.value.id}`)
    if (stored) {
      try {
        messages.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored messages', e)
        messages.value = []
      }
    }
  }
}

watch(messages, () => {
  saveMessages()
}, { deep: true })
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const inputArea = ref<HTMLTextAreaElement | null>(null)
const currentSessionId = ref<string | null>(null)
const chatContextLabel = computed(() => {
  const count = messages.value.length
  return count > 0 ? `контекст: ${count} сообщений` : ''
})

const autoResize = () => {
  if (inputArea.value) {
    inputArea.value.style.height = 'auto'
    inputArea.value.style.height = inputArea.value.scrollHeight + 'px'
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value || !agent.value) return

  const userMessage = userInput.value.trim()
  userInput.value = ''
  if (inputArea.value) {
    inputArea.value.style.height = 'auto'
  }
  
      messages.value.push({ role: 'user', content: userMessage, tokens: undefined, tools_called: undefined })
  await scrollToBottom()

  try {
    isTyping.value = true
    
    const payload: any = {
      agent_id: agent.value.id,
      input_message: userMessage
    }
    if (currentSessionId.value) {
      payload.session_id = currentSessionId.value
    }

    const response = await apiFetch<any>('/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    })

    // Обрабатываем ответ в зависимости от статуса
    if (response) {
      // Store session_id from response for subsequent messages
      if (response.session_id && agent.value) {
        setSessionId(agent.value.id, response.session_id)
        currentSessionId.value = response.session_id
      }

      // Извлекаем информацию о токенах из ответа
      // Токены теперь на верхнем уровне ответа, а не в объекте tokens
      // Показываем токены, если есть хотя бы одно значение
      const hasTokens = response.prompt_tokens !== null && response.prompt_tokens !== undefined
        || response.completion_tokens !== null && response.completion_tokens !== undefined
        || response.total_tokens !== null && response.total_tokens !== undefined
      
      const tokens = hasTokens ? {
        prompt: response.prompt_tokens ?? null,
        completion: response.completion_tokens ?? null,
        total: response.total_tokens ?? null
      } : undefined
      
      // Отладочный вывод (можно убрать после проверки)
      if (process.client) {
        console.log('Run response:', {
          status: response.status,
          has_output: !!response.output_message,
          prompt_tokens: response.prompt_tokens,
          completion_tokens: response.completion_tokens,
          total_tokens: response.total_tokens,
          tools_called: response.tools_called,
          extracted_tokens: tokens
        })
      }
      
      // Извлекаем информацию о вызванных инструментах
      const toolsCalled = response.tools_called && response.tools_called.length > 0 
        ? response.tools_called 
        : undefined

      // Обрабатываем в зависимости от статуса
      if (response.status === 'succeeded' && response.output_message) {
        let content = response.output_message
        
        // Обработка сырого формата AgentRunResult(output='...')
        const match = content.match(/AgentRunResult\(output=['"]([\s\S]*)['"]\)/)
        if (match && match[1]) {
          content = match[1]
        }
        
        messages.value.push({ role: 'agent', content, tokens, tools_called: toolsCalled })
      } else if (response.status === 'failed' && response.error_message) {
        // Показываем ошибку от агента
        messages.value.push({ 
          role: 'agent', 
          content: `Ошибка: ${response.error_message}`, 
          tokens, 
          tools_called: toolsCalled 
        })
        toastError('Ошибка выполнения агента', response.error_message)
      } else {
        // Неизвестный статус или отсутствие сообщения
        messages.value.push({ 
          role: 'agent', 
          content: 'Извините, возникла ошибка при получении ответа.', 
          tokens, 
          tools_called: toolsCalled 
        })
      }
    } else {
      messages.value.push({ 
        role: 'agent', 
        content: 'Извините, возникла ошибка при получении ответа.', 
        tokens: undefined, 
        tools_called: undefined 
      })
    }
  } catch (err: any) {
    console.error('Chat error:', err)
    
    // Если сессия недействительна (400), сбрасываем её
    if (err.statusCode === 400 && currentSessionId.value) {
      console.warn('Session might be invalid, clearing...')
      clearSessionId(agent.value.id)
      currentSessionId.value = null
    }
    
    messages.value.push({ role: 'agent', content: 'Произошла ошибка при связи с агентом.', tokens: undefined, tools_called: undefined })
  } finally {
    isTyping.value = false
    await scrollToBottom()
  }
}

const clearChat = async () => {
  if (currentSessionId.value) {
    try {
      await apiFetch(`/runs/session/${currentSessionId.value}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
    } catch (err) {
      console.error('Failed to clear session on backend:', err)
    }
  }
  messages.value = []
  saveMessages()
  if (agent.value) {
    clearSessionId(agent.value.id)
  }
  currentSessionId.value = null
}

const tabs = [
  { id: 'prompt', label: 'Системный промпт', icon: Sparkles },
  { id: 'channels', label: 'Каналы', icon: Radio },
  { id: 'connections', label: 'Подключения', icon: Link },
  { id: 'knowledge', label: 'База знаний', icon: Database },
  { id: 'model', label: 'Модель', icon: Cpu },
  { id: 'settings', label: 'Настройки', icon: Settings },
  { id: 'chat', label: 'Чат', icon: MessageSquare },
]

// Form data
const form = ref({
  name: '',
  system_prompt: '',
  model: '',
  status: 'draft' as AgentStatus,
  llm_params: {
    temperature: 0.7,
    max_tokens: 1000
  }
})

const dataSourceHints = [
  { field: 'serviceIds', endpoint: '/api/v2/booking/service' },
  { field: 'resourceId', endpoint: '/api/v2/resource' },
  { field: 'datetime', endpoint: '/api/v2/resource/{resourceId}/time' },
  { field: 'clientPhone', endpoint: '/api/v2/client/phone/{PHONE}' }
]

const sqnsToolsList = computed(() => {
  const tools = sqnsStatus.value?.sqnsTools ?? []
  const nameMap: Record<string, string> = {
    'sqns_list_resources': 'Сотрудники',
    'sqns_list_services': 'Услуги',
    'sqns_find_client': 'Поиск клиента',
    'sqns_list_slots': 'Поиск слотов'
  }
  return tools.map(tool => ({
    ...tool,
    displayName: nameMap[tool.name] || tool.name
  }))
})
const isSqnsEnabled = computed(() => sqnsStatus.value?.sqnsEnabled ?? false)
const sqnsStatusLabel = computed(() => {
  if (!sqnsStatus.value?.sqnsEnabled) return 'SQNS не подключён'
  if (sqnsStatus.value?.sqnsStatus === 'error') return 'Обнаружена ошибка'
  return 'Интеграция активна'
})
const sqnsHostLabel = computed(() => sqnsStatus.value?.sqnsHost ?? 'не указан')
const sqnsErrorMessage = computed(() => sqnsStatus.value?.sqnsError ?? '')
const sqnsStatusTone = computed(() =>
  sqnsStatus.value?.sqnsStatus === 'error' ? 'text-red-600' : 'text-emerald-600'
)
const formattedSqnsSyncAt = computed(() => {
  const raw = sqnsStatus.value?.sqnsLastSyncAt
  if (!raw) return 'нет синхронизаций'
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  return parsed.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
})

const loadSqnsStatusForAgent = async () => {
  if (!agent.value) return
  try {
    await fetchSqnsStatus(agent.value.id)
  } catch (err: any) {
    if (err.statusCode === 404) {
      // SQNS not configured yet, this is expected
      return
    }
    console.error('Failed to load SQNS status:', err)
  }
}

const ensureSqnsHints = async () => {
  if (sqnsHintsLoaded.value || !agent.value || !isSqnsEnabled.value) return
  try {
    await Promise.all([
      fetchSqnsResources(agent.value.id),
      fetchSqnsServices(agent.value.id)
    ])
    sqnsHintsLoaded.value = true
  } catch (err: any) {
    if (err.statusCode === 400 || err.statusCode === 404) {
      // Likely SQNS not fully configured or active
      return
    }
    console.error('Failed to load SQNS hints:', err)
  }
}

const handleSqnsSubmit = async (payload: {
  email: string
  password: string
  defaultResourceId?: number
}) => {
  if (!agent.value) return
  isSqnsSubmitting.value = true
  try {
    await enableSqns(agent.value.id, {
      host: 'crmexchange.1denta.ru',
      email: payload.email,
      password: payload.password,
      defaultResourceId: payload.defaultResourceId
    })
    await loadSqnsStatusForAgent()
    showSqnsModal.value = false
  } catch (err: any) {
    console.error('Ошибка включения SQNS:', sqnsError.value ?? err.message ?? '')
  } finally {
    isSqnsSubmitting.value = false
  }
}

const handleSqnsDisable = async () => {
  if (!agent.value) return
  try {
    await disableSqns(agent.value.id)
    await loadSqnsStatusForAgent()
  } catch (err: any) {
    console.error('Ошибка отключения SQNS:', err.message || '')
  }
}

const fetchChannels = async () => {
  if (!agent.value) return
  loadingChannels.value = true
  console.log('🔌 Fetching active channels for agent:', agent.value.id)
  try {
    const channels = await apiFetch<any[]>(`/agents/${agent.value.id}/channels/active`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    console.log('🔌 Active channels response:', channels)
    const tg = channels.find((ch: any) => ch.type === 'telegram')
    console.log('🔌 Telegram channel:', tg)
    telegramChannel.value = tg ? {
      id: tg.id,
      bot_token: tg.telegram_bot_token,
      webhook_enabled: tg.telegram_webhook_enabled,
      webhook_endpoint: tg.telegram_webhook_endpoint
    } : null
  } catch (err: any) {
    console.error('❌ Failed to fetch channels:', err)
    telegramChannel.value = null
  } finally {
    loadingChannels.value = false
  }
}

const handleChannelSaved = async () => {
  await fetchChannels()
  showChannelEditSheet.value = false
  toastSuccess('Канал обновлён', 'Настройки Telegram успешно сохранены')
}

const handleChannelDeleted = async () => {
  telegramChannel.value = null
  showChannelEditSheet.value = false
  toastSuccess('Канал удалён', 'Подключение Telegram отключено')
}

watch(activeTab, (newTab) => {
  if (newTab === 'connections') {
    fetchToolsData()
    loadSqnsStatusForAgent()
    ensureSqnsHints()
  }
  if (newTab === 'channels') {
    fetchChannels()
  }
})

// Load agent data
onMounted(async () => {
  const agentId = route.params.id as string

  if (!agentId) {
    loading.value = false
    return
  }

  try {
    const agentData = await getAgent(agentId)
    agent.value = agentData

    const storedSession = getSessionId(agentData.id)
    if (storedSession) {
      currentSessionId.value = storedSession
    }

    // Populate form
    form.value = {
      name: agentData.name,
      system_prompt: agentData.system_prompt,
      model: agentData.model,
      status: agentData.status,
      llm_params: {
        temperature: agentData.llm_params?.temperature ?? 0.7,
        max_tokens: agentData.llm_params?.max_tokens ?? 1000
      }
    }
    
    // Only load SQNS status if we are on the connections tab
    if (activeTab.value === 'connections') {
      await loadSqnsStatusForAgent()
    }
    
    // Load tools data for the prompt dropdown
    await fetchToolsData()
    await loadSqnsStatusForAgent()
    
    // Load channels data
    await fetchChannels()
    
    // Load persisted messages
    loadMessages()
    await scrollToBottom()
  } catch (err: any) {
    console.error('Ошибка загрузки агента:', err.message || '')
  } finally {
    loading.value = false
  }
})

// Handle save
const handleSave = async () => {
  if (!agent.value) return

  try {
    saving.value = true
    await updateAgent(agent.value.id, form.value)
    
    // Обновляем данные агента после сохранения
    const updatedAgent = await getAgent(agent.value.id)
    agent.value = updatedAgent
    
    toastSuccess('Изменения сохранены', 'Агент успешно обновлен')
  } catch (err: any) {
    console.error('Ошибка сохранения агента:', err.message || '')
    toastError('Ошибка сохранения', err.message || 'Не удалось сохранить изменения')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.push('/agents')
}

const handleDelete = async () => {
  if (!agent.value || !confirm('Вы уверены, что хотите удалить этого агента?')) return

  try {
    deleting.value = true
    await deleteAgent(agent.value.id)
    router.push('/agents')
  } catch (err: any) {
    console.error('Ошибка при удалении:', err.message)
  } finally {
    deleting.value = false
  }
}

// Handle authentication
const handleAuthenticated = () => {
  showAuthModal.value = false
  window.location.reload()
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.markdown-content :deep(p) {
  margin-bottom: 0.5rem;
}
.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-content :deep(ul), .markdown-content :deep(ol) {
  margin-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.markdown-content :deep(ul) {
  list-style-type: disc;
}
.markdown-content :deep(ol) {
  list-style-type: decimal;
}
.markdown-content :deep(code) {
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}
.markdown-content :deep(pre) {
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}
.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}
</style>
