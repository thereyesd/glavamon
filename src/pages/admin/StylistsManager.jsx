import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getAllStylistsAdmin,
  createStylist,
  updateStylist,
  hardDeleteStylist,
  toggleStylistStatus
} from '../../services/stylistService'
import { uploadImage } from '../../services/storageService'
import toast from 'react-hot-toast'
import LoadingSpinner, { SkeletonList } from '../../components/common/LoadingSpinner'

export default function StylistsManager() {
  const [stylists, setStylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStylist, setEditingStylist] = useState(null)

  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadStylists()
  }, [])

  async function loadStylists() {
    try {
      const data = await getAllStylistsAdmin()
      setStylists(data)
    } catch (error) {
      console.error('Error loading stylists:', error)
      toast.error('Error al cargar estilistas')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(stylist) {
    setEditingStylist(stylist)
    setShowModal(true)
  }

  function handleAdd() {
    setEditingStylist(null)
    setShowModal(true)
  }

  async function handleSave(data) {
    try {
      if (editingStylist) {
        await updateStylist(editingStylist.id, data)
        toast.success('Estilista actualizado')
      } else {
        await createStylist(data)
        toast.success('Estilista creado')
      }
      loadStylists()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving stylist:', error)
      toast.error('Error al guardar')
    }
  }

  async function handleToggleActive(id) {
    try {
      await toggleStylistStatus(id)
      setStylists(stylists.map(s =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ))
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Estás seguro de eliminar este estilista? Esta acción no se puede deshacer.')) return
    try {
      await hardDeleteStylist(id)
      setStylists(stylists.filter(s => s.id !== id))
      toast.success('Estilista eliminado permanentemente')
    } catch (error) {
      console.error('Error deleting stylist:', error)
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
          <h1 className="text-white text-lg font-bold">Gestión de Estilistas</h1>
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
          <SkeletonList count={4} />
        ) : stylists.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-gray-600 text-[48px] mb-4">group</span>
            <p className="text-gray-400 mb-4">No hay estilistas</p>
            <button
              onClick={handleAdd}
              className="h-12 px-6 bg-primary text-background-dark font-bold rounded-xl"
            >
              Agregar Estilista
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stylists.map(stylist => (
              <StylistCard
                key={stylist.id}
                stylist={stylist}
                onEdit={() => handleEdit(stylist)}
                onToggleActive={() => handleToggleActive(stylist.id)}
                onDelete={() => handleDelete(stylist.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <StylistModal
          stylist={editingStylist}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function StylistCard({ stylist, onEdit, onToggleActive, onDelete }) {
  return (
    <div className={`bg-surface-dark rounded-xl border border-surface-border overflow-hidden ${!stylist.isActive ? 'opacity-60' : ''
      }`}>
      <div className="flex gap-4 p-4">
        <div
          className="size-16 rounded-full bg-cover bg-center bg-surface-highlight shrink-0"
          style={{ backgroundImage: `url("${stylist.photoUrl || ''}")` }}
        >
          {!stylist.photoUrl && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-500">person</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-bold">{stylist.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-white text-sm">{stylist.rating?.toFixed(1) || '5.0'}</span>
                <span className="text-gray-500 text-sm">({stylist.reviewCount || 0} reseñas)</span>
              </div>
            </div>
            {!stylist.isActive && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                Inactivo
              </span>
            )}
          </div>
          {stylist.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {stylist.specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-surface-highlight text-gray-400 text-xs rounded capitalize"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
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
          onClick={onToggleActive}
          className={`flex-1 py-3 text-sm transition-colors flex items-center justify-center gap-1 ${stylist.isActive ? 'text-primary' : 'text-gray-400 hover:text-white hover:bg-surface-highlight/50'
            }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {stylist.isActive ? 'visibility' : 'visibility_off'}
          </span>
          {stylist.isActive ? 'Activo' : 'Inactivo'}
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

function StylistModal({ stylist, onSave, onClose }) {
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(stylist?.photoUrl || '')
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: stylist?.name || '',
    photoUrl: stylist?.photoUrl || '',
    specialties: stylist?.specialties?.join(', ') || '',
    rating: stylist?.rating || 5.0
  })

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const result = await uploadImage(file, 'stylist')
      setFormData(prev => ({ ...prev, photoUrl: result.url }))
      setImagePreview(result.url)
      toast.success('Imagen subida')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!formData.name) {
      toast.error('El nombre es obligatorio')
      return
    }
    setLoading(true)
    await onSave({
      ...formData,
      specialties: formData.specialties
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean),
      rating: parseFloat(formData.rating)
    })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm pb-20">
      <div className="w-full max-w-md bg-background-dark rounded-t-3xl border-t border-surface-border max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="shrink-0 bg-background-dark p-4 border-b border-surface-border flex items-center justify-between rounded-t-3xl">
          <h2 className="text-white text-lg font-bold">
            {stylist ? 'Editar Estilista' : 'Nuevo Estilista'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Foto del estilista</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-full border-2 border-surface-border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('')
                      setFormData(prev => ({ ...prev, photoUrl: '' }))
                    }}
                    className="absolute -top-1 -right-1 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-full text-background-dark hover:bg-primary-hover"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-32 h-32 border-2 border-dashed border-surface-border rounded-full flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-white transition-colors"
                >
                  {uploadingImage ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="text-xs">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                      <span className="text-xs">Subir foto</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
              placeholder="Ej: Ana López"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Especialidades (separadas por coma)
            </label>
            <input
              type="text"
              value={formData.specialties}
              onChange={e => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
              placeholder="cortes, color, tratamientos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Rating (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={e => setFormData(prev => ({ ...prev, rating: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border text-white focus:border-primary"
            />
          </div>
        </form>

        {/* Footer - Fixed button */}
        <div className="shrink-0 p-4 border-t border-surface-border bg-background-dark">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            className="w-full h-14 bg-primary text-background-dark font-bold rounded-xl disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : stylist ? 'Guardar Cambios' : 'Crear Estilista'}
          </button>
        </div>
      </div>
    </div>
  )
}

