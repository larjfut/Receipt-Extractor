// utils/normalizeKeys.js
export function normalizeKeys(obj) {
  if (!obj || typeof obj !== "object") return {}
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.replaceAll("[i]", "[0]"), v])
  )
}
