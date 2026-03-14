import {describe, expect, it} from 'vitest'
import {proxyUrl} from '../../assets/js/proxy'

describe('proxyUrl', () => {
  it('builds a production proxy URL with the expected path and query', () => {
    expect(proxyUrl('https://example.local/file.jpg')).toBe(
      'https://r34.app/api/cors-proxy/?q=https%3A%2F%2Fexample.local%2Ffile.jpg'
    )
  })

  it('adds an optional download name', () => {
    expect(proxyUrl('https://example.local/file.jpg', 'sample.jpg')).toBe(
      'https://r34.app/api/cors-proxy/?download=sample.jpg&q=https%3A%2F%2Fexample.local%2Ffile.jpg'
    )
  })
})
