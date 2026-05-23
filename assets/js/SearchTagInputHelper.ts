export function normalizeSearchTagInput(rawValue: string) {
  if (!rawValue) {
    return ''
  }

  let value = rawValue.trim()

  // Collapse one or more OR tokens (case-insensitive) into a comma — the OR-group delimiter
  value = value.replace(/\s*(?:\bor\b(?:\s+)?)+\s*/gi, ',')

  // Replace remaining spaces (within individual tag names) with underscores
  value = value.replace(/\s/g, '_')

  return value
}
