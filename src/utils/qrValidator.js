export function normalizePostingId(raw) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}