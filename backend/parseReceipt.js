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
  const result = {};
  mapping.forEach((field) => {
    result[field.stateKey] = '';
  });
  // TODO: implement real parsing of tesseractData.text here
  return result;
}

module.exports = { parseReceiptData };
