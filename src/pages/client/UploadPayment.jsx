import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { uploadPaymentProof } from '../../services/storageService'
import { uploadPaymentProofToBooking, getBooking } from '../../services/bookingService'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function UploadPayment() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()
  const { bookingId, totalPrice } = location.state || {}

  // Redirect if no booking info
  if (!bookingId) {
    navigate('/my-bookings')
    return null
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB')
        return
      }

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error('Selecciona una imagen del comprobante')
      return
    }

    setUploading(true)
    try {
      // Upload to Firebase Storage
      const { url } = await uploadPaymentProof(selectedFile, bookingId)

      // Update booking with proof URL
      await uploadPaymentProofToBooking(bookingId, url)

      toast.success('Comprobante enviado correctamente')
      navigate('/booking-success', {
        state: {
          bookingId,
          paymentUploaded: true
        }
      })
    } catch (error) {
      console.error('Error uploading payment proof:', error)
      toast.error('Error al subir el comprobante. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  function handleSkip() {
    navigate('/booking-success', {
      state: {
        bookingId,
        paymentUploaded: false
      }
    })
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
          Subir Comprobante
        </h1>
      </header>

      <main className="flex-1 flex flex-col px-4 pb-44 pt-4 gap-6">
        {/* Instructions */}
        <div className="bg-surface-dark rounded-xl p-4 border border-surface-border/30">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <div>
              <h2 className="text-white font-bold mb-1">Sube tu comprobante de pago</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Toma una foto o captura de pantalla de tu transferencia por <span className="text-primary font-bold">${totalPrice?.toFixed(2) || '0.00'}</span> y súbela aquí para confirmar tu reserva.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="payment-proof"
          />

          {!previewUrl ? (
            <label
              htmlFor="payment-proof"
              className="flex flex-col items-center justify-center gap-4 h-64 border-2 border-dashed border-surface-border rounded-xl bg-surface-dark/50 cursor-pointer hover:border-primary/50 hover:bg-surface-dark transition-all"
            >
              <div className="size-16 rounded-full bg-surface-border/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-400 text-[32px]">cloud_upload</span>
              </div>
              <div className="text-center">
                <p className="text-white font-bold mb-1">Toca para subir imagen</p>
                <p className="text-gray-500 text-sm">PNG, JPG hasta 5MB</p>
              </div>
            </label>
          ) : (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Comprobante de pago"
                className="w-full rounded-xl object-contain max-h-80 bg-surface-dark"
              />
              <button
                onClick={handleRemoveFile}
                className="absolute top-3 right-3 size-10 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-white text-[20px]">close</span>
              </button>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="text-white text-sm font-medium truncate">{selectedFile.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Change Image Button */}
          {previewUrl && (
            <label
              htmlFor="payment-proof"
              className="flex items-center justify-center gap-2 h-12 rounded-xl border border-surface-border text-gray-300 font-medium cursor-pointer hover:border-primary/50 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              Cambiar imagen
            </label>
          )}
        </div>

        {/* Status Info */}
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-blue-400 text-[20px] shrink-0">info</span>
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Estado de tu reserva</p>
              <p className="text-blue-300/80 text-xs leading-relaxed">
                Una vez subas el comprobante, el propietario verificará el pago y confirmará tu cita. Recibirás una notificación cuando sea confirmada.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background-dark/90 backdrop-blur-xl border-t border-surface-border/30 max-w-md mx-auto z-50">
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full h-14 bg-primary rounded-full text-background-dark text-base font-bold hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(70,236,19,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {uploading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">upload</span>
              <span>Enviar Comprobante</span>
            </>
          )}
        </button>
        <button
          onClick={handleSkip}
          disabled={uploading}
          className="w-full h-12 rounded-full text-gray-400 text-sm font-medium hover:text-white transition-colors"
        >
          Subir más tarde
        </button>
      </div>
    </div>
  )
}
