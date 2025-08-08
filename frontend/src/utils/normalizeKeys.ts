// utils/normalizeKeys.ts
export function normalizeKeys(obj: Record<string, unknown>) {
  if (!obj || typeof obj !== "object") return {};
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.replaceAll("[i]", "[0]"), v])
  );
}
