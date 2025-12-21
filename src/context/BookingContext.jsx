import { createContext, useContext, useState, useReducer } from 'react'

const BookingContext = createContext()

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

// Initial state
const initialState = {
  selectedServices: [],
  selectedStylist: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
  paymentMethod: 'card'
}

// Actions
const ACTIONS = {
  ADD_SERVICE: 'ADD_SERVICE',
  REMOVE_SERVICE: 'REMOVE_SERVICE',
  SET_STYLIST: 'SET_STYLIST',
  SET_DATE: 'SET_DATE',
  SET_TIME: 'SET_TIME',
  SET_NOTES: 'SET_NOTES',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  RESET_BOOKING: 'RESET_BOOKING'
}

// Reducer
function bookingReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_SERVICE:
      // Don't add if already exists
      if (state.selectedServices.find(s => s.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        selectedServices: [...state.selectedServices, action.payload]
      }

    case ACTIONS.REMOVE_SERVICE:
      return {
        ...state,
        selectedServices: state.selectedServices.filter(s => s.id !== action.payload)
      }

    case ACTIONS.SET_STYLIST:
      return {
        ...state,
        selectedStylist: action.payload
      }

    case ACTIONS.SET_DATE:
      return {
        ...state,
        selectedDate: action.payload,
        selectedTime: null // Reset time when date changes
      }

    case ACTIONS.SET_TIME:
      return {
        ...state,
        selectedTime: action.payload
      }

    case ACTIONS.SET_NOTES:
      return {
        ...state,
        notes: action.payload
      }

    case ACTIONS.SET_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload
      }

    case ACTIONS.RESET_BOOKING:
      return initialState

    default:
      return state
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)
  const [isProcessing, setIsProcessing] = useState(false)

  // Actions
  const addService = (service) => {
    dispatch({ type: ACTIONS.ADD_SERVICE, payload: service })
  }

  const removeService = (serviceId) => {
    dispatch({ type: ACTIONS.REMOVE_SERVICE, payload: serviceId })
  }

  const toggleService = (service) => {
    const exists = state.selectedServices.find(s => s.id === service.id)
    if (exists) {
      removeService(service.id)
    } else {
      addService(service)
    }
  }

  const isServiceSelected = (serviceId) => {
    return state.selectedServices.some(s => s.id === serviceId)
  }

  const setStylist = (stylist) => {
    dispatch({ type: ACTIONS.SET_STYLIST, payload: stylist })
  }

  const setDate = (date) => {
    dispatch({ type: ACTIONS.SET_DATE, payload: date })
  }

  const setTime = (time) => {
    dispatch({ type: ACTIONS.SET_TIME, payload: time })
  }

  const setNotes = (notes) => {
    dispatch({ type: ACTIONS.SET_NOTES, payload: notes })
  }

  const setPaymentMethod = (method) => {
    dispatch({ type: ACTIONS.SET_PAYMENT_METHOD, payload: method })
  }

  const resetBooking = () => {
    dispatch({ type: ACTIONS.RESET_BOOKING })
  }

  // Computed values
  const totalPrice = state.selectedServices.reduce(
    (sum, service) => sum + (service.price || 0),
    0
  )

  const totalDuration = state.selectedServices.reduce(
    (sum, service) => sum + (service.duration || 0),
    0
  )

  const serviceCount = state.selectedServices.length

  const canProceedToBooking = serviceCount > 0

  const canProceedToConfirmation =
    canProceedToBooking &&
    state.selectedDate &&
    state.selectedTime

  const bookingData = {
    services: state.selectedServices,
    stylist: state.selectedStylist,
    date: state.selectedDate,
    time: state.selectedTime,
    notes: state.notes,
    paymentMethod: state.paymentMethod,
    totalPrice,
    totalDuration
  }

  const value = {
    // State
    ...state,
    isProcessing,

    // Computed
    totalPrice,
    totalDuration,
    serviceCount,
    canProceedToBooking,
    canProceedToConfirmation,
    bookingData,

    // Actions
    addService,
    removeService,
    toggleService,
    isServiceSelected,
    setStylist,
    setDate,
    setTime,
    setNotes,
    setPaymentMethod,
    resetBooking,
    setIsProcessing
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}
