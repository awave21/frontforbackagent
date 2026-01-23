export const useDashboardData = () => {
  const { data, pending, error } = useAsyncData('dashboard', async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      metrics: {
        totalUsers: 12345,
        revenue: 45678,
        orders: 1234,
        conversionRate: 3.24
      },
      charts: {
        revenue: [
          { month: 'Jan', value: 12000 },
          { month: 'Feb', value: 15000 },
          { month: 'Mar', value: 18000 },
          { month: 'Apr', value: 22000 },
          { month: 'May', value: 25000 },
          { month: 'Jun', value: 28000 }
        ],
        users: [
          { month: 'Jan', value: 2000 },
          { month: 'Feb', value: 2500 },
          { month: 'Mar', value: 3000 },
          { month: 'Apr', value: 3500 },
          { month: 'May', value: 4000 },
          { month: 'Jun', value: 4500 }
        ]
      },
      recentActivities: [
        {
          id: 1,
          user: 'John Doe',
          action: 'Created new order',
          time: '2 minutes ago',
          avatar: '/avatars/john.jpg'
        },
        {
          id: 2,
          user: 'Jane Smith',
          action: 'Updated profile',
          time: '5 minutes ago',
          avatar: '/avatars/jane.jpg'
        },
        {
          id: 3,
          user: 'Mike Johnson',
          action: 'Completed payment',
          time: '10 minutes ago',
          avatar: '/avatars/mike.jpg'
        }
      ]
    }
  })

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error)
  }
}