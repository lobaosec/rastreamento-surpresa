'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Package, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (isLogin) {
      // Login - redirecionar para rastreamento
      localStorage.setItem('userEmail', email)
      router.push('/tracking')
    } else {
      // Registro - gerar código e mostrar
      const newCode = generateTrackingCode()
      setTrackingCode(newCode)
      
      // Salvar dados do usuário
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userName', name)
      localStorage.setItem('trackingCode', newCode)
      localStorage.setItem('orderCreatedAt', new Date().toISOString())
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
                  placeholder="Ingresa tu contraseña"
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
                  <span>{isLogin ? 'Ingresando...' : 'Creando cuenta...'}</span>
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
                onClick={() => setIsLogin(!isLogin)}
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
                  ? 'Inicia sesión para acceder al rastreo de tus pedidos existentes.'
                  : 'Al crear tu cuenta, recibirás un código único para rastrear tu pedido en tiempo real.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}