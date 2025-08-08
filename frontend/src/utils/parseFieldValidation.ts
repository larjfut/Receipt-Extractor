// utils/parseFieldValidation.ts
export function parseFieldValidation(validation?: string): string[] {
  if (!validation) return [];
  const raw = validation.trim();
  if (!raw.startsWith("[")) return [];
  try {
    return JSON.parse(raw.replace(/'/g, '"'));
  } catch {
    return [];
  }
}
