// utils/parseFieldValidation.js
export function parseFieldValidation(validation) {
  if (!validation) return []
  const raw = validation.trim()
  if (!raw.startsWith("[")) return []
  try {
    return JSON.parse(raw.replace(/'/g, '"'))
  } catch {
    return []
  }
}
