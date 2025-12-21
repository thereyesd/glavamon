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

const COLLECTION = 'services'

// Get all services
export async function getAllServices() {
  try {
    const servicesRef = collection(db, COLLECTION)
    const snapshot = await getDocs(servicesRef)
    const services = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(s => s.isActive !== false)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return services
  } catch (error) {
    console.error('Error getting services:', error)
    return []
  }
}

// Get popular services
export async function getPopularServices() {
  try {
    const services = await getAllServices()
    return services.filter(s => s.isPopular === true)
  } catch (error) {
    console.error('Error getting popular services:', error)
    return []
  }
}

// Get services by category
export async function getServicesByCategory(category) {
  try {
    const services = await getAllServices()
    return services.filter(s => s.category === category)
  } catch (error) {
    console.error('Error getting services by category:', error)
    return []
  }
}

// Get single service
export async function getService(id) {
  try {
    const serviceRef = doc(db, COLLECTION, id)
    const snapshot = await getDoc(serviceRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting service:', error)
    return null
  }
}

// Search services
export async function searchServices(searchTerm) {
  try {
    const services = await getAllServices()
    const term = searchTerm.toLowerCase()
    return services.filter(
      service =>
        service.name?.toLowerCase().includes(term) ||
        service.description?.toLowerCase().includes(term)
    )
  } catch (error) {
    console.error('Error searching services:', error)
    return []
  }
}

// --- Admin Functions ---

// Get all services (including inactive) for admin
export async function getAllServicesAdmin() {
  try {
    const servicesRef = collection(db, COLLECTION)
    const snapshot = await getDocs(servicesRef)
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } catch (error) {
    console.error('Error getting all services (admin):', error)
    return []
  }
}

// Create service
export async function createService(data) {
  const servicesRef = collection(db, COLLECTION)
  const docRef = await addDoc(servicesRef, {
    ...data,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return { id: docRef.id, ...data }
}

// Update service
export async function updateService(id, data) {
  const serviceRef = doc(db, COLLECTION, id)
  await updateDoc(serviceRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
  return getService(id)
}

// Delete service (soft delete)
export async function deleteService(id) {
  const serviceRef = doc(db, COLLECTION, id)
  await updateDoc(serviceRef, {
    isActive: false,
    updatedAt: serverTimestamp()
  })
}

// Hard delete service
export async function hardDeleteService(id) {
  const serviceRef = doc(db, COLLECTION, id)
  await deleteDoc(serviceRef)
}

// Toggle service active status
export async function toggleServiceStatus(id) {
  const service = await getService(id)
  if (service) {
    await updateService(id, { isActive: !service.isActive })
  }
}

// Toggle service popular status
export async function toggleServicePopular(id) {
  const service = await getService(id)
  if (service) {
    await updateService(id, { isPopular: !service.isPopular })
  }
}
