export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-3 border-primary/30 border-t-primary rounded-full animate-spin`}
        style={{ borderWidth: '3px' }}
      />
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-background-dark flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-white/60 text-sm">Cargando...</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-dark animate-pulse">
      <div className="size-16 rounded-lg bg-surface-highlight skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface-highlight rounded w-3/4 skeleton" />
        <div className="h-3 bg-surface-highlight rounded w-1/2 skeleton" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
