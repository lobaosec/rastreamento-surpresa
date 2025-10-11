'use client'

import { useState, useEffect } from 'react'
import { Package, DollarSign, Clock, AlertTriangle, CheckCircle, Users, TrendingUp, Eye, CreditCard } from 'lucide-react'

interface Order {
  id: string
  trackingCode: string
  customerEmail: string
  status: 'transit' | 'retained' | 'delivered' | 'paid'
  createdAt: string
  retentionStarted?: string
  paymentAmount?: number
  currentStep: number
  estimatedDelivery: string
}

interface Stats {
  totalOrders: number
  retainedOrders: number
  paidAccelerations: number
  totalRevenue: number
}

export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    retainedOrders: 0,
    paidAccelerations: 0,
    totalRevenue: 0
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<'all' | 'transit' | 'retained' | 'paid' | 'delivered'>('all')

  // Simular dados do painel administrativo
  useEffect(() => {
    const generateMockOrders = (): Order[] => {
      const mockOrders: Order[] = []
      const statuses: Order['status'][] = ['transit', 'retained', 'delivered', 'paid']
      
      for (let i = 1; i <= 50; i++) {
        const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        const hoursSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
        
        let status: Order['status'] = 'transit'
        let paymentAmount: number | undefined
        let retentionStarted: string | undefined
        
        if (hoursSinceCreated >= 48) {
          const shouldBeRetained = Math.random() > 0.3
          if (shouldBeRetained) {
            const shouldBePaid = Math.random() > 0.6
            status = shouldBePaid ? 'paid' : 'retained'
            retentionStarted = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000).toISOString()
            if (shouldBePaid) {
              paymentAmount = Math.floor(Math.random() * 200) + 50
            }
          } else {
            status = 'delivered'
          }
        }
        
        mockOrders.push({
          id: `ORD-${String(i).padStart(4, '0')}`,
          trackingCode: `TRK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          customerEmail: `cliente${i}@email.com`,
          status,
          createdAt: createdAt.toISOString(),
          retentionStarted,
          paymentAmount,
          currentStep: Math.min(Math.floor(hoursSinceCreated / 8), 6),
          estimatedDelivery: new Date(createdAt.getTime() + 72 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
        })
      }
      
      return mockOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    const mockOrders = generateMockOrders()
    setOrders(mockOrders)

    // Calcular estatísticas
    const totalOrders = mockOrders.length
    const retainedOrders = mockOrders.filter(o => o.status === 'retained').length
    const paidAccelerations = mockOrders.filter(o => o.status === 'paid').length
    const totalRevenue = mockOrders
      .filter(o => o.paymentAmount)
      .reduce((sum, o) => sum + (o.paymentAmount || 0), 0)

    setStats({
      totalOrders,
      retainedOrders,
      paidAccelerations,
      totalRevenue
    })
  }, [])

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'transit': return 'bg-blue-100 text-blue-800'
      case 'retained': return 'bg-red-100 text-red-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'transit': return 'Em Trânsito'
      case 'retained': return 'Retido'
      case 'paid': return 'Taxa Paga'
      case 'delivered': return 'Entregue'
      default: return 'Desconhecido'
    }
  }

  const handleReleaseOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'paid' as const, paymentAmount: 89.90 }
        : order
    ))
    setSelectedOrder(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
                alt="Mercado Envios" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-slate-900">Painel Administrativo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Admin</span>
              <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Pedidos</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pedidos Retidos</p>
                <p className="text-3xl font-bold text-red-600">{stats.retainedOrders}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Taxas Pagas</p>
                <p className="text-3xl font-bold text-green-600">{stats.paidAccelerations}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Receita Total</p>
                <p className="text-3xl font-bold text-lime-600">R$ {stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-lime-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-lime-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todos', count: orders.length },
              { key: 'transit', label: 'Em Trânsito', count: orders.filter(o => o.status === 'transit').length },
              { key: 'retained', label: 'Retidos', count: orders.filter(o => o.status === 'retained').length },
              { key: 'paid', label: 'Taxa Paga', count: orders.filter(o => o.status === 'paid').length },
              { key: 'delivered', label: 'Entregues', count: orders.filter(o => o.status === 'delivered').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-lime-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Pedidos</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Valor Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{order.id}</div>
                        <div className="text-sm text-slate-500 font-mono">{order.trackingCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {order.paymentAmount ? `R$ ${order.paymentAmount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {order.status === 'retained' && (
                        <button
                          onClick={() => handleReleaseOrder(order.id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  Detalhes do Pedido {selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Código de Rastreamento</label>
                  <p className="font-mono text-sm bg-slate-100 p-2 rounded">{selectedOrder.trackingCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <p className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Cliente</label>
                  <p className="text-sm">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Criado em</label>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                {selectedOrder.retentionStarted && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Retenção iniciada</label>
                    <p className="text-sm">{new Date(selectedOrder.retentionStarted).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                {selectedOrder.paymentAmount && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Valor Pago</label>
                    <p className="text-sm font-semibold text-green-600">R$ {selectedOrder.paymentAmount.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                {selectedOrder.status === 'retained' && (
                  <button
                    onClick={() => handleReleaseOrder(selectedOrder.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Simular Pagamento
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}