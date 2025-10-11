export interface TrackingStep {
  id: number
  title: string
  description: string
  location: string
  timestamp: string
  status: 'completed' | 'current' | 'pending' | 'retention'
  icon: any
}

export interface TrackingData {
  code: string
  status: string
  currentStep: number
  estimatedDelivery: string
  steps: TrackingStep[]
  isRetained: boolean
  retentionStartTime?: string
}

export interface Order {
  id: string
  trackingCode: string
  customerEmail: string
  status: 'analysis' | 'confirmed' | 'transit' | 'retained' | 'delivered' | 'paid'
  createdAt: string
  retentionStarted?: string
  paymentAmount?: number
  currentStep: number
  estimatedDelivery: string
}

export interface AdminStats {
  totalOrders: number
  retainedOrders: number
  paidAccelerations: number
  totalRevenue: number
}

export interface TrackingMessage {
  id: number
  timeRange: string
  title: string
  message: string
  location: string
  isRetention?: boolean
}

// 9 etapas específicas do sistema de rastreamento
export const TRACKING_MESSAGES: TrackingMessage[] = [
  {
    id: 1,
    timeRange: '0h',
    title: 'Pedido em Análise',
    message: 'Seu pedido está em análise.',
    location: 'Centro de Processamento'
  },
  {
    id: 2,
    timeRange: '4h',
    title: 'Pedido Confirmado',
    message: 'Seu pedido foi confirmado.',
    location: 'Centro de Distribuição'
  },
  {
    id: 3,
    timeRange: '8h',
    title: 'Trânsito Internacional',
    message: 'Seu pedido saiu para trânsito internacional.',
    location: 'Aeroporto Internacional'
  },
  {
    id: 4,
    timeRange: '32h',
    title: 'Aguardando Liberação na Alfândega',
    message: 'Seu pedido está aguardando liberação na alfândega.',
    location: 'Alfândega Internacional',
    isRetention: true
  },
  {
    id: 5,
    timeRange: '40h',
    title: 'Análise em Andamento',
    message: 'A análise do seu pedido na alfândega está em andamento.',
    location: 'Alfândega Nacional'
  },
  {
    id: 6,
    timeRange: '48h',
    title: 'Liberado da Alfândega',
    message: 'Seu pedido foi liberado da alfândega.',
    location: 'Alfândega Nacional'
  },
  {
    id: 7,
    timeRange: '56h',
    title: 'A Caminho do País',
    message: 'Seu pedido está a caminho do seu país.',
    location: 'Em Trânsito Nacional'
  },
  {
    id: 8,
    timeRange: '64h',
    title: 'Chegou ao País',
    message: 'Seu pedido chegou ao seu país de destino.',
    location: 'Centro de Distribuição Nacional'
  },
  {
    id: 9,
    timeRange: '72h',
    title: 'Prestes a Chegar',
    message: 'Seu pedido está prestes a chegar!',
    location: 'Centro de Distribuição Local'
  }
]

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  trackingCode: string
  orderCreatedAt: string
}