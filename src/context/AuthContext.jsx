import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Create user document in Firestore
  async function createUserDocument(user, additionalData = {}) {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = user
      try {
        await setDoc(userRef, {
          email,
          name: displayName || additionalData.name || '',
          phone: additionalData.phone || '',
          photoURL: photoURL || '',
          role: 'client', // Default role
          createdAt: serverTimestamp(),
          ...additionalData
        })
      } catch (error) {
        console.error('Error creating user document:', error)
      }
    }

    return userRef
  }

  // Get user profile from Firestore
  async function getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Register with email and password
  async function register(email, password, name, phone) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: name })
    await createUserDocument(user, { name, phone })
    return user
  }

  // Login with email and password
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Login with Google
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    await createUserDocument(user)
    return user
  }

  // Logout
  async function logout() {
    setUserProfile(null)
    return signOut(auth)
  }

  // Reset password
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  // Update user profile
  async function updateUserProfile(data) {
    if (!currentUser) return

    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(userRef, data, { merge: true })

    // Refresh profile
    const profile = await getUserProfile(currentUser.uid)
    setUserProfile(profile)
    return profile
  }

  // Check if user is admin
  function isAdmin() {
    return userProfile?.role === 'admin'
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
