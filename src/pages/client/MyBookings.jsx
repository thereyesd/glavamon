import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserBookings, cancelBooking } from '../../services/bookingService'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import LoadingSpinner, { SkeletonList } from '../../components/common/LoadingSpinner'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // 'upcoming', 'past', 'all'
  const [cancellingId, setCancellingId] = useState(null)

  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    loadBookings()
  }, [currentUser])

  async function loadBookings() {
    try {
      const data = await getUserBookings(currentUser.uid)
      setBookings(data)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Error al cargar las citas')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(bookingId) {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) return

    setCancellingId(bookingId)
    try {
      await cancelBooking(bookingId)
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
      toast.success('Cita cancelada')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Error al cancelar la cita')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'upcoming') {
      return booking.date && !isPast(booking.date) && booking.status !== 'cancelled' && booking.status !== 'completed'
    }
    if (filter === 'past') {
      return (booking.date && isPast(booking.date)) || booking.status === 'completed'
    }
    return true
  })

  // Count bookings needing attention
  const pendingPaymentCount = bookings.filter(b => b.status === 'pending_payment').length

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
          <h1 className="text-white text-lg font-bold">Mis Citas</h1>
          <button
            onClick={loadBookings}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">refresh</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex px-4 pb-3 gap-2">
          {[
            { key: 'upcoming', label: 'Próximas', badge: pendingPaymentCount },
            { key: 'past', label: 'Pasadas' },
            { key: 'all', label: 'Todas' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-primary text-background-dark'
                  : 'bg-surface-dark text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {loading ? (
          <SkeletonList count={3} />
        ) : filteredBookings.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                cancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function BookingCard({ booking, onCancel, cancelling }) {
  const navigate = useNavigate()

  const statusConfig = {
    pending_payment: { label: 'Subir comprobante', color: 'bg-orange-500/20 text-orange-400', icon: 'upload' },
    pending_confirmation: { label: 'Verificando pago', color: 'bg-blue-500/20 text-blue-400', icon: 'hourglass_top' },
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', icon: 'schedule' },
    confirmed: { label: 'Confirmada', color: 'bg-primary/20 text-primary', icon: 'check_circle' },
    completed: { label: 'Completada', color: 'bg-gray-500/20 text-gray-400', icon: 'done_all' },
    cancelled: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400', icon: 'cancel' }
  }

  const status = statusConfig[booking.status] || statusConfig.pending
  const isPastBooking = (booking.date && isPast(booking.date)) || booking.status === 'completed' || booking.status === 'cancelled'
  const canCancel = !isPastBooking && booking.status !== 'cancelled'
  const needsPaymentProof = booking.status === 'pending_payment'

  function getDateLabel() {
    if (!booking.date) return 'Sin fecha'
    try {
      if (isToday(booking.date)) return 'Hoy'
      if (isTomorrow(booking.date)) return 'Mañana'
      return format(booking.date, "EEEE, d 'de' MMMM", { locale: es })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha inválida'
    }
  }

  function handleUploadProof() {
    navigate('/upload-payment', {
      state: {
        bookingId: booking.id,
        totalPrice: booking.totalPrice
      }
    })
  }

  return (
    <div className={`bg-surface-dark rounded-xl border overflow-hidden ${
      needsPaymentProof ? 'border-orange-500/50' : isPastBooking ? 'border-surface-border/30 opacity-70' : 'border-surface-border'
    }`}>
      {/* Alert for pending payment */}
      {needsPaymentProof && (
        <div className="bg-orange-500/20 px-4 py-2 flex items-center gap-2 border-b border-orange-500/30">
          <span className="material-symbols-outlined text-orange-400 text-[18px]">warning</span>
          <span className="text-orange-300 text-sm font-medium">Sube tu comprobante para confirmar</span>
        </div>
      )}

      {/* Pending confirmation alert */}
      {booking.status === 'pending_confirmation' && (
        <div className="bg-blue-500/20 px-4 py-2 flex items-center gap-2 border-b border-blue-500/30">
          <span className="material-symbols-outlined text-blue-400 text-[18px]">hourglass_top</span>
          <span className="text-blue-300 text-sm font-medium">Verificando tu pago...</span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white font-bold text-base capitalize">{getDateLabel()}</p>
            <p className="text-gray-400 text-sm">{booking.timeSlot}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
            <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
            {status.label}
          </span>
        </div>

        {/* Services */}
        <div className="mb-3">
          {(booking.services || []).map((service, idx) => (
            <div key={idx} className="flex justify-between items-center py-1">
              <span className="text-white text-sm">{service.name}</span>
              <span className="text-primary text-sm font-medium">${(service.price || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Stylist */}
        <div className="flex items-center gap-3 py-3 border-t border-surface-border/50">
          <div className="size-10 rounded-full bg-surface-highlight flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400">person</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{booking.stylistName}</p>
            <p className="text-gray-500 text-xs">Profesional</p>
          </div>
        </div>

        {/* Payment rejection reason */}
        {booking.paymentRejectionReason && (
          <div className="mb-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-red-400 text-xs">
              <span className="font-medium">Comprobante rechazado:</span> {booking.paymentRejectionReason || 'Por favor sube un nuevo comprobante'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-border/50">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-white font-bold">${(booking.totalPrice || 0).toFixed(2)}</p>
          </div>

          <div className="flex gap-2">
            {needsPaymentProof && (
              <button
                onClick={handleUploadProof}
                className="px-4 py-2 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary-hover transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                Subir comprobante
              </button>
            )}

            {canCancel && !needsPaymentProof && (
              <button
                onClick={() => onCancel(booking.id)}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {cancelling ? <LoadingSpinner size="sm" /> : 'Cancelar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ filter }) {
  const messages = {
    upcoming: {
      icon: 'calendar_month',
      title: 'No tienes citas próximas',
      subtitle: 'Reserva tu próxima cita ahora'
    },
    past: {
      icon: 'history',
      title: 'No tienes citas pasadas',
      subtitle: 'Tu historial aparecerá aquí'
    },
    all: {
      icon: 'event_busy',
      title: 'No tienes citas',
      subtitle: 'Reserva tu primera cita'
    }
  }

  const msg = messages[filter]

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="size-20 rounded-full bg-surface-dark flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-gray-600 text-[40px]">{msg.icon}</span>
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{msg.title}</h3>
      <p className="text-gray-400 text-sm mb-6">{msg.subtitle}</p>
      <Link
        to="/"
        className="h-12 px-6 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl transition-all active:scale-[0.98] flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Nueva Reserva
      </Link>
    </div>
  )
}
