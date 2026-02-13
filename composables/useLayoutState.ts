export const useLayoutState = () => {
  // useState -- SSR-safe, shared across components (Nuxt auto-import)
  const isCollapsed = useState<boolean>('sidebar-collapsed', () => false)

  // Page title for TopBar (set by pages, consumed by default.vue layout)
  const pageTitle = useState<string>('page-title', () => '')

  // Breadcrumb state for TopBar (set by AgentPageShell, consumed by agent.vue layout)
  const breadcrumbTitle = useState<string>('breadcrumb-title', () => '')
  const breadcrumbAgentName = useState<string>('breadcrumb-agent-name', () => '')

  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
    if (import.meta.client) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
    }
  }

  // Восстановить состояние из localStorage на клиенте
  const initSidebarState = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        isCollapsed.value = saved === 'true'
      }
    }
  }

  return { isCollapsed, toggleSidebar, initSidebarState, pageTitle, breadcrumbTitle, breadcrumbAgentName }
}
