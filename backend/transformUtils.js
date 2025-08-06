const symbolRegex = /[^\d.-]/g

function currencyToFloat(value) {
  if (value == null) return value
  const cleaned = String(value).replace(symbolRegex, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function dateToISO(value) {
  if (!value) return value
  const date = new Date(value)
  if (!isNaN(date)) {
    return date.toISOString().slice(0, 10)
  }
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (match) {
    let [, m, d, y] = match
    if (y.length === 2) y = '20' + y
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return value
}

function applyTransformations(fieldMap, data) {
  const transformers = { currencyToFloat, dateToISO }
  fieldMap.forEach((field) => {
    if (!field.transformation) return
    const key = field.stateKey || field.name
    if (data[key] == null) return
    const fn = transformers[field.transformation]
    if (fn) data[key] = fn(data[key])
  })
  return data
}

function extractLineItems(tables, mapping) {
  if (!tables || !Array.isArray(tables) || !mapping?.columns) return []
  const items = []
  tables.forEach((table) => {
    const rows = Array.from({ length: table.rowCount }, () => [])
    table.cells.forEach((cell) => {
      rows[cell.rowIndex][cell.columnIndex] = cell.content
    })
    const header = rows[0]?.map((h) => h && h.trim().toLowerCase()) || []
    const indexMap = {}
    mapping.columns.forEach((col) => {
      const idx = header.findIndex(
        (h) => h && h.includes(col.name.trim().toLowerCase())
      )
      if (idx !== -1) indexMap[col.name] = idx
    })
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const item = {}
      Object.entries(indexMap).forEach(([name, idx]) => {
        const val = row[idx]
        if (val != null) item[name] = val
      })
      if (Object.keys(item).length) {
        items.push(applyTransformations(mapping.columns, item))
      }
    }
  })
  return items
}

module.exports = {
  currencyToFloat,
  dateToISO,
  extractLineItems,
  applyTransformations
}

