'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Clock, Package, Plane, MapPin, AlertTriangle } from 'lucide-react'

interface Notification {
  id: string
  trackingCode: string
  title: string
  message: string
  timestamp: string
  type: 'info' | 'warning' | 'success' | 'retention'
  icon: any
  read: boolean
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Simular notificações automáticas
  useEffect(() => {
    const generateNotification = (): Notification => {
      const trackingCodes = ['TRK-8A9F1ZP2', 'TRK-NEW2024', 'TRK-RETAIN1', 'TRK-DEMO123']
      const notifications = [
        {
          title: 'Pedido Confirmado',
          message: '¡Tu pedido fue confirmado y ya está en camino!',
          type: 'success' as const,
          icon: Package
        },
        {
          title: 'En Tránsito Internacional',
          message: 'Tu pedido está en tránsito internacional.',
          type: 'info' as const,
          icon: Plane
        },
        {
          title: 'Cerca de Ti',
          message: '¡Tu pedido está a 30 km de ti!',
          type: 'info' as const,
          icon: MapPin
        },
        {
          title: '🚨 PEDIDO RETENIDO',
          message: '¡URGENTE! Tu pedido fue retenido en aduana. ¡Acción necesaria AHORA!',
          type: 'retention' as const,
          icon: AlertTriangle
        }
      ]

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
      const randomTrackingCode = trackingCodes[Math.floor(Math.random() * trackingCodes.length)]

      return {
        id: `notif-${Date.now()}-${Math.random()}`,
        trackingCode: randomTrackingCode,
        ...randomNotification,
        timestamp: new Date().toLocaleString('es-ES'),
        read: false
      }
    }

    // Gerar notificação inicial
    const initialNotification = generateNotification()
    setNotifications([initialNotification])
    setUnreadCount(1)

    // Gerar novas notificações a cada 15 segundos (simulando 8 horas)
    const interval = setInterval(() => {
      const newNotification = generateNotification()
      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Manter apenas 10 notificações
      setUnreadCount(prev => prev + 1)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50'
      case 'info': return 'border-l-blue-500 bg-blue-50'
      case 'warning': return 'border-l-yellow-500 bg-yellow-50'
      case 'retention': return 'border-l-red-500 bg-red-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white rounded-full p-3 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Notificaciones de Rastreo</h3>
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
                onClick={() => setIsOpen(false)}
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
                <p className="text-sm">Las actualizaciones aparecerán aquí</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                      getNotificationColor(notification.type)
                    } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'} ${
                      notification.type === 'retention' ? 'animate-pulse' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'retention' ? 'bg-red-100 animate-bounce' :
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'warning' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          notification.type === 'retention' ? 'text-red-600' :
                          notification.type === 'success' ? 'text-green-600' :
                          notification.type === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-semibold ${
                            notification.type === 'retention' ? 'text-red-800' : 'text-slate-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          notification.type === 'retention' ? 'text-red-700 font-semibold' : 'text-slate-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span className="font-mono">{notification.trackingCode}</span>
                          <span>{notification.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500 text-center">
              💡 Simulación: Las notificaciones reales se enviarían cada 8 horas
            </p>
          </div>
        </div>
      )}
    </div>
  )
}