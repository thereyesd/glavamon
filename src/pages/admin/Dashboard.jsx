import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getBookingsStats, getTodayBookings } from '../../services/bookingService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [todayBookings, setTodayBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const { userProfile, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadData()
  }, [])

  async function loadData() {
    try {
      const [statsData, todayData] = await Promise.all([
        getBookingsStats(),
        getTodayBookings()
      ])
      setStats(statsData)
      setTodayBookings(todayData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

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
            onClick={() => navigate('/')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h1 className="text-white text-lg font-bold">Panel Admin</h1>
          <div className="size-10" />
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <p className="text-primary text-sm font-medium mb-1">Bienvenido/a</p>
          <h2 className="text-white text-2xl font-bold">{userProfile?.name || 'Admin'}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon="today"
            label="Citas Hoy"
            value={stats?.todayCount || 0}
            color="primary"
          />
          <StatCard
            icon="pending"
            label="Pendientes"
            value={stats?.pendingCount || 0}
            color="yellow"
          />
          <StatCard
            icon="check_circle"
            label="Completadas"
            value={stats?.completedCount || 0}
            color="green"
          />
          <StatCard
            icon="payments"
            label="Ingresos Mes"
            value={`$${stats?.monthRevenue?.toFixed(0) || 0}`}
            color="blue"
          />
        </div>

        {/* Today's Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-bold">Citas de Hoy</h3>
            <Link to="/admin/bookings" className="text-primary text-sm font-medium">
              Ver todas
            </Link>
          </div>

          {todayBookings.length === 0 ? (
            <div className="bg-surface-dark rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-gray-600 text-[48px] mb-2">
                event_available
              </span>
              <p className="text-gray-400">No hay citas programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.slice(0, 5).map(booking => (
                <BookingPreviewCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-white text-lg font-bold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon="calendar_month"
              label="Ver Citas"
              to="/admin/bookings"
            />
            <QuickAction
              icon="spa"
              label="Servicios"
              to="/admin/services"
            />
            <QuickAction
              icon="group"
              label="Estilistas"
              to="/admin/stylists"
            />
            <QuickAction
              icon="settings"
              label="Configuración"
              to="/admin/settings"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    red: 'bg-red-500/10 text-red-400'
  }

  return (
    <div className="bg-surface-dark rounded-xl p-4 border border-surface-border">
      <div className={`size-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  )
}

function BookingPreviewCard({ booking }) {
  const statusColors = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-primary',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500'
  }

  return (
    <div className="bg-surface-dark rounded-xl p-4 border border-surface-border flex items-center gap-4">
      <div className="flex flex-col items-center justify-center bg-background-dark rounded-lg px-3 py-2 min-w-[60px]">
        <span className="text-primary text-lg font-bold">{booking.timeSlot}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{booking.userName}</p>
        <p className="text-gray-400 text-sm truncate">
          {booking.services.map(s => s.name).join(', ')}
        </p>
      </div>
      <div className={`size-3 rounded-full ${statusColors[booking.status]}`} />
    </div>
  )
}

function QuickAction({ icon, label, to }) {
  return (
    <Link
      to={to}
      className="bg-surface-dark rounded-xl p-4 border border-surface-border hover:border-primary/30 transition-all flex flex-col items-center gap-2"
    >
      <span className="material-symbols-outlined text-primary text-[28px]">{icon}</span>
      <span className="text-white text-sm font-medium">{label}</span>
    </Link>
  )
}
