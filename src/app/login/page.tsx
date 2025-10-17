'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Package, User, ArrowRight, AlertCircle } from 'lucide-react'

interface UserData {
  email: string
  password: string
  name: string
  trackingCode: string
  createdAt: string
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const generateTrackingCode = (): string => {
    const prefix = 'TRK-'
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return prefix + result
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    // Senha deve ter pelo menos 6 caracteres
    return password.length >= 6
  }

  const getStoredUsers = (): UserData[] => {
    const users = localStorage.getItem('registeredUsers')
    return users ? JSON.parse(users) : []
  }

  const saveUser = (userData: UserData) => {
    const users = getStoredUsers()
    users.push(userData)
    localStorage.setItem('registeredUsers', JSON.stringify(users))
  }

  const findUser = (email: string, password: string): UserData | null => {
    const users = getStoredUsers()
    return users.find(user => user.email === email && user.password === password) || null
  }

  const emailExists = (email: string): boolean => {
    const users = getStoredUsers()
    return users.some(user => user.email === email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validações básicas
    if (!validateEmail(email)) {
      setError('Por favor, ingresa un email válido')
      setIsLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (isLogin) {
      // LOGIN - Verificar credenciais
      const user = findUser(email, password)
      
      if (user) {
        // Login bem-sucedido
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userName', user.name)
        localStorage.setItem('trackingCode', user.trackingCode)
        localStorage.setItem('orderCreatedAt', user.createdAt)
        router.push('/tracking')
      } else {
        // Credenciais inválidas
        setError('Email o contraseña inválidos')
      }
    } else {
      // REGISTRO - Criar nova conta
      if (!name.trim()) {
        setError('Por favor, ingresa tu nombre completo')
        setIsLoading(false)
        return
      }

      if (emailExists(email)) {
        setError('Este email ya está registrado. Intenta iniciar sesión.')
        setIsLoading(false)
        return
      }

      // Criar nova conta
      const newCode = generateTrackingCode()
      const newUser: UserData = {
        email,
        password,
        name: name.trim(),
        trackingCode: newCode,
        createdAt: new Date().toISOString()
      }

      saveUser(newUser)
      setTrackingCode(newCode)
      
      // Salvar dados da sessão atual
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userName', name.trim())
      localStorage.setItem('trackingCode', newCode)
      localStorage.setItem('orderCreatedAt', newUser.createdAt)
    }

    setIsLoading(false)
  }

  const handleGoToTracking = () => {
    router.push('/tracking')
  }

  // Se acabou de criar conta, mostrar código gerado
  if (trackingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
              alt="Mercado Envios" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900">¡Cuenta Creada con Éxito!</h1>
            <p className="text-slate-600">Tu código de rastreo ha sido generado</p>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-lime-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Tu Código de Rastreo
            </h2>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <div className="text-3xl font-mono font-bold text-blue-900 mb-2">
                {trackingCode}
              </div>
              <p className="text-sm text-slate-600">
                Guarda este código para rastrear tu pedido
              </p>
            </div>

            <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-lime-800">
                <strong>Estado Inicial:</strong> Tu pedido está en análisis.
              </p>
              <p className="text-xs text-lime-600 mt-1">
                Recibirás actualizaciones automáticas cada 8 horas
              </p>
            </div>

            <button
              onClick={handleGoToTracking}
              className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Rastrear Mi Pedido</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
            alt="Mercado Envios" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Accede a tu Cuenta' : 'Crea tu Cuenta'}
          </h1>
          <p className="text-slate-600">
            {isLogin 
              ? 'Ingresa para rastrear tus pedidos' 
              : 'Regístrate y recibe tu código de rastreo'
            }
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder="Ingresa tu e-mail"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder={isLogin ? "Ingresa tu contraseña" : "Mínimo 6 caracteres"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isLogin ? 'Verificando...' : 'Creando cuenta...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Ingresar' : 'Crear Cuenta'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setName('')
                }}
                className="ml-2 text-blue-900 hover:text-blue-700 font-semibold transition-colors"
              >
                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">¿Cómo funciona?</h3>
              <p className="text-xs text-blue-700 mt-1">
                {isLogin 
                  ? 'Inicia sesión con tu email y contraseña para acceder al rastreo de tus pedidos existentes.'
                  : 'Al crear tu cuenta con email y contraseña válidos, recibirás un código único para rastrear tu pedido en tiempo real.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}