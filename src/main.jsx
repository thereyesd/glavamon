import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import './index.css'

// Importar seed para desarrollo (ejecutar seedDatabase() en consola)
import './utils/seedFirestore'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1d2e19',
                color: '#fff',
                border: '1px solid rgba(70, 236, 19, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#46ec13',
                  secondary: '#1d2e19',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1d2e19',
                },
              },
            }}
          />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
