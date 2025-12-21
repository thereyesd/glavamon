import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { startOfDay, endOfDay, addDays, isSameDay } from 'date-fns'

const COLLECTION = 'bookings'

// Helper to safely parse dates from Firestore
function parseFirestoreDate(dateField) {
  if (!dateField) return null
  
  // If it's a Firestore Timestamp (has toDate method)
  if (typeof dateField.toDate === 'function') {
    return dateField.toDate()
  }
  
  // If it's already a Date object
  if (dateField instanceof Date) {
    return dateField
  }
  
  // If it's a string or number, try to create a Date
  if (typeof dateField === 'string' || typeof dateField === 'number') {
    const date = new Date(dateField)
    // Check if valid date
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  return null
}

// Create a new booking
export async function createBooking(bookingData, userId, userProfile) {
  const bookingsRef = collection(db, COLLECTION)

  const booking = {
    userId,
    userName: userProfile.name,
    userEmail: userProfile.email,
    userPhone: userProfile.phone || '',
    services: bookingData.services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration
    })),
    stylistId: bookingData.stylist?.id || 'any',
    stylistName: bookingData.stylist?.name || 'Cualquier profesional',
    date: Timestamp.fromDate(bookingData.date),
    timeSlot: bookingData.time,
    totalPrice: bookingData.totalPrice,
    totalDuration: bookingData.totalDuration,
    status: 'pending_payment', // Esperando comprobante de pago
    paymentMethod: 'transfer', // Transferencia bancaria
    paymentStatus: 'pending',
    paymentProofUrl: null, // URL del comprobante
    paymentProofUploadedAt: null,
    notes: bookingData.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(bookingsRef, booking)
  return { id: docRef.id, ...booking }
}

// Upload payment proof for a booking
export async function uploadPaymentProofToBooking(bookingId, proofUrl) {
  const bookingRef = doc(db, COLLECTION, bookingId)
  await updateDoc(bookingRef, {
    paymentProofUrl: proofUrl,
    paymentProofUploadedAt: serverTimestamp(),
    status: 'pending_confirmation', // Esperando confirmación del admin
    updatedAt: serverTimestamp()
  })
}

// Confirm payment (admin)
export async function confirmPayment(bookingId) {
  const bookingRef = doc(db, COLLECTION, bookingId)
  await updateDoc(bookingRef, {
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentConfirmedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Reject payment (admin)
export async function rejectPayment(bookingId, reason = '') {
  const bookingRef = doc(db, COLLECTION, bookingId)
  await updateDoc(bookingRef, {
    status: 'pending_payment', // Volver a esperar comprobante
    paymentStatus: 'rejected',
    paymentRejectionReason: reason,
    paymentProofUrl: null,
    updatedAt: serverTimestamp()
  })
}

// Get bookings pending confirmation (admin)
export async function getPendingConfirmationBookings() {
  try {
    const bookings = await getAllBookings()
    return bookings.filter(b => b.status === 'pending_confirmation')
  } catch (error) {
    console.error('Error getting pending confirmation bookings:', error)
    return []
  }
}

// Get booking by ID
export async function getBooking(id) {
  try {
    const bookingRef = doc(db, COLLECTION, id)
    const snapshot = await getDoc(bookingRef)
    if (snapshot.exists()) {
      const data = snapshot.data()
      return {
        id: snapshot.id,
        ...data,
        date: parseFirestoreDate(data.date)
      }
    }
    return null
  } catch (error) {
    console.error('Error getting booking:', error)
    return null
  }
}

// Get user bookings
export async function getUserBookings(userId) {
  try {
    const bookingsRef = collection(db, COLLECTION)
    const snapshot = await getDocs(bookingsRef)
    return snapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: parseFirestoreDate(data.date)
        }
      })
      .filter(b => b.userId === userId)
      .sort((a, b) => (b.date || 0) - (a.date || 0))
  } catch (error) {
    console.error('Error getting user bookings:', error)
    return []
  }
}

// Get upcoming bookings for user
export async function getUpcomingBookings(userId) {
  try {
    const bookings = await getUserBookings(userId)
    const now = new Date()
    return bookings.filter(
      b => b.date >= now && ['pending', 'confirmed'].includes(b.status)
    ).sort((a, b) => (a.date || 0) - (b.date || 0))
  } catch (error) {
    console.error('Error getting upcoming bookings:', error)
    return []
  }
}

// Cancel booking
export async function cancelBooking(id) {
  const bookingRef = doc(db, COLLECTION, id)
  await updateDoc(bookingRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp()
  })
}

// Update booking status
export async function updateBookingStatus(id, status) {
  const bookingRef = doc(db, COLLECTION, id)
  await updateDoc(bookingRef, {
    status,
    updatedAt: serverTimestamp()
  })
}

// Update payment status
export async function updatePaymentStatus(id, paymentStatus, stripePaymentId = null) {
  const bookingRef = doc(db, COLLECTION, id)
  const updateData = {
    paymentStatus,
    updatedAt: serverTimestamp()
  }
  if (stripePaymentId) {
    updateData.stripePaymentId = stripePaymentId
  }
  await updateDoc(bookingRef, updateData)
}

// --- Availability Functions ---

// Get booked time slots for a specific date and stylist
export async function getBookedSlots(date, stylistId = null) {
  try {
    const bookingsRef = collection(db, COLLECTION)
    const snapshot = await getDocs(bookingsRef)

    let bookings = snapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: parseFirestoreDate(data.date)
        }
      })
      .filter(b => {
        if (!b.date) return false
        // Same day and not cancelled
        return isSameDay(b.date, date) && ['pending', 'confirmed'].includes(b.status)
      })

    // Filter by stylist if specified
    if (stylistId && stylistId !== 'any') {
      bookings = bookings.filter(
        b => b.stylistId === stylistId || b.stylistId === 'any'
      )
    }

    return bookings.map(b => ({
      timeSlot: b.timeSlot,
      duration: b.totalDuration,
      stylistId: b.stylistId
    }))
  } catch (error) {
    console.error('Error getting booked slots:', error)
    return []
  }
}

// Generate available time slots for a date
export async function getAvailableSlots(date, stylistId = null, serviceDuration = 30) {
  // Get business config (would come from Firestore in real app)
  const config = {
    openTime: '09:00',
    closeTime: '20:00',
    slotDuration: 30 // minutes
  }

  const bookedSlots = await getBookedSlots(date, stylistId)

  // Generate all possible slots
  const slots = []
  const [openHour, openMin] = config.openTime.split(':').map(Number)
  const [closeHour, closeMin] = config.closeTime.split(':').map(Number)

  let currentHour = openHour
  let currentMin = openMin

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`

    // Check if slot is available
    const isBooked = bookedSlots.some(booked => {
      return booked.timeSlot === timeStr
    })

    // Check if slot is in the past (for today)
    const now = new Date()
    const slotDate = new Date(date)
    slotDate.setHours(currentHour, currentMin, 0, 0)
    const isPast = slotDate < now

    slots.push({
      time: timeStr,
      available: !isBooked && !isPast,
      isPast
    })

    // Increment by slot duration
    currentMin += config.slotDuration
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60)
      currentMin = currentMin % 60
    }
  }

  return slots
}

// --- Admin Functions ---

// Get all bookings for admin
export async function getAllBookings() {
  try {
    const bookingsRef = collection(db, COLLECTION)
    const snapshot = await getDocs(bookingsRef)
    return snapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: parseFirestoreDate(data.date)
        }
      })
      .sort((a, b) => (b.date || 0) - (a.date || 0))
  } catch (error) {
    console.error('Error getting all bookings:', error)
    return []
  }
}

// Get bookings by date range
export async function getBookingsByDateRange(startDate, endDate) {
  try {
    const bookings = await getAllBookings()
    return bookings.filter(b => {
      if (!b.date) return false
      return b.date >= startDate && b.date <= endDate
    }).sort((a, b) => (a.date || 0) - (b.date || 0))
  } catch (error) {
    console.error('Error getting bookings by date range:', error)
    return []
  }
}

// Get today's bookings
export async function getTodayBookings() {
  const today = new Date()
  return getBookingsByDateRange(startOfDay(today), endOfDay(today))
}

// Get bookings by status
export async function getBookingsByStatus(status) {
  try {
    const bookings = await getAllBookings()
    return bookings.filter(b => b.status === status)
  } catch (error) {
    console.error('Error getting bookings by status:', error)
    return []
  }
}

// Get bookings statistics
export async function getBookingsStats() {
  try {
    const bookings = await getAllBookings()
    const today = startOfDay(new Date())
    const weekAgo = addDays(today, -7)
    const monthAgo = addDays(today, -30)

    const todayBookings = bookings.filter(
      b => b.date && b.date >= today && b.date < addDays(today, 1)
    )

    const weekBookings = bookings.filter(b => b.date && b.date >= weekAgo)
    const monthBookings = bookings.filter(b => b.date && b.date >= monthAgo)

    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
    const completedCount = bookings.filter(b => b.status === 'completed').length
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length

    const totalRevenue = bookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

    const monthRevenue = monthBookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

    return {
      todayCount: todayBookings.length,
      weekCount: weekBookings.length,
      monthCount: monthBookings.length,
      totalCount: bookings.length,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalRevenue,
      monthRevenue
    }
  } catch (error) {
    console.error('Error getting booking stats:', error)
    return {
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
      totalCount: 0,
      pendingCount: 0,
      confirmedCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      totalRevenue: 0,
      monthRevenue: 0
    }
  }
}
