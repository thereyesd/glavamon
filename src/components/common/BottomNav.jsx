import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function BottomNav() {
  const { currentUser, isAdmin } = useAuth()
  const location = useLocation()

  // Don't show on auth pages
  if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
    return null
  }

  const navItems = [
    { path: '/', icon: 'home', label: 'Inicio' },
    { path: '/my-bookings', icon: 'calendar_month', label: 'Mis Citas' },
    { path: '/profile', icon: 'person', label: 'Perfil' }
  ]

  // Add admin link if user is admin
  if (isAdmin()) {
    navItems.splice(2, 0, { path: '/admin', icon: 'admin_panel_settings', label: 'Admin' })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark/95 backdrop-blur-lg border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isActive ? 'filled' : ''
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
