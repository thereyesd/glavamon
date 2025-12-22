import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { getAllStylists } from '../../services/stylistService'
import { getAvailableSlots } from '../../services/bookingService'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatPrice } from '../../utils/formatPrice'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function BookingDetails() {
  const [stylists, setStylists] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const {
    selectedServices,
    selectedStylist,
    selectedDate,
    selectedTime,
    totalPrice,
    totalDuration,
    setStylist,
    setDate,
    setTime,
    canProceedToBooking
  } = useBooking()

  const navigate = useNavigate()

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  useEffect(() => {
    if (!canProceedToBooking) {
      navigate('/')
      return
    }
    loadStylists()
    // Set default date to today
    if (!selectedDate) {
      setDate(new Date())
    }
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedDate, selectedStylist])

  async function loadStylists() {
    try {
      const data = await getAllStylists()
      setStylists(data)
    } catch (error) {
      console.error('Error loading stylists:', error)
      toast.error('Error al cargar los profesionales')
    } finally {
      setLoading(false)
    }
  }

  async function loadAvailableSlots() {
    setLoadingSlots(true)
    try {
      const slots = await getAvailableSlots(
        selectedDate,
        selectedStylist?.id,
        totalDuration
      )
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading slots:', error)
      toast.error('Error al cargar horarios')
    } finally {
      setLoadingSlots(false)
    }
  }

  function handleStylistSelect(stylist) {
    if (selectedStylist?.id === stylist?.id) {
      setStylist(null) // Deselect
    } else {
      setStylist(stylist)
    }
  }

  function handleDateSelect(date) {
    setDate(date)
    setTime(null) // Reset time when date changes
  }

  function formatDateDisplay() {
    if (!selectedDate || !selectedTime) return ''
    const dayName = format(selectedDate, 'EEE', { locale: es })
    const dayNum = format(selectedDate, 'd')
    const month = format(selectedDate, 'MMM', { locale: es })
    return `${dayName}, ${dayNum} ${month} • ${selectedTime}`
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col mx-auto max-w-md bg-background-dark overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background-dark/95 p-4 pb-2 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>
            arrow_back
          </span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          Fecha y Estilista
        </h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-36">
        {/* Service Summary Card */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-4 bg-surface-dark p-3 rounded-xl shadow-sm border border-white/5">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0"
              style={{
                backgroundImage: `url("${selectedServices[0]?.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'}")`
              }}
            />
            <div className="flex flex-col justify-center flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold leading-tight line-clamp-1 mb-1">
                  {selectedServices.length === 1
                    ? selectedServices[0].name
                    : `${selectedServices.length} Servicios`}
                </h3>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Editar
                </button>
              </div>
              <p className="text-gray-400 text-sm font-medium leading-normal">
                Duración: {totalDuration} min • Precio: {formatPrice(totalPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Stylist Selection */}
        <div className="mt-6">
          <h3 className="text-xl font-bold leading-tight px-4 text-left pb-4">
            Elige un Profesional
          </h3>
          <div className="flex w-full overflow-x-auto no-scrollbar px-4 pb-2">
            <div className="flex min-h-min flex-row items-start justify-start gap-4">
              {/* Any Stylist Option */}
              <StylistOption
                name="Cualquiera"
                isSelected={!selectedStylist}
                onClick={() => handleStylistSelect(null)}
                isAny
              />
              {/* Individual Stylists */}
              {stylists.map((stylist) => (
                <StylistOption
                  key={stylist.id}
                  name={stylist.name}
                  photoUrl={stylist.photoUrl}
                  isSelected={selectedStylist?.id === stylist.id}
                  onClick={() => handleStylistSelect(stylist)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mt-8">
          <div className="flex justify-between items-end px-4 mb-4">
            <h3 className="text-xl font-bold leading-tight">
              {selectedDate ? format(selectedDate, 'MMMM yyyy', { locale: es }) : 'Selecciona fecha'}
            </h3>
          </div>
          <div className="flex w-full overflow-x-auto no-scrollbar px-4 pb-2 snap-x">
            <div className="flex flex-row gap-3">
              {dates.map((date) => (
                <DateOption
                  key={date.toISOString()}
                  date={date}
                  isSelected={selectedDate && isSameDay(date, selectedDate)}
                  onClick={() => handleDateSelect(date)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="mt-8 px-4">
          <h3 className="text-xl font-bold leading-tight pb-4">Horarios Disponibles</h3>
          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <TimeSlot
                  key={slot.time}
                  time={slot.time}
                  available={slot.available}
                  isPast={slot.isPast}
                  isSelected={selectedTime === slot.time}
                  onClick={() => slot.available && setTime(slot.time)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer Actions */}
      <footer className="fixed bottom-16 left-0 right-0 w-full max-w-md mx-auto z-40">
        <div className="h-12 w-full bg-gradient-to-t from-background-dark to-transparent pointer-events-none" />
        <div className="bg-background-dark p-4 pt-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-400">Total a pagar</span>
              <span className="text-2xl font-bold text-white">{formatPrice(totalPrice)}</span>
            </div>
            {selectedDate && selectedTime && (
              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-medium text-gray-400">Reserva para</span>
                <span className="text-sm font-bold text-primary">{formatDateDisplay()}</span>
              </div>
            )}
          </div>
          <Link
            to={selectedDate && selectedTime ? '/confirmation' : '#'}
            onClick={(e) => {
              if (!selectedDate || !selectedTime) {
                e.preventDefault()
                toast.error('Selecciona fecha y hora')
              }
            }}
            className={`w-full h-14 rounded-full text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              selectedDate && selectedTime
                ? 'bg-primary hover:bg-primary-hover text-background-dark shadow-[0_4px_20px_rgba(70,236,19,0.25)]'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar al Pago
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}

// Stylist Option Component
function StylistOption({ name, photoUrl, isSelected, onClick, isAny = false }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-2 w-[72px] cursor-pointer group ${
        isSelected ? '' : 'opacity-60 hover:opacity-100'
      } transition-opacity`}
    >
      <div className="relative w-[72px] h-[72px]">
        {isSelected && (
          <div className="absolute inset-0 rounded-full border-[3px] border-primary" />
        )}
        <div className="w-full h-full p-[3px]">
          {isAny ? (
            <div className="w-full h-full bg-surface-highlight rounded-full flex items-center justify-center">
              <span
                className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-gray-400'}`}
                style={{ fontSize: '32px' }}
              >
                groups
              </span>
            </div>
          ) : (
            <div
              className={`w-full h-full bg-center bg-no-repeat bg-cover rounded-full ${
                isSelected ? '' : 'grayscale group-hover:grayscale-0'
              } transition-all duration-300`}
              style={{
                backgroundImage: `url("${photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'}")`
              }}
            />
          )}
        </div>
        {isSelected && (
          <div className="absolute bottom-0 right-0 bg-primary text-black rounded-full p-[2px] border-2 border-background-dark">
            <span className="material-symbols-outlined text-[14px] font-bold block">check</span>
          </div>
        )}
      </div>
      <p className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-primary font-bold' : 'text-gray-300'}`}>
        {name}
      </p>
    </div>
  )
}

// Date Option Component
function DateOption({ date, isSelected, onClick }) {
  const dayName = format(date, 'EEE', { locale: es })
  const dayNum = format(date, 'd')
  const isToday = isSameDay(date, new Date())

  return (
    <button
      onClick={onClick}
      className={`snap-start flex flex-col items-center justify-center w-[70px] h-[84px] rounded-[24px] transition-all hover:scale-105 ${
        isSelected
          ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(70,236,19,0.3)]'
          : 'bg-surface-dark border border-transparent hover:border-primary/30'
      }`}
    >
      <span className={`text-xs font-bold uppercase tracking-wide mb-1 ${isSelected ? 'opacity-80' : 'text-gray-400'}`}>
        {dayName}
      </span>
      <span className={`text-2xl font-bold ${isSelected ? '' : 'text-white group-hover:text-primary'}`}>
        {dayNum}
      </span>
      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-black' : isToday ? 'bg-primary' : 'bg-gray-600'}`} />
    </button>
  )
}

// Time Slot Component
function TimeSlot({ time, available, isPast, isSelected, onClick }) {
  if (!available && isPast) {
    return (
      <button
        disabled
        className="py-3 px-2 rounded-xl bg-surface-dark/50 text-gray-600 text-sm font-medium border border-transparent cursor-not-allowed line-through decoration-gray-600/50"
      >
        {time}
      </button>
    )
  }

  if (!available) {
    return (
      <button
        disabled
        className="py-3 px-2 rounded-xl bg-surface-dark/50 text-gray-600 text-sm font-medium border border-transparent cursor-not-allowed"
      >
        {time}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
        isSelected
          ? 'bg-primary text-background-dark border-primary shadow-[0_0_10px_rgba(70,236,19,0.25)] font-bold flex items-center justify-center gap-1'
          : 'bg-surface-dark text-white border-white/10 hover:border-primary hover:text-primary'
      }`}
    >
      {time}
      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
    </button>
  )
}
