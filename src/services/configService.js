import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const CONFIG_DOC = 'businessConfig'
const CONFIG_ID = 'config'

// Get business configuration
export async function getBusinessConfig() {
  try {
    const configRef = doc(db, CONFIG_DOC, CONFIG_ID)
    const snapshot = await getDoc(configRef)
    if (snapshot.exists()) {
      return snapshot.data()
    }
    // Return default config if none exists
    return getDefaultConfig()
  } catch (error) {
    console.error('Error getting business config:', error)
    return getDefaultConfig()
  }
}

// Get payment info specifically
export async function getPaymentInfo() {
  const config = await getBusinessConfig()
  return config.paymentInfo || {
    bankName: "Itaú",
    accountHolder: "David Reyes",
    accountNumber: "200007664",
    accountType: "Cuenta Corriente",
    instructions: "Enviar comprobante de transferencia para confirmar la reserva"
  }
}

// Update business configuration
export async function updateBusinessConfig(data) {
  const configRef = doc(db, CONFIG_DOC, CONFIG_ID)
  await setDoc(configRef, data, { merge: true })
}

// Update payment info
export async function updatePaymentInfo(paymentInfo) {
  const configRef = doc(db, CONFIG_DOC, CONFIG_ID)
  await setDoc(configRef, { paymentInfo }, { merge: true })
}

function getDefaultConfig() {
  return {
    businessName: "Glavamon",
    phone: "+595 981 123 456",
    email: "contacto@beautyflow.com",
    address: "Asunción, Paraguay",
    openTime: "09:00",
    closeTime: "20:00",
    slotDuration: 30,
    daysOff: [0],
    currency: "PYG",
    cancellationPolicy: 24,
    paymentInfo: {
      bankName: "Itaú",
      accountHolder: "David Reyes",
      accountNumber: "200007664",
      accountType: "Cuenta Corriente",
      instructions: "Enviar comprobante de transferencia para confirmar la reserva"
    }
  }
}
