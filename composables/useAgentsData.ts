export interface Agent {
  id: number
  name: string
  icon: string
  color: string
  borderColor: string
  status: string
  statusColor: string
  description: string
  capabilities: string[]
  stats: Array<{ value: string; label: string }>
  detailedStats: Array<{ value: string; label: string }>
}

export const useAgentsData = () => {
  const agents = ref<Agent[]>([
    {
      id: 1,
      name: 'Агент Записи',
      icon: 'UserCheck',
      color: 'from-sky-500 to-cyan-500',
      borderColor: 'border-sky-100',
      status: 'Активен',
      statusColor: 'text-green-600',
      description: 'Специализируется на записи и обработке медицинских данных пациентов. Автоматически структурирует информацию о приемах, диагнозах и назначениях.',
      capabilities: ['Запись данных', 'Структурирование', 'Валидация', 'Экспорт'],
      stats: [
        { value: '1,284', label: 'Запросов' },
        { value: '98%', label: 'Успешно' }
      ],
      detailedStats: [
        { value: '1,284', label: 'Обработано запросов' },
        { value: '98%', label: 'Точность распознавания' },
        { value: '2.3s', label: 'Среднее время ответа' },
        { value: '156', label: 'Пациентов сегодня' }
      ]
    },
    {
      id: 2,
      name: 'Агент Диагностики',
      icon: 'Activity',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-100',
      status: 'Активен',
      statusColor: 'text-green-600',
      description: 'Интеллектуальный помощник для предварительной диагностики. Анализирует симптомы, предлагает возможные диагнозы и рекомендует дополнительные исследования.',
      capabilities: ['Анализ симптомов', 'Диагностика', 'Рекомендации', 'Мониторинг'],
      stats: [
        { value: '892', label: 'Запросов' },
        { value: '95%', label: 'Успешно' }
      ],
      detailedStats: [
        { value: '892', label: 'Диагностических случаев' },
        { value: '95%', label: 'Точность диагнозов' },
        { value: '4.1s', label: 'Время анализа' },
        { value: '67', label: 'Критических случаев' }
      ]
    },
    {
      id: 3,
      name: 'Агент Документации',
      icon: 'FileCheck',
      color: 'from-emerald-500 to-cyan-500',
      borderColor: 'border-emerald-100',
      status: 'Активен',
      statusColor: 'text-green-600',
      description: 'Отвечает за создание и управление медицинской документацией. Генерирует отчеты, выписки и другие официальные документы.',
      capabilities: ['Генерация документов', 'Шаблоны', 'Подписи', 'Архив'],
      stats: [
        { value: '671', label: 'Запросов' },
        { value: '100%', label: 'Успешность' }
      ],
      detailedStats: [
        { value: '671', label: 'Создано документов' },
        { value: '100%', label: 'Успешность' },
        { value: '1.8s', label: 'Время генерации' },
        { value: '45', label: 'Отчетов сегодня' }
      ]
    }
  ])

  return {
    agents: readonly(agents)
  }
}