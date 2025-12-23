import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTION = 'stylists'

// Get all active stylists
export async function getAllStylists() {
  try {
    const stylistsRef = collection(db, COLLECTION)
    const snapshot = await getDocs(stylistsRef)
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(s => s.isActive !== false)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } catch (error) {
    console.error('Error getting stylists:', error)
    return []
  }
}

// Get single stylist
export async function getStylist(id) {
  try {
    const stylistRef = doc(db, COLLECTION, id)
    const snapshot = await getDoc(stylistRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting stylist:', error)
    return null
  }
}

// Get stylists by specialty
export async function getStylistsBySpecialty(specialty) {
  try {
    const stylists = await getAllStylists()
    return stylists.filter(s => s.specialties?.includes(specialty))
  } catch (error) {
    console.error('Error getting stylists by specialty:', error)
    return []
  }
}

// --- Admin Functions ---

// Get all stylists (including inactive) for admin
export async function getAllStylistsAdmin() {
  try {
    const stylistsRef = collection(db, COLLECTION)
    const snapshot = await getDocs(stylistsRef)
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } catch (error) {
    console.error('Error getting all stylists (admin):', error)
    return []
  }
}

// Create stylist
export async function createStylist(data) {
  const stylistsRef = collection(db, COLLECTION)
  const docRef = await addDoc(stylistsRef, {
    ...data,
    rating: data.rating || 5.0,
    reviewCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return { id: docRef.id, ...data }
}

// Update stylist
export async function updateStylist(id, data) {
  const stylistRef = doc(db, COLLECTION, id)
  await updateDoc(stylistRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
  return getStylist(id)
}

// Delete stylist (soft delete)
export async function deleteStylist(id) {
  const stylistRef = doc(db, COLLECTION, id)
  await updateDoc(stylistRef, {
    isActive: false,
    updatedAt: serverTimestamp()
  })
}

// Hard delete stylist
export async function hardDeleteStylist(id) {
  const stylistRef = doc(db, COLLECTION, id)
  await deleteDoc(stylistRef)
}

// Toggle stylist active status
export async function toggleStylistStatus(id) {
  const stylist = await getStylist(id)
  if (stylist) {
    await updateStylist(id, { isActive: !stylist.isActive })
  }
}

// Update stylist rating (called after reviews)
export async function updateStylistRating(id, newRating, reviewCount) {
  const stylistRef = doc(db, COLLECTION, id)
  await updateDoc(stylistRef, {
    rating: newRating,
    reviewCount,
    updatedAt: serverTimestamp()
  })
}
