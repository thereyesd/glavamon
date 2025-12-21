import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email) {
      toast.error('Por favor ingresa tu email')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Email enviado correctamente')
    } catch (error) {
      console.error(error)
      if (error.code === 'auth/user-not-found') {
        toast.error('No existe una cuenta con este email')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido')
      } else {
        toast.error('Error al enviar el email')
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col bg-background-dark">
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-primary/20 mb-6">
            <span className="material-symbols-outlined text-primary text-[40px]">mark_email_read</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">¡Email enviado!</h1>
          <p className="text-gray-400 text-center mb-8 max-w-xs">
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </p>
          <Link
            to="/login"
            className="h-14 px-8 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-dark">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Back Button */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Volver
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/20 mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">lock_reset</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h1>
          <p className="text-gray-400">
            No te preocupes, te enviaremos instrucciones para restablecerla.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-surface-dark border border-surface-border text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                Enviar instrucciones
                <span className="material-symbols-outlined text-[20px]">send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
