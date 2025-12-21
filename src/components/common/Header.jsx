import { useNavigate } from 'react-router-dom'

export default function Header({
  title,
  showBack = true,
  rightAction = null,
  transparent = false,
  className = ''
}) {
  const navigate = useNavigate()

  return (
    <header
      className={`sticky top-0 z-40 ${
        transparent
          ? 'bg-transparent'
          : 'bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-white/5'
      } ${className}`}
    >
      <div className="flex items-center justify-between p-4">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-dark/50 hover:bg-surface-dark text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <div className="size-10" />
        )}

        <h1 className="text-white text-lg font-bold leading-tight tracking-wide">
          {title}
        </h1>

        {rightAction ? (
          rightAction
        ) : (
          <div className="size-10" />
        )}
      </div>
    </header>
  )
}

export function HeaderAction({ icon, onClick, badge = null }) {
  return (
    <button
      onClick={onClick}
      className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-dark/50 hover:bg-surface-dark text-white transition-colors"
    >
      <span className="material-symbols-outlined">{icon}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 size-5 bg-primary text-background-dark text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}
