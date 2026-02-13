<template>
  <div class="h-full">
    <AgentFunctionsPanel :agent-id="route.params.id as string" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AgentFunctionsPanel from '~/components/agents/AgentFunctionsPanel.vue'

const route = useRoute()

definePageMeta({
  layout: 'agent' as any,
  middleware: 'auth'
})
</script>
