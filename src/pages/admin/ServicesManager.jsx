import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  toggleServicePopular
} from '../../services/serviceService'
import toast from 'react-hot-toast'
import LoadingSpinner, { SkeletonList } from '../../components/common/LoadingSpinner'

export default function ServicesManager() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadServices()
  }, [])

  async function loadServices() {
    try {
      const data = await getAllServicesAdmin()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(service) {
    setEditingService(service)
    setShowModal(true)
  }

  function handleAdd() {
    setEditingService(null)
    setShowModal(true)
  }

  async function handleSave(data) {
    try {
      if (editingService) {
        await updateService(editingService.id, data)
        toast.success('Servicio actualizado')
      } else {
        await createService(data)
        toast.success('Servicio creado')
      }
      loadServices()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving service:', error)
      toast.error('Error al guardar')
    }
  }

  async function handleToggleActive(id) {
    try {
      await toggleServiceStatus(id)
      setServices(services.map(s =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ))
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  async function handleTogglePopular(id) {
    try {
      await toggleServicePopular(id)
      setServices(services.map(s =>
        s.id === id ? { ...s, isPopular: !s.isPopular } : s
      ))
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return
    try {
      await deleteService(id)
      setServices(services.filter(s => s.id !== id))
      toast.success('Servicio eliminado')
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="min-h-screen bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h1 className="text-white text-lg font-bold">Gestión de Servicios</h1>
          <button
            onClick={handleAdd}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-background-dark"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {loading ? (
          <SkeletonList count={5} />
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-gray-600 text-[48px] mb-4">spa</span>
            <p className="text-gray-400 mb-4">No hay servicios</p>
            <button
              onClick={handleAdd}
              className="h-12 px-6 bg-primary text-background-dark font-bold rounded-xl"
            >
              Agregar Servicio
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleEdit(service)}
                onToggleActive={() => handleToggleActive(service.id)}
                onTogglePopular={() => handleTogglePopular(service.id)}
                onDelete={() => handleDelete(service.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <ServiceModal
          service={editingService}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function ServiceCard({ service, onEdit, onToggleActive, onTogglePopular, onDelete }) {
  return (
    <div className={`bg-surface-dark rounded-xl border border-surface-border overflow-hidden ${
      !service.isActive ? 'opacity-60' : ''
    }`}>
      <div className="flex gap-4 p-4">
        <div
          className="size-16 rounded-lg bg-cover bg-center bg-surface-highlight shrink-0"
          style={{ backgroundImage: `url("${service.imageUrl || ''}")` }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-bold truncate">{service.name}</p>
              <p className="text-gray-400 text-sm">{service.duration} min</p>
            </div>
            <p className="text-primary font-bold">${service.price}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {service.isPopular && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                Popular
              </span>
            )}
            {!service.isActive && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                Inactivo
              </span>
            )}
            <span className="px-2 py-0.5 bg-surface-highlight text-gray-400 text-xs rounded capitalize">
              {service.category}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-surface-border/50">
        <button
          onClick={onEdit}
          className="flex-1 py-3 text-sm text-gray-400 hover:text-white hover:bg-surface-highlight/50 transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Editar
        </button>
        <button
          onClick={onTogglePopular}
          className={`flex-1 py-3 text-sm transition-colors flex items-center justify-center gap-1 ${
            service.isPopular ? 'text-primary' : 'text-gray-400 hover:text-white hover:bg-surface-highlight/50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">star</span>
          Popular
        </button>
        <button
          onClick={onToggleActive}
          className={`flex-1 py-3 text-sm transition-colors flex items-center justify-center gap-1 ${
            service.isActive ? 'text-primary' : 'text-gray-400 hover:text-white hover:bg-surface-highlight/50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {service.isActive ? 'visibility' : 'visibility_off'}
          </span>
          {service.isActive ? 'Activo' : 'Inactivo'}
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  )
}

function ServiceModal({ service, onSave, onClose }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || '',
    duration: service?.duration || '',
    category: service?.category || 'cortes',
    imageUrl: service?.imageUrl || '',
    isPopular: service?.isPopular || false
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setLoading(true)
    await onSave({
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration)
    })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background-dark rounded-t-3xl border-t border-surface-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background-dark p-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
              placeholder="Ej: Corte Clásico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary resize-none"
              rows={3}
              placeholder="Descripción del servicio..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Precio ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
                placeholder="45.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Duración (min) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Categoría</label>
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
            >
              <option value="cortes">Cortes</option>
              <option value="color">Color</option>
              <option value="tratamientos">Tratamientos</option>
              <option value="uñas">Uñas</option>
              <option value="maquillaje">Maquillaje</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">URL de Imagen</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
              placeholder="https://..."
            />
          </div>

          <label className="flex items-center gap-3 p-4 bg-surface-dark rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={e => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
              className="size-5 rounded border-gray-600 bg-transparent text-primary focus:ring-primary"
            />
            <span className="text-white">Marcar como popular</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-background-dark font-bold rounded-xl disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : service ? 'Guardar Cambios' : 'Crear Servicio'}
          </button>
        </form>
      </div>
    </div>
  )
}
