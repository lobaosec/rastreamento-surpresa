import { TrackingData, Order, AdminStats, User } from './types'

export function generateTrackingCode(): string {
  const prefix = 'TRK-'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return prefix + result
}

export function calculateOrderStatus(createdAt: Date): {
  hoursSinceCreated: number
  currentStep: number
  isRetained: boolean
  status: 'analysis' | 'confirmed' | 'transit' | 'retained' | 'delivered' | 'paid'
} {
  const now = new Date()
  const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  
  let currentStep = 0
  let status: 'analysis' | 'confirmed' | 'transit' | 'retained' | 'delivered' | 'paid' = 'analysis'
  
  // Determinar etapa baseada no tempo específico
  if (hoursSinceCreated >= 72) {
    currentStep = 9
    status = 'delivered'
  } else if (hoursSinceCreated >= 64) {
    currentStep = 8
    status = 'transit'
  } else if (hoursSinceCreated >= 56) {
    currentStep = 7
    status = 'transit'
  } else if (hoursSinceCreated >= 48) {
    currentStep = 6
    status = 'transit'
  } else if (hoursSinceCreated >= 40) {
    currentStep = 5
    status = 'transit'
  } else if (hoursSinceCreated >= 32) {
    currentStep = 4
    // Entre 32-40h pode estar retido ou ter pago
    const random = Math.random()
    if (random < 0.6) {
      status = 'retained'
    } else {
      status = 'paid'
    }
  } else if (hoursSinceCreated >= 8) {
    currentStep = 3
    status = 'transit'
  } else if (hoursSinceCreated >= 4) {
    currentStep = 2
    status = 'confirmed'
  } else {
    currentStep = 1
    status = 'analysis'
  }
  
  const isRetained = status === 'retained'
  
  return {
    hoursSinceCreated,
    currentStep,
    isRetained,
    status
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function generateMockOrders(count: number = 50): Order[] {
  const orders: Order[] = []
  
  for (let i = 1; i <= count; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    const { currentStep, status } = calculateOrderStatus(createdAt)
    
    const order: Order = {
      id: `ORD-${String(i).padStart(4, '0')}`,
      trackingCode: generateTrackingCode(),
      customerEmail: `cliente${i}@email.com`,
      status,
      createdAt: createdAt.toISOString(),
      currentStep,
      estimatedDelivery: new Date(createdAt.getTime() + 72 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
    }
    
    if (status === 'retained') {
      order.retentionStarted = new Date(createdAt.getTime() + 32 * 60 * 60 * 1000).toISOString()
    }
    
    if (status === 'paid') {
      order.paymentAmount = Math.floor(Math.random() * 200) + 50
      order.retentionStarted = new Date(createdAt.getTime() + 32 * 60 * 60 * 1000).toISOString()
    }
    
    orders.push(order)
  }
  
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function calculateStats(orders: Order[]): AdminStats {
  const totalOrders = orders.length
  const retainedOrders = orders.filter(o => o.status === 'retained').length
  const paidAccelerations = orders.filter(o => o.status === 'paid').length
  const totalRevenue = orders
    .filter(o => o.paymentAmount)
    .reduce((sum, o) => sum + (o.paymentAmount || 0), 0)
  
  return {
    totalOrders,
    retainedOrders,
    paidAccelerations,
    totalRevenue
  }
}

export function getStatusColor(status: Order['status']): string {
  switch (status) {
    case 'analysis': return 'bg-yellow-100 text-yellow-800'
    case 'confirmed': return 'bg-green-100 text-green-800'
    case 'transit': return 'bg-blue-100 text-blue-800'
    case 'retained': return 'bg-red-100 text-red-800'
    case 'paid': return 'bg-purple-100 text-purple-800'
    case 'delivered': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusText(status: Order['status']): string {
  switch (status) {
    case 'analysis': return 'Em Análise'
    case 'confirmed': return 'Confirmado'
    case 'transit': return 'Em Trânsito'
    case 'retained': return 'Retido'
    case 'paid': return 'Taxa Paga'
    case 'delivered': return 'Entregue'
    default: return 'Desconhecido'
  }
}

// Simular envio de notificação automática a cada 8 horas
export function scheduleAutomaticUpdates(trackingCode: string, customerEmail: string): void {
  const createdAt = new Date(localStorage.getItem('orderCreatedAt') || Date.now())
  
  // Simular atualizações automáticas
  const updateIntervals = [4, 8, 32, 40, 48, 56, 64, 72] // horas
  
  updateIntervals.forEach((hours) => {
    const updateTime = new Date(createdAt.getTime() + (hours * 60 * 60 * 1000))
    const now = new Date()
    
    if (updateTime > now) {
      const timeUntilUpdate = updateTime.getTime() - now.getTime()
      
      setTimeout(() => {
        sendTrackingNotification(trackingCode, customerEmail, `Atualização automática: Etapa ${Math.floor(hours / 8) + 1}`)
      }, timeUntilUpdate)
    }
  })
}

// Simular envio de notificação (em produção seria integrado com serviço de email/SMS)
export function sendTrackingNotification(
  trackingCode: string, 
  customerEmail: string, 
  message: string
): Promise<boolean> {
  return new Promise((resolve) => {
    // Simular delay de envio
    setTimeout(() => {
      console.log(`📧 Notificação enviada para ${customerEmail}:`)
      console.log(`📦 Código: ${trackingCode}`)
      console.log(`💬 Mensagem: ${message}`)
      resolve(true)
    }, 1000)
  })
}

// Simular processamento de pagamento (em produção seria integrado com gateway de pagamento)
export function processPayment(
  orderId: string, 
  amount: number, 
  customerEmail: string
): Promise<{ success: boolean; transactionId?: string }> {
  return new Promise((resolve) => {
    // Simular delay de processamento
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% de sucesso
      const result = {
        success,
        transactionId: success ? `TXN-${Date.now()}` : undefined
      }
      
      console.log(`💳 Pagamento processado:`)
      console.log(`📋 Pedido: ${orderId}`)
      console.log(`💰 Valor: ${formatCurrency(amount)}`)
      console.log(`👤 Cliente: ${customerEmail}`)
      console.log(`✅ Status: ${success ? 'Aprovado' : 'Rejeitado'}`)
      
      resolve(result)
    }, 2000)
  })
}

// Gerenciar usuários no localStorage
export function saveUser(user: User): void {
  const users = getUsers()
  const existingIndex = users.findIndex(u => u.email === user.email)
  
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  
  localStorage.setItem('users', JSON.stringify(users))
}

export function getUsers(): User[] {
  const users = localStorage.getItem('users')
  return users ? JSON.parse(users) : []
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers()
  return users.find(u => u.email === email) || null
}