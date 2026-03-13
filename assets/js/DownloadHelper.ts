export function downloadBlob(blob: Blob, filename: string) {
  const objectURL = window.URL.createObjectURL(blob)

  const anchorElement = document.createElement('a')

  anchorElement.href = objectURL
  anchorElement.download = filename
  anchorElement.style.display = 'none'

  document.body.appendChild(anchorElement)
  anchorElement.click()

  anchorElement.remove()

  setTimeout(() => window.URL.revokeObjectURL(objectURL), 100)
}
