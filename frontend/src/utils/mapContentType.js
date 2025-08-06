export function mapContentType(name) {
  const mapping = {
    'Purchase Requisition - Vendor Invoice': 'vendor-invoice',
    'Purchase Requisition - TCFV Card': 'tcfv-card',
    'Purchase Requisition - Personal Card': 'personal-card',
  }
  return mapping[name] || 'vendor-invoice'
}
