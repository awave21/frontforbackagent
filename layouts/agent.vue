<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Header -->
    <div v-if="!isPromptFullscreen" class="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
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
      <DashboardSidebar :class="isPromptFullscreen ? 'hidden' : 'hidden lg:block'" />

      <div
        v-if="isSidebarOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
        @click="isSidebarOpen = false"
      ></div>

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

      <main class="flex-1 bg-slate-50 p-3 sm:p-4 lg:p-6">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { MenuIcon } from 'lucide-vue-next'
import DashboardSidebar from '~/components/DashboardSidebar.vue'
import { useAgentEditorStore } from '~/composables/useAgentEditorStore'

const isSidebarOpen = ref(false)
const store = useAgentEditorStore()
const { isPromptFullscreen } = storeToRefs(store)
</script>
