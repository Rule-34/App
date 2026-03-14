export function normalizeSearchTagInput(rawValue: string) {
  if (!rawValue) {
    return ''
  }

  let value = rawValue.trim()

  // Map typed OR separators to existing pipe semantics
  value = value.replace(/\s+or\s+/gi, '|')

  // Replace spaces inside tags with underscores
  value = value.replace(/\s/g, '_')

  return value
}
