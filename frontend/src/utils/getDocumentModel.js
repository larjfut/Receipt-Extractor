export function getDocumentModel(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('invoice')) return 'invoice'
  if (n.includes('receipt')) return 'receipt'
  return 'receipt'
}
