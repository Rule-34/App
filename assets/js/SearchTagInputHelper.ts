export function normalizeSearchTagInput(rawValue: string) {
  if (!rawValue) {
    return ''
  }

  let value = rawValue.trim()

  // Map typed OR separators (including adjacent/repeated "or" tokens) to existing pipe semantics
  value = value.replace(/\s*(?:\bor\b(?:\s+)?)+\s*/gi, '|')

  // Replace spaces inside tags with underscores
  value = value.replace(/\s/g, '_')

  return value
}
