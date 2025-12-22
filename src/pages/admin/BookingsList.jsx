import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAllBookings, updateBookingStatus, confirmPayment, rejectPayment } from '../../services/bookingService'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatPrice } from '../../utils/formatPrice'
import toast from 'react-hot-toast'
import LoadingSpinner, { SkeletonList } from '../../components/common/LoadingSpinner'

export default function AdminBookingsList() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('activas')
  const [updatingId, setUpdatingId] = useState(null)

  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      const data = await getAllBookings()
      setBookings(data)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(bookingId, newStatus) {
    setUpdatingId(bookingId)
    try {
      await updateBookingStatus(bookingId, newStatus)
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ))
      toast.success('Estado actualizado')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleConfirmPayment(bookingId) {
    setUpdatingId(bookingId)
    try {
      await confirmPayment(bookingId)
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'confirmed', paymentStatus: 'paid' } : b
      ))
      toast.success('Pago confirmado - Cita agendada')
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast.error('Error al confirmar pago')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleRejectPayment(bookingId) {
    const reason = prompt('Motivo del rechazo (opcional):')
    setUpdatingId(bookingId)
    try {
      await rejectPayment(bookingId, reason || '')
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'pending_payment', paymentStatus: 'rejected', paymentProofUrl: null } : b
      ))
      toast.success('Comprobante rechazado')
    } catch (error) {
      console.error('Error rejecting payment:', error)
      toast.error('Error al rechazar')
    } finally {
      setUpdatingId(null)
    }
  }

  // Count pending confirmations
  const pendingConfirmationCount = bookings.filter(b => b.status === 'pending_confirmation').length

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'activas') {
      // Citas activas: pendientes de pago, por confirmar, y confirmadas
      return ['pending_payment', 'pending_confirmation', 'confirmed'].includes(booking.status)
    }
    if (filter === 'today') return booking.date && isToday(booking.date)
    if (filter === 'upcoming') return booking.date && !isPast(booking.date) && !['cancelled', 'pending_payment'].includes(booking.status)
    if (filter === 'pending_confirmation') return booking.status === 'pending_confirmation'
    if (filter === 'pending_payment') return booking.status === 'pending_payment'
    if (filter === 'confirmed') return booking.status === 'confirmed'
    if (filter === 'completed') return booking.status === 'completed'
    if (filter === 'cancelled') return booking.status === 'cancelled'
    return true
  })

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
          <h1 className="text-white text-lg font-bold">Todas las Citas</h1>
          <button
            onClick={loadBookings}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">refresh</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex px-4 pb-3 gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'activas', label: 'Activas' },
            { key: 'pending_confirmation', label: 'Por confirmar', badge: pendingConfirmationCount },
            { key: 'today', label: 'Hoy' },
            { key: 'confirmed', label: 'Confirmadas' },
            { key: 'pending_payment', label: 'Sin pago' },
            { key: 'completed', label: 'Completadas' },
            { key: 'cancelled', label: 'Canceladas' },
            { key: 'all', label: 'Todas' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-primary text-background-dark'
                  : 'bg-surface-dark text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
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
          <SkeletonList count={5} />
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-gray-600 text-[48px] mb-4">
              event_busy
            </span>
            <p className="text-gray-400">No hay citas con este filtro</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <AdminBookingCard
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
                onConfirmPayment={handleConfirmPayment}
                onRejectPayment={handleRejectPayment}
                updating={updatingId === booking.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function AdminBookingCard({ booking, onStatusChange, onConfirmPayment, onRejectPayment, updating }) {
  const [showActions, setShowActions] = useState(false)
  const [showProof, setShowProof] = useState(false)

  const statusConfig = {
    pending_payment: { label: 'Sin comprobante', color: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-500' },
    pending_confirmation: { label: 'Por confirmar', color: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-500' },
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-500' },
    confirmed: { label: 'Confirmada', color: 'bg-primary/20 text-primary', dot: 'bg-primary' },
    completed: { label: 'Completada', color: 'bg-gray-500/20 text-gray-400', dot: 'bg-gray-500' },
    cancelled: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' }
  }

  const status = statusConfig[booking.status] || statusConfig.pending

  function getDateLabel() {
    if (!booking.date) return 'Sin fecha'
    try {
      if (isToday(booking.date)) return 'Hoy'
      if (isTomorrow(booking.date)) return 'Mañana'
      return format(booking.date, "EEE, d MMM", { locale: es })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha inválida'
    }
  }

  return (
    <div className={`bg-surface-dark rounded-xl border overflow-hidden ${
      booking.status === 'pending_confirmation' ? 'border-blue-500/50' : 'border-surface-border'
    }`}>
      {/* Pending Confirmation Alert */}
      {booking.status === 'pending_confirmation' && (
        <div className="bg-blue-500/20 px-4 py-2 flex items-center gap-2 border-b border-blue-500/30">
          <span className="material-symbols-outlined text-blue-400 text-[18px]">receipt_long</span>
          <span className="text-blue-300 text-sm font-medium">Comprobante recibido - Revisar pago</span>
        </div>
      )}

      {/* Main Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center bg-background-dark rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 capitalize">{getDateLabel()}</span>
              <span className="text-primary text-lg font-bold">{booking.timeSlot}</span>
            </div>
            <div>
              <p className="text-white font-bold">{booking.userName}</p>
              <p className="text-gray-400 text-sm">{booking.userPhone || booking.userEmail}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Services */}
        <div className="bg-background-dark/50 rounded-lg p-3 mb-3">
          {(booking.services || []).map((service, idx) => (
            <div key={idx} className="flex justify-between items-center py-1">
              <span className="text-white text-sm">{service.name}</span>
              <span className="text-primary text-sm">{formatPrice(service.price || 0)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 mt-2 border-t border-surface-border/50">
            <span className="text-gray-400 text-sm">Total</span>
            <span className="text-white font-bold">{formatPrice(booking.totalPrice || 0)}</span>
          </div>
        </div>

        {/* Stylist & Payment */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-[16px]">person</span>
            <span className="text-gray-400">{booking.stylistName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-[16px]">account_balance</span>
            <span className={`text-sm ${booking.paymentStatus === 'paid' ? 'text-primary' : booking.paymentStatus === 'rejected' ? 'text-red-400' : 'text-gray-400'}`}>
              {booking.paymentStatus === 'paid' ? 'Pagado' : booking.paymentStatus === 'rejected' ? 'Rechazado' : 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Payment Proof */}
        {booking.paymentProofUrl && (
          <div className="mt-3">
            <button
              onClick={() => setShowProof(!showProof)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span className="text-sm font-medium">{showProof ? 'Ocultar' : 'Ver'} comprobante</span>
              <span className="material-symbols-outlined text-[18px]">
                {showProof ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showProof && (
              <div className="mt-3 relative">
                <img
                  src={booking.paymentProofUrl}
                  alt="Comprobante de pago"
                  className="w-full rounded-lg border border-surface-border"
                />
                <a
                  href={booking.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Rejection reason */}
        {booking.paymentRejectionReason && (
          <div className="mt-3 p-2 bg-red-500/10 rounded-lg">
            <p className="text-red-400 text-xs">
              <span className="font-medium">Motivo rechazo:</span> {booking.paymentRejectionReason}
            </p>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-400 text-xs">
              <span className="font-medium">Nota:</span> {booking.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions for pending_confirmation */}
      {booking.status === 'pending_confirmation' && (
        <div className="border-t border-surface-border/50 p-3">
          {updating ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onConfirmPayment(booking.id)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-background-dark font-bold hover:bg-primary-hover transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Confirmar Pago
              </button>
              <button
                onClick={() => onRejectPayment(booking.id)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                Rechazar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Regular Actions for other statuses */}
      {booking.status !== 'pending_confirmation' && (
        <div className="border-t border-surface-border/50 p-3">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm font-medium">Cambiar estado</span>
            <span className="material-symbols-outlined text-[18px]">
              {showActions ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showActions && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {updating ? (
                <div className="col-span-2 flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {booking.status !== 'confirmed' && (
                    <StatusButton
                      label="Confirmar"
                      icon="check"
                      color="primary"
                      onClick={() => onStatusChange(booking.id, 'confirmed')}
                    />
                  )}
                  {booking.status !== 'completed' && (
                    <StatusButton
                      label="Completar"
                      icon="done_all"
                      color="green"
                      onClick={() => onStatusChange(booking.id, 'completed')}
                    />
                  )}
                  {booking.status !== 'cancelled' && (
                    <StatusButton
                      label="Cancelar"
                      icon="close"
                      color="red"
                      onClick={() => onStatusChange(booking.id, 'cancelled')}
                    />
                  )}
                  {!['pending', 'pending_payment'].includes(booking.status) && (
                    <StatusButton
                      label="Pendiente"
                      icon="schedule"
                      color="yellow"
                      onClick={() => onStatusChange(booking.id, 'pending')}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusButton({ label, icon, color, onClick }) {
  const colors = {
    primary: 'bg-primary/10 text-primary hover:bg-primary/20',
    green: 'bg-green-500/10 text-green-400 hover:bg-green-500/20',
    red: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${colors[color]}`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
