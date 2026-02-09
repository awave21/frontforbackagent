<template>
  <div class="bg-background rounded-md border border-border p-4 sm:p-5 space-y-6">
    <!-- Auto-save indicator -->
    <div class="flex items-center justify-end mb-4">
      <span v-if="store.isAutoSaving" class="flex items-center gap-1.5 text-xs text-blue-600">
        <Loader2 class="h-3 w-3 animate-spin" />
        Сохранение...
      </span>
      <span v-else-if="store.lastAutoSavedAt" class="flex items-center gap-1.5 text-xs text-green-600">
        <Check class="h-3 w-3" />
        Сохранено
      </span>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label class="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Cpu class="w-4 h-4 text-slate-400" />
          Модель ИИ
        </label>
        <select
          v-model="form.model"
          :disabled="!canEditAgents"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <optgroup label="GPT-5 (Рекомендуемые - 2026)">
            <option value="openai:gpt-5.2">GPT-5.2 (Лучшая для кодинга и агентов)</option>
            <option value="openai:gpt-5.2-pro">GPT-5.2 Pro (Умнее и точнее)</option>
            <option value="openai:gpt-5-mini">GPT-5 Mini (Быстрая, экономная)</option>
            <option value="openai:gpt-5-nano">GPT-5 Nano (Самая быстрая)</option>
            <option value="openai:gpt-5.1">GPT-5.1 (Предыдущее поколение)</option>
            <option value="openai:gpt-5">GPT-5 (Стабильная)</option>
          </optgroup>
          
          <optgroup label="GPT-4.1 (Не-reasoning модели)">
            <option value="openai:gpt-4.1">GPT-4.1 (Умная, без рассуждений)</option>
            <option value="openai:gpt-4.1-mini">GPT-4.1 Mini (Быстрая)</option>
            <option value="openai:gpt-4.1-nano">GPT-4.1 Nano (Экономная)</option>
          </optgroup>
          
          <optgroup label="GPT-4o (Легаси)">
            <option value="openai:gpt-4o">GPT-4o (Мультимодальная)</option>
            <option value="openai:gpt-4o-mini">GPT-4o Mini (Быстрая, дешевая)</option>
          </optgroup>
          
          <optgroup label="Reasoning модели">
            <option value="openai:o3">o3 (Сложные задачи)</option>
            <option value="openai:o3-pro">o3 Pro (Больше вычислений)</option>
            <option value="openai:o4-mini">o4 Mini (Быстрые рассуждения)</option>
          </optgroup>
        </select>
      </div>

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
          :disabled="!canEditAgents"
          type="range"
          min="0"
          max="2"
          step="0.1"
          class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
          :disabled="!canEditAgents"
          type="number"
          min="1"
          max="4000"
          class="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-mono disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <p class="text-xs text-slate-500 italic">
          Определяет максимальную длину ответа агента.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Check, Cpu, Database, Loader2, Settings } from 'lucide-vue-next'
import { usePermissions } from '~/composables/usePermissions'
import { useAgentEditorStore } from '~/composables/useAgentEditorStore'

const store = useAgentEditorStore()
const { form } = storeToRefs(store)
const { canEditAgents } = usePermissions()
</script>
