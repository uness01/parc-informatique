'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Monitor, Lock, Mail, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }

      if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      // NextAuth throws when NEXTAUTH_URL is unset and returns a relative URL.
      // The cookie is still set on success — let the middleware sort it out.
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-900 via-green-800 to-green-950 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-4 border-white" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border-4 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-white" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur">
            <Monitor size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Gestion du Parc Informatique</h1>
          <div className="w-16 h-1 bg-green-400 mx-auto mb-4" />
          <p className="text-green-200 text-sm leading-relaxed">
            Ministère de la Transition Énergétique<br />
            et du Développement Durable
          </p>
          <p className="text-green-300 text-xs mt-4 font-medium">Royaume du Maroc</p>
        </div>
        <div className="absolute bottom-6 text-green-500 text-xs">
          © {new Date().getFullYear()} — Direction des Systèmes d'Information
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-green-800 flex items-center justify-center mx-auto mb-3">
              <Monitor size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Gestion du Parc Informatique</h2>
            <p className="text-xs text-gray-500 mt-1">Ministère de la Transition Énergétique et du Développement Durable</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
            <p className="text-gray-500 text-sm mb-6">Entrez vos identifiants pour accéder à la plateforme.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Adresse email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-9"
                    placeholder="exemple@mem.gov.ma"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-9 pr-9"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Accès réservé au personnel autorisé.
          </p>
        </div>
      </div>
    </div>
  )
}
