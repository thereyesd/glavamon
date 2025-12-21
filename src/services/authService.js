import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

// Create user document in Firestore
export async function createUserDocument(user, additionalData = {}) {
  if (!user) return null

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const { email, displayName, photoURL } = user
    await setDoc(userRef, {
      email,
      name: displayName || additionalData.name || '',
      phone: additionalData.phone || '',
      photoURL: photoURL || '',
      role: 'client',
      createdAt: serverTimestamp(),
      ...additionalData
    })
  }

  return userRef
}

// Get user profile
export async function getUserProfile(uid) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() }
  }
  return null
}

// Update user profile
export async function updateUserProfileData(uid, data) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
  return getUserProfile(uid)
}

// Register with email/password
export async function registerWithEmail(email, password, name, phone) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName: name })
  await createUserDocument(user, { name, phone })
  return user
}

// Login with email/password
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

// Login with Google
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  await createUserDocument(user)
  return user
}

// Logout
export async function logout() {
  return signOut(auth)
}

// Reset password
export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}
