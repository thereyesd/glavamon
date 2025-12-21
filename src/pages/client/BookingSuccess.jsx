import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import confetti from '../../utils/confetti'

export default function BookingSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const { bookingId, paymentUploaded } = location.state || {}

  useEffect(() => {
    // Trigger confetti animation
    if (paymentUploaded) {
      confetti()
    }
  }, [paymentUploaded])

  if (!bookingId) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark px-6 py-12">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className={`absolute inset-0 rounded-full blur-[60px] animate-pulse ${paymentUploaded ? 'bg-primary/20' : 'bg-yellow-500/20'}`} />
        <div className={`relative size-32 rounded-full flex items-center justify-center animate-fade-in ${paymentUploaded ? 'bg-primary/20' : 'bg-yellow-500/20'}`}>
          <div className={`size-24 rounded-full flex items-center justify-center ${paymentUploaded ? 'bg-primary/30' : 'bg-yellow-500/30'}`}>
            <div className={`size-16 rounded-full flex items-center justify-center ${paymentUploaded ? 'bg-primary shadow-[0_0_30px_rgba(70,236,19,0.5)]' : 'bg-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5)]'}`}>
              <span className="material-symbols-outlined text-background-dark text-[32px]">
                {paymentUploaded ? 'check' : 'schedule'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {paymentUploaded ? (
        <>
          <h1 className="text-3xl font-bold text-white text-center mb-3 animate-slide-up">
            ¡Comprobante Enviado!
          </h1>
          <p className="text-gray-400 text-center max-w-xs mb-8 animate-slide-up">
            Tu comprobante ha sido recibido. El propietario verificará el pago y confirmará tu cita pronto.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-white text-center mb-3 animate-slide-up">
            Reserva Pendiente
          </h1>
          <p className="text-gray-400 text-center max-w-xs mb-8 animate-slide-up">
            Tu reserva está creada pero aún falta subir el comprobante de pago para confirmarla.
          </p>
        </>
      )}

      {/* Booking ID */}
      <div className="bg-surface-dark rounded-xl p-4 mb-4 w-full max-w-xs animate-slide-up">
        <p className="text-xs text-gray-400 text-center mb-1">Número de reserva</p>
        <p className="text-primary font-mono text-center font-bold text-lg">{bookingId.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Status Badge */}
      <div className={`rounded-full px-4 py-2 mb-8 flex items-center gap-2 animate-slide-up ${paymentUploaded ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
        <span className="material-symbols-outlined text-[18px]">
          {paymentUploaded ? 'hourglass_top' : 'warning'}
        </span>
        <span className="text-sm font-medium">
          {paymentUploaded ? 'Esperando confirmación del pago' : 'Pendiente de comprobante'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs animate-slide-up">
        {!paymentUploaded && (
          <Link
            to="/upload-payment"
            state={{ bookingId }}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">upload</span>
            Subir comprobante ahora
          </Link>
        )}
        <Link
          to="/my-bookings"
          className={`w-full h-14 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${paymentUploaded ? 'bg-primary hover:bg-primary-hover text-background-dark shadow-lg shadow-primary/25' : 'bg-surface-dark hover:bg-surface-highlight text-white border border-surface-border'}`}
        >
          Ver mis citas
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
        </Link>
        <Link
          to="/"
          className="w-full h-14 bg-surface-dark hover:bg-surface-highlight text-white font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-surface-border"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
