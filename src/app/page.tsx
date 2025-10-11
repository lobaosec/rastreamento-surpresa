'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Truck, Shield, Clock, ArrowRight, CheckCircle, Globe, Users } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se usuário já está logado
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail) {
      router.push('/tracking')
    }
  }, [router])

  const handleGetStarted = () => {
    router.push('/login')
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
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-700 hover:text-blue-900 font-medium transition-colors">Características</a>
              <a href="#how-it-works" className="text-slate-700 hover:text-blue-900 font-medium transition-colors">Cómo Funciona</a>
              <a href="#contact" className="text-slate-700 hover:text-blue-900 font-medium transition-colors">Contacto</a>
              <button
                onClick={handleGetStarted}
                className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Empezar
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Rastreo
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-blue-900"> Profesional</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Rastrea tus pedidos internacionales en tiempo real con actualizaciones automáticas y transparencia total en el proceso de entrega.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Package className="w-6 h-6" />
              <span>Crear Cuenta y Rastrear</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Por qué elegir Mercado Envíos?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia en rastreo de pedidos internacionales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-lime-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Actualizaciones Automáticas</h3>
              <p className="text-slate-600">Recibe actualizaciones cada 8 horas sobre el estado de tu pedido</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Rastreo Global</h3>
              <p className="text-slate-600">Sigue tu pedido desde el origen hasta la entrega final</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Seguridad Total</h3>
              <p className="text-slate-600">Tus datos y pedidos protegidos con encriptación avanzada</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Soporte 24/7</h3>
              <p className="text-slate-600">Equipo especializado disponible para ayudar cuando lo necesites</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Proceso simple y transparente para rastrear tus pedidos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-lime-500 to-lime-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Crea tu Cuenta</h3>
              <p className="text-slate-600">
                Regístrate en nuestra plataforma y recibe instantáneamente tu código de rastreo único
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Rastrea en Tiempo Real</h3>
              <p className="text-slate-600">
                Recibe actualizaciones automáticas cada 8 horas sobre la ubicación y estado de tu pedido
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Recibe tu Pedido</h3>
              <p className="text-slate-600">
                Sigue hasta la entrega final con total transparencia en todo el proceso
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-lime-500 to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-lime-100 mb-8 max-w-2xl mx-auto">
            Crea tu cuenta ahora y recibe tu código de rastreo para seguir tus pedidos
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl mx-auto"
          >
            <Package className="w-6 h-6" />
            <span>Empezar Ahora</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/128eb626-2a45-4198-b5cb-8f099d790ef9.png" 
                alt="Mercado Envios" 
                className="h-8 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-slate-400">
                Rastreo profesional y confiable para tus envíos internacionales.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Mercado Envíos. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}