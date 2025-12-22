import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { getAllServices, getPopularServices, searchServices } from '../../services/serviceService'
import { SkeletonList } from '../../components/common/LoadingSpinner'
import { formatPrice } from '../../utils/formatPrice'
import toast from 'react-hot-toast'

export default function ServiceSelection() {
  const [services, setServices] = useState([])
  const [popularServices, setPopularServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const { selectedServices, toggleService, isServiceSelected, totalPrice, serviceCount } = useBooking()
  const navigate = useNavigate()

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      const [all, popular] = await Promise.all([
        getAllServices(),
        getPopularServices()
      ])
      setServices(all)
      setPopularServices(popular)
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Error al cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(term) {
    setSearchTerm(term)
    if (term.length >= 2) {
      const results = await searchServices(term)
      setSearchResults(results)
    } else {
      setSearchResults(null)
    }
  }

  const displayServices = searchResults || services

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-dark/50 hover:bg-surface-dark text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-white text-lg font-bold leading-tight tracking-wide">
            Selección de Servicios
          </h1>
          <div className="size-10" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-2">
        <div className="relative flex items-center w-full h-12 rounded-full focus-within:ring-2 ring-primary/50 bg-surface-dark overflow-hidden">
          <div className="grid place-items-center h-full w-12 text-gray-400">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-white bg-transparent pr-4 placeholder-gray-500"
            placeholder="Buscar servicio (ej. Corte, Tinte)..."
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 text-gray-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-4">
          <SkeletonList count={5} />
        </div>
      ) : (
        <>
          {/* Popular Services Carousel */}
          {!searchResults && popularServices.length > 0 && (
            <section className="mt-4">
              <div className="flex items-center justify-between px-4 pb-4">
                <h3 className="text-white text-xl font-bold leading-tight">
                  Servicios más Populares
                </h3>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 pb-4 gap-4">
                {popularServices.map((service) => (
                  <PopularServiceCard
                    key={service.id}
                    service={service}
                    isSelected={isServiceSelected(service.id)}
                    onToggle={() => toggleService(service)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Services List */}
          <section className="mt-6">
            <h3 className="text-white text-xl font-bold leading-tight px-4 pb-4">
              {searchResults ? `Resultados (${searchResults.length})` : 'Todos los Servicios'}
            </h3>
            <div className="flex flex-col gap-1 px-2">
              {displayServices.length > 0 ? (
                displayServices.map((service) => (
                  <ServiceListItem
                    key={service.id}
                    service={service}
                    isSelected={isServiceSelected(service.id)}
                    onToggle={() => toggleService(service)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-gray-600 text-[48px] mb-4">
                    search_off
                  </span>
                  <p className="text-gray-400">No se encontraron servicios</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Floating Footer Panel */}
      {serviceCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 p-4 animate-slide-up">
          <div className="relative w-full rounded-2xl bg-[#233520] border border-white/10 shadow-2xl backdrop-blur-xl p-4 flex items-center justify-between overflow-hidden">
            <div className="absolute -left-10 top-0 size-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="flex flex-col relative z-10">
              <p className="text-primary text-xs font-bold uppercase tracking-wider mb-0.5">
                Resumen
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-lg font-bold">
                  {serviceCount} {serviceCount === 1 ? 'Servicio' : 'Servicios'}
                </span>
                <span className="text-gray-400 text-sm">• {formatPrice(totalPrice)}</span>
              </div>
            </div>
            <Link
              to="/booking"
              className="relative z-10 h-12 px-6 rounded-full bg-primary hover:bg-primary-hover text-background-dark font-bold text-base flex items-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-95"
            >
              Siguiente
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// Popular Service Card Component
function PopularServiceCard({ service, isSelected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`flex flex-col gap-3 min-w-[160px] w-[160px] snap-center group cursor-pointer ${
        isSelected ? 'ring-2 ring-primary rounded-xl' : ''
      }`}
    >
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url("${service.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          {service.isPopular && (
            <span className="inline-block px-2 py-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-black bg-primary rounded-sm">
              Top
            </span>
          )}
          <p className="text-white text-sm font-bold leading-tight">{service.name}</p>
        </div>
        {isSelected && (
          <div className="absolute top-3 right-3 size-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-background-dark text-[18px]">check</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-primary font-bold">{formatPrice(service.price)}</span>
        <span className="text-gray-400 text-xs flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          {service.duration} min
        </span>
      </div>
    </div>
  )
}

// Service List Item Component
function ServiceListItem({ service, isSelected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`group flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
        isSelected
          ? 'bg-surface-dark/50 border border-primary/20'
          : 'bg-background-dark hover:bg-surface-dark border border-transparent hover:border-white/5'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="size-16 rounded-lg bg-cover bg-center bg-surface-highlight shrink-0"
          style={{ backgroundImage: `url("${service.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'}")` }}
        />
        <div className="flex flex-col justify-center">
          <p className="text-white text-base font-bold leading-normal mb-1">{service.name}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{service.duration} min</span>
            <span className="size-1 rounded-full bg-gray-600" />
            <span className="text-primary">{formatPrice(service.price)}</span>
          </div>
        </div>
      </div>
      <button
        className={`size-10 rounded-full flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(70,236,19,0.4)]'
            : 'border border-gray-600 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/10'
        }`}
      >
        <span className="material-symbols-outlined">
          {isSelected ? 'check' : 'add'}
        </span>
      </button>
    </div>
  )
}
