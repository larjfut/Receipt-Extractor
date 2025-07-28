/**
 * parseReceiptData
 *
 * This helper converts the raw result from Tesseract.js into an object keyed
 * by the stateKeys defined in the field mapping.  In its current form it
 * simply initializes all fields to empty strings.  A future implementation
 * should use heuristics and regular expressions (see the Finance team's
 * "Fields Most Likely to be OCR‑Extractable" document) to extract values such
 * as invoice date, vendor, subtotal, tax and total from the OCR text.  For
 * fields that cannot be reliably extracted, the frontend will prompt the
 * user to fill them in during the review step.
 *
 * @param {Object} tesseractData The `data` object returned by
 *   Tesseract.recognize.  It has properties such as `text` and `words`.
 * @param {Array} mapping The array of field definitions loaded from
 *   fieldMapping.json.
 * @returns {Object} An object whose keys are stateKeys and whose values are
 *   strings (initially empty unless heuristics are added).
 */
function parseReceiptData(tesseractData, mapping) {
  const result = {}
  mapping.forEach((field) => {

    result[field.stateKey] = ''
  })

  const text = tesseractData.text || ''
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
  ]
  for (const r of datePatterns) {
    const m = text.match(r)
    if (m) {
      const year = r === datePatterns[0] ? m[3] : m[1]
      const month = r === datePatterns[0] ? m[1] : m[2]
      const day = r === datePatterns[0] ? m[2] : m[3]
      const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      result['purchases[0].date'] = normalized
      break
    }
  }

  for (const line of lines) {
    if (!/[0-9]/.test(line) && line.length && line.length < 40) {
      result['purchases[0].vendor'] = line
      break
    }
  }

  const clean = (s) => s.replace(/[,$]/g, '').trim()

  const subMatch = text.match(/subtotal[^0-9]{0,10}([\d.,]+)/i)
  if (subMatch) {
    const val = clean(subMatch[1])
    result['purchases[0].subtotal'] = val
    if ('subtotalP' in result) result.subtotalP = val
  }

  const taxMatch = text.match(/(?:sales\s*)?tax[^0-9]{0,10}([\d.,]+)/i)
  if (taxMatch) {
    const val = clean(taxMatch[1])
    result['purchases[0].tax'] = val
    if ('taxTotal' in result) result.taxTotal = val
  }

  const totalMatch = text.match(/(?:grand\s*)?total[^0-9]{0,10}([\d.,]+)/i)
  if (totalMatch) {
    const val = clean(totalMatch[1])
    result['purchases[0].total'] = val
    if ('grandTotal' in result) result.grandTotal = val
    if ('vendorTotal' in result) result.vendorTotal = val
  }


  return result
}

module.exports = { parseReceiptData }

