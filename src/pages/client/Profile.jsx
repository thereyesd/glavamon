import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Profile() {
  const { currentUser, userProfile, logout, updateUserProfile, isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || ''
  })

  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      toast.success('Sesión cerrada')
      navigate('/login')
    } catch (error) {
      console.error(error)
      toast.error('Error al cerrar sesión')
    }
  }

  async function handleSave() {
    setLoading(true)
    try {
      await updateUserProfile(formData)
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch (error) {
      console.error(error)
      toast.error('Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h1 className="text-white text-lg font-bold">Mi Perfil</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={loading}
            className="text-primary text-sm font-medium"
          >
            {loading ? <LoadingSpinner size="sm" /> : editing ? 'Guardar' : 'Editar'}
          </button>
        </div>
      </header>

      {/* Profile Card */}
      <div className="p-4">
        <div className="bg-surface-dark rounded-2xl p-6 border border-surface-border">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div
                className="size-24 rounded-full bg-cover bg-center bg-surface-highlight"
                style={{
                  backgroundImage: userProfile?.photoURL
                    ? `url("${userProfile.photoURL}")`
                    : 'none'
                }}
              >
                {!userProfile?.photoURL && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400 text-[48px]">person</span>
                  </div>
                )}
              </div>
              {isAdmin() && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ADMIN
                </div>
              )}
            </div>
            <h2 className="text-white text-xl font-bold">{userProfile?.name || 'Usuario'}</h2>
            <p className="text-gray-400 text-sm">{currentUser.email}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre completo
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl bg-background-dark border border-surface-border text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              ) : (
                <p className="text-white py-3">{userProfile?.name || '-'}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <p className="text-white py-3">{currentUser.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Teléfono
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+34 600 000 000"
                  className="w-full h-12 px-4 rounded-xl bg-background-dark border border-surface-border text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              ) : (
                <p className="text-white py-3">{userProfile?.phone || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="mt-6 bg-surface-dark rounded-2xl border border-surface-border overflow-hidden">
          <MenuOption
            icon="calendar_month"
            label="Mis Citas"
            onClick={() => navigate('/my-bookings')}
          />
          <MenuOption
            icon="notifications"
            label="Notificaciones"
            onClick={() => toast('Próximamente')}
          />
          <MenuOption
            icon="help"
            label="Ayuda"
            onClick={() => toast('Próximamente')}
          />
          <MenuOption
            icon="description"
            label="Términos y Condiciones"
            onClick={() => toast('Próximamente')}
          />
          {isAdmin() && (
            <MenuOption
              icon="admin_panel_settings"
              label="Panel de Administración"
              onClick={() => navigate('/admin')}
              highlight
            />
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 h-14 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>

        {/* Version */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Glavamon v1.0.0
        </p>
      </div>
    </div>
  )
}

function MenuOption({ icon, label, onClick, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 border-b border-surface-border/50 last:border-0 transition-colors ${
        highlight ? 'bg-primary/5' : 'hover:bg-surface-highlight/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${highlight ? 'text-primary' : 'text-gray-400'}`}>
          {icon}
        </span>
        <span className={`font-medium ${highlight ? 'text-primary' : 'text-white'}`}>{label}</span>
      </div>
      <span className="material-symbols-outlined text-gray-600">chevron_right</span>
    </button>
  )
}
