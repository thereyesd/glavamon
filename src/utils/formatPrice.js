// Format price in Paraguayan Guaraníes
export function formatPrice(price) {
  if (price === null || price === undefined) return 'Gs. 0'

  // Guaraníes don't use decimals, round to nearest integer
  const rounded = Math.round(price)

  // Format with thousand separators (dots in Paraguay)
  return `Gs. ${rounded.toLocaleString('es-PY')}`
}

// Parse price string to number (removes formatting)
export function parsePrice(priceString) {
  if (!priceString) return 0
  // Remove "Gs.", dots, and spaces
  const cleaned = priceString.toString().replace(/[Gs.\s]/g, '')
  return parseInt(cleaned) || 0
}
