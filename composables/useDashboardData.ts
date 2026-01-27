import { ref } from 'vue'

type DashboardMetric = {
  id: string
  title: string
  value: string
  description: string
  trend?: string
  type: 'positive' | 'negative' | 'info' | 'warning' | 'neutral'
  icon: string
}

type ChartDataset = {
  label?: string
  data: number[]
  backgroundColor: string | string[]
  borderWidth?: number
}

type ChartData = {
  labels: string[]
  datasets: ChartDataset[]
}

type DashboardData = {
  kpiMetrics: DashboardMetric[]
  conversionMetrics: DashboardMetric[]
  charts: {
    entryDynamics: ChartData
    messageDistribution: ChartData
  }
}

const buildDashboardData = (): DashboardData => ({
  kpiMetrics: [
    {
      id: 'created',
      title: 'Создано записей',
      value: '245',
      description: 'Новых записей на прием',
      trend: 'Успешно',
      type: 'positive',
      icon: 'Calendar'
    },
    {
      id: 'cancelled',
      title: 'Отменено записей',
      value: '123',
      description: 'Отмененных записей',
      trend: 'Отслеживается',
      type: 'negative',
      icon: 'XCircle'
    },
    {
      id: 'net',
      title: 'Чистый результат',
      value: '+122',
      description: 'Создано минус отменено',
      trend: 'Положительный',
      type: 'info',
      icon: 'BarChart2'
    },
    {
      id: 'goals',
      title: 'Выполнено целей',
      value: '368',
      description: 'Успешных операций агента',
      trend: 'Достигнуто',
      type: 'warning',
      icon: 'Target'
    }
  ],
  conversionMetrics: [
    {
      id: 'cr-consultation',
      title: 'CR записи на консультации',
      value: '59%',
      description: 'Конверсия записанных пациентов на консультации к специалистам',
      icon: 'UserCheck',
      type: 'positive'
    },
    {
      id: 'cr-complex',
      title: 'CR записи на комплексы',
      value: '44%',
      description: 'Конверсия записанных пациентов на комплексные услуги',
      icon: 'Layers',
      type: 'negative'
    },
    {
      id: 'cr-total',
      title: 'CR записи',
      value: '69%',
      description: '% записи от общего числа обращений',
      icon: 'FileText',
      type: 'info'
    },
    {
      id: 'cr-refusal',
      title: 'CR отказов',
      value: '23%',
      description: '% отказов от общего числа обращений',
      icon: 'UserX',
      type: 'warning'
    }
  ],
  charts: {
    entryDynamics: {
      labels: ['11.11', '14.11', '17.11', '20.11', '23.11', '26.11', '29.11', '02.12', '05.12', '08.12'],
      datasets: [
        {
          label: 'Создано',
          data: [3, 6, 1, 7, 7, 3, 2, 9, 9, 3],
          backgroundColor: '#F06292'
        },
        {
          label: 'Отменено',
          data: [2, 1, 3, 2, 6, 2, 2, 1, 1, 3],
          backgroundColor: '#FFD54F'
        },
        {
          label: 'Чистый',
          data: [1, 5, -2, 5, 1, 1, 0, 8, 8, 0],
          backgroundColor: '#4DB6AC'
        }
      ]
    },
    messageDistribution: {
      labels: ['Клиенты', 'Агент', 'Менеджер'],
      datasets: [
        {
          data: [34.57, 33.04, 32.39],
          backgroundColor: ['#FF7043', '#26A69A', '#37474F'],
          borderWidth: 0
        }
      ]
    }
  }
})

export const useDashboardData = async () => {
  const data = ref<DashboardData | null>(null)
  const pending = ref(true)
  const error = ref<Error | null>(null)

  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0))
    data.value = buildDashboardData()
  } catch (err) {
    error.value = err as Error
  } finally {
    pending.value = false
  }

  return {
    data,
    pending,
    error
  }
}
