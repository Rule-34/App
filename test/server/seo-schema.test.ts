import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { serverSetupConfig } from '../helper'

type SchemaOrgNode = {
  '@type'?: string | string[]
  '@id'?: string
  contentUrl?: string
  url?: string
  width?: number
  height?: number
  itemListElement?: unknown[]
}

function extractSchemaOrgGraph(html: string): SchemaOrgNode[] {
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]

  // All nodes must merge into a single graph; a second ld+json block means conflicting registrations.
  expect(scripts).toHaveLength(1)

  const parsed = JSON.parse(scripts[0]?.[1] ?? '') as { '@graph'?: SchemaOrgNode[] }

  return parsed['@graph'] ?? []
}

function findNodesByType(graph: SchemaOrgNode[], type: string): SchemaOrgNode[] {
  return graph.filter((node) => {
    const nodeTypes = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]

    return nodeTypes.includes(type)
  })
}

/**
 * The first posts page is only available after the component's suspense prefetch resolves, so the
 * media nodes have to be registered from the prefetch hook on the server. Without that, the SSR
 * response ships a schema graph without any ImageObject entries.
 */
describe('Server-rendered schema.org media nodes', async () => {
  await setup(serverSetupConfig)

  function expectListingSchema(graph: SchemaOrgNode[]) {
    expect(findNodesByType(graph, 'CollectionPage')).toHaveLength(1)
    expect(findNodesByType(graph, 'BreadcrumbList')).toHaveLength(1)

    const images = findNodesByType(graph, 'ImageObject')

    expect(images).toHaveLength(8)

    for (const image of images) {
      expect(image.url).toMatch(/^https:\/\/safebooru\.org\/images\//)
      expect(image.contentUrl).toBe(image.url)
      expect(typeof image.width).toBe('number')
      expect(typeof image.height).toBe('number')
    }
  }

  it('describes the first posts page of a domain listing', async () => {
    const html = await $fetch<string>('/posts/safebooru.org')

    expectListingSchema(extractSchemaOrgGraph(html))
  }, 60000)

  it('describes the first posts page of a tag listing', async () => {
    const html = await $fetch<string>('/posts/safebooru.org/hair_bun')

    expectListingSchema(extractSchemaOrgGraph(html))
  }, 60000)
})
