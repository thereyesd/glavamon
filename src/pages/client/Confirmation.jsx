import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { createBooking } from '../../services/bookingService'
import { getPaymentInfo } from '../../services/configService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatPrice } from '../../utils/formatPrice'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Confirmation() {
  const [loading, setLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  const { currentUser, userProfile } = useAuth()
  const {
    selectedServices,
    selectedStylist,
    selectedDate,
    selectedTime,
    notes,
    totalPrice,
    totalDuration,
    setNotes,
    resetBooking,
    canProceedToConfirmation,
    bookingData
  } = useBooking()

  const navigate = useNavigate()

  useEffect(() => {
    loadPaymentInfo()
  }, [])

  async function loadPaymentInfo() {
    try {
      const info = await getPaymentInfo()
      setPaymentInfo(info)
    } catch (error) {
      console.error('Error loading payment info:', error)
    } finally {
      setLoadingConfig(false)
    }
  }

  // Redirect if no booking data
  if (!canProceedToConfirmation) {
    navigate('/')
    return null
  }

  async function handleConfirm() {
    if (!currentUser) {
      toast.error('Debes iniciar sesión')
      navigate('/login', { state: { from: { pathname: '/confirmation' } } })
      return
    }

    setLoading(true)
    try {
      const booking = await createBooking(bookingData, currentUser.uid, userProfile)

      toast.success('¡Reserva creada! Sube tu comprobante de pago')
      resetBooking()
      navigate('/upload-payment', { state: { bookingId: booking.id, totalPrice } })
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  function formatBookingDate() {
    if (!selectedDate) return ''
    return format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
  }

  function formatTimeRange() {
    if (!selectedTime || !totalDuration) return ''
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const endMinutes = hours * 60 + minutes + totalDuration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
    return `${selectedTime} - ${endTime}`
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado`)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-dark">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-background-dark/95 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full active:bg-surface-border/20 transition-colors"
        >
          <span className="material-symbols-outlined text-white text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10 text-white">
          Confirmar Reserva
        </h1>
      </header>

      <main className="flex-1 flex flex-col px-4 pb-44 pt-2 gap-6">
        {/* Booking Summary Card */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[20px] font-bold leading-tight pt-2 px-1 text-white">Tu Cita</h2>
          <div className="relative overflow-hidden rounded-xl bg-surface-dark shadow-lg border border-surface-border/30">
            {/* Image header */}
            <div
              className="h-32 w-full bg-cover bg-center relative"
              style={{
                backgroundImage: `url('${selectedServices[0]?.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600'}')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent" />
            </div>

            <div className="relative -mt-12 p-5 pt-0 flex flex-col gap-4">
              {/* Stylist Info */}
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-16 w-16 rounded-full border-4 border-surface-dark bg-cover bg-center shadow-md"
                    style={{
                      backgroundImage: `url('${selectedStylist?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'}')`
                    }}
                  />
                  <div className="mb-1">
                    <p className="text-xs text-primary font-medium uppercase tracking-wider">Profesional</p>
                    <p className="text-lg font-bold text-white">
                      {selectedStylist?.name || 'Cualquier profesional'}
                    </p>
                  </div>
                </div>
                {selectedStylist?.rating && (
                  <div className="mb-2 flex items-center gap-1 rounded-full bg-surface-border/30 px-2 py-1 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="text-xs font-bold text-white">{selectedStylist.rating}</span>
                  </div>
                )}
              </div>

              <hr className="border-surface-border/50" />

              {/* Services Details */}
              <div className="flex flex-col gap-3">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-start">
                    <div>
                      <p className="text-base font-bold text-white">{service.name}</p>
                      <p className="text-sm text-gray-400">Duración: {service.duration} min</p>
                    </div>
                    <p className="text-base font-bold text-primary">{formatPrice(service.price)}</p>
                  </div>
                ))}

                {/* Date/Time Card */}
                <div className="flex items-center gap-3 rounded-lg bg-background-dark/50 p-3 border border-surface-border/20">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white capitalize">{formatBookingDate()}</span>
                    <span className="text-xs text-gray-400">{formatTimeRange()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Info - Bank Transfer */}
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-bold leading-tight px-1 text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            Datos para Transferencia
          </h3>

          {loadingConfig ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : paymentInfo ? (
            <div className="bg-surface-dark rounded-xl border border-surface-border/30 overflow-hidden">
              <div className="bg-primary/10 px-4 py-3 border-b border-surface-border/30">
                <p className="text-primary text-sm font-bold">
                  Realiza la transferencia y luego sube el comprobante
                </p>
              </div>

              <div className="p-4 flex flex-col gap-4">
                {/* Bank Name */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Banco</p>
                    <p className="text-white font-bold">{paymentInfo.bankName}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.bankName, 'Banco')}
                    className="p-2 rounded-lg bg-surface-border/30 hover:bg-surface-border/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">content_copy</span>
                  </button>
                </div>

                {/* Account Holder */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Titular</p>
                    <p className="text-white font-bold">{paymentInfo.accountHolder}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.accountHolder, 'Titular')}
                    className="p-2 rounded-lg bg-surface-border/30 hover:bg-surface-border/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">content_copy</span>
                  </button>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Número de Cuenta</p>
                    <p className="text-white font-bold text-lg tracking-wider">{paymentInfo.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.accountNumber, 'Número de cuenta')}
                    className="p-2 rounded-lg bg-surface-border/30 hover:bg-surface-border/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">content_copy</span>
                  </button>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3 -mx-1">
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider font-medium">Monto a Transferir</p>
                    <p className="text-primary font-bold text-2xl">{formatPrice(totalPrice)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(totalPrice.toFixed(2), 'Monto')}
                    className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px]">content_copy</span>
                  </button>
                </div>

                {/* Instructions */}
                {paymentInfo.instructions && (
                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                    <div className="flex gap-2">
                      <span className="material-symbols-outlined text-yellow-500 text-[18px] shrink-0">info</span>
                      <p className="text-yellow-200 text-xs leading-relaxed">{paymentInfo.instructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* Notes Input */}
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-bold leading-tight px-1 text-white">Notas Adicionales</h3>
          <textarea
            className="w-full rounded-xl bg-surface-dark border border-surface-border p-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            placeholder={`Escribe aquí cualquier detalle especial (opcional)...`}
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        {/* Legal Text */}
        <div className="text-center px-6">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Al confirmar, aceptas los{' '}
            <a className="text-gray-400 underline decoration-gray-600" href="#">
              Términos del Servicio
            </a>{' '}
            y la{' '}
            <a className="text-gray-400 underline decoration-gray-600" href="#">
              Política de Cancelación
            </a>
            . Las cancelaciones con menos de 24 horas de antelación pueden incurrir en cargos.
          </p>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background-dark/90 backdrop-blur-xl border-t border-surface-border/30 max-w-md mx-auto z-50">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-gray-400 text-sm font-medium">Total a pagar</span>
          <span className="text-2xl font-extrabold text-white tracking-tight">{formatPrice(totalPrice)}</span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full h-14 bg-primary rounded-full text-background-dark text-base font-bold hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(70,236,19,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span>Continuar</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
