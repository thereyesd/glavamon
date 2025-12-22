// Upload payment proof image using ImgBB (free image hosting)
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY

export async function uploadPaymentProof(file, bookingId) {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file)

    // Remove the data:image/xxx;base64, prefix
    const base64Data = base64.split(',')[1]

    // Create form data for ImgBB API
    const formData = new FormData()
    formData.append('key', IMGBB_API_KEY)
    formData.append('image', base64Data)
    formData.append('name', `payment_${bookingId}_${Date.now()}`)

    // Upload to ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Error uploading image')
    }

    return {
      url: data.data.url,
      deleteUrl: data.data.delete_url,
      thumbnail: data.data.thumb?.url
    }
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    throw error
  }
}

// Upload generic image (for services, stylists, etc.)
export async function uploadImage(file, prefix = 'image') {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file)

    // Remove the data:image/xxx;base64, prefix
    const base64Data = base64.split(',')[1]

    // Create form data for ImgBB API
    const formData = new FormData()
    formData.append('key', IMGBB_API_KEY)
    formData.append('image', base64Data)
    formData.append('name', `${prefix}_${Date.now()}`)

    // Upload to ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Error uploading image')
    }

    return {
      url: data.data.url,
      deleteUrl: data.data.delete_url,
      thumbnail: data.data.thumb?.url
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
