export function buildPath(postingId, date, ext) {
  const dateStr = date.toISOString().split('T')[0];
  return `/Shortcuts/${postingId}/${dateStr}.${ext}`;
}