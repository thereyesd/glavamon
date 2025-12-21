import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const DEFAULT_CONFIG = {
  businessName: 'Glavamon',
  phone: '',
  email: '',
  address: '',
  openTime: '09:00',
  closeTime: '20:00',
  slotDuration: 30,
  daysOff: [0], // Sunday
  currency: 'USD',
  cancellationPolicy: 24 // hours
}

export default function AdminSettings() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const docRef = doc(db, 'businessConfig', 'config')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setConfig({ ...DEFAULT_CONFIG, ...docSnap.data() })
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const docRef = doc(db, 'businessConfig', 'config')
      await setDoc(docRef, config)
      toast.success('Configuración guardada')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function toggleDayOff(day) {
    if (config.daysOff.includes(day)) {
      setConfig(prev => ({
        ...prev,
        daysOff: prev.daysOff.filter(d => d !== day)
      }))
    } else {
      setConfig(prev => ({
        ...prev,
        daysOff: [...prev.daysOff, day]
      }))
    }
  }

  const days = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h1 className="text-white text-lg font-bold">Configuración</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-primary font-medium"
          >
            {saving ? <LoadingSpinner size="sm" /> : 'Guardar'}
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Business Info */}
        <Section title="Información del Negocio" icon="store">
          <InputField
            label="Nombre del Negocio"
            value={config.businessName}
            onChange={v => setConfig(prev => ({ ...prev, businessName: v }))}
            placeholder="Glavamon"
          />
          <InputField
            label="Teléfono"
            value={config.phone}
            onChange={v => setConfig(prev => ({ ...prev, phone: v }))}
            placeholder="+34 600 000 000"
            type="tel"
          />
          <InputField
            label="Email"
            value={config.email}
            onChange={v => setConfig(prev => ({ ...prev, email: v }))}
            placeholder="contacto@beautyflow.com"
            type="email"
          />
          <InputField
            label="Dirección"
            value={config.address}
            onChange={v => setConfig(prev => ({ ...prev, address: v }))}
            placeholder="Calle Principal 123"
          />
        </Section>

        {/* Schedule */}
        <Section title="Horarios" icon="schedule">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Hora de Apertura"
              value={config.openTime}
              onChange={v => setConfig(prev => ({ ...prev, openTime: v }))}
              type="time"
            />
            <InputField
              label="Hora de Cierre"
              value={config.closeTime}
              onChange={v => setConfig(prev => ({ ...prev, closeTime: v }))}
              type="time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Duración de slots (minutos)
            </label>
            <select
              value={config.slotDuration}
              onChange={e => setConfig(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Días de Cierre
            </label>
            <div className="flex gap-2">
              {days.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDayOff(day.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    config.daysOff.includes(day.value)
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-surface-dark text-gray-400 border border-surface-border hover:border-primary/30'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Policies */}
        <Section title="Políticas" icon="policy">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Política de Cancelación
            </label>
            <select
              value={config.cancellationPolicy}
              onChange={e => setConfig(prev => ({ ...prev, cancellationPolicy: parseInt(e.target.value) }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white"
            >
              <option value={2}>2 horas antes</option>
              <option value={6}>6 horas antes</option>
              <option value={12}>12 horas antes</option>
              <option value={24}>24 horas antes</option>
              <option value={48}>48 horas antes</option>
            </select>
            <p className="text-gray-500 text-xs mt-2">
              Los clientes podrán cancelar sin cargo hasta {config.cancellationPolicy} horas antes de su cita.
            </p>
          </div>
        </Section>

        {/* Currency */}
        <Section title="Moneda" icon="payments">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Moneda
            </label>
            <select
              value={config.currency}
              onChange={e => setConfig(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="MXN">MXN ($)</option>
              <option value="COP">COP ($)</option>
              <option value="ARS">ARS ($)</option>
            </select>
          </div>
        </Section>

        {/* Danger Zone */}
        <Section title="Zona de Peligro" icon="warning" danger>
          <p className="text-gray-400 text-sm mb-4">
            Estas acciones son irreversibles. Procede con cuidado.
          </p>
          <button className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-colors">
            Exportar todos los datos
          </button>
        </Section>
      </main>
    </div>
  )
}

function Section({ title, icon, children, danger = false }) {
  return (
    <section className="bg-surface-dark rounded-2xl border border-surface-border p-4">
      <div className={`flex items-center gap-2 mb-4 ${danger ? 'text-red-400' : 'text-primary'}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <h2 className="text-white font-bold">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-xl bg-background-dark border border-surface-border text-white focus:border-primary transition-colors"
      />
    </div>
  )
}
