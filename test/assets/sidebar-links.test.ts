import { beforeAll, describe, expect, it, vi } from 'vitest'
import { project } from '../../config/project'

vi.mock('~~/config/project', () => import('../../config/project'))

let sidebarLinks: typeof import('../../app/assets/js/sidebarLinks').sidebarLinks

beforeAll(async () => {
  ;({ sidebarLinks } = await import('../../app/assets/js/sidebarLinks'))
})

describe('sidebarLinks', () => {
  it('contains the complete set of primary navigation links with valid structure', () => {
    const linkIds = sidebarLinks.map((link) => link.id)

    expect(linkIds).toEqual(['home', 'other-sites', 'install-app', 'faq', 'blog', 'legal', 'settings'])

    for (const link of sidebarLinks) {
      expect(link.nameKey).toMatch(/^nav\./)
      expect(typeof link.href).toBe('string')
      expect(link.href.length).toBeGreaterThan(0)
      expect(typeof link.isExternal).toBe('boolean')
      expect(link.icon).toBeDefined()
    }
  })

  it('correctly constructs dynamic production URLs for external links', () => {
    const installLink = sidebarLinks.find((link) => link.id === 'install-app')
    expect(installLink?.isExternal).toBe(true)
    expect(installLink?.href).toBe(`https://www.installpwa.com/from/${project.urls.production.hostname}`)

    const blogLink = sidebarLinks.find((link) => link.id === 'blog')
    expect(blogLink?.isExternal).toBe(true)
    expect(blogLink?.href).toBe(`${project.urls.production.toString()}blog`)
  })

  it('marks internal routing links with isExternal false and valid relative paths', () => {
    const internalLinks = sidebarLinks.filter((link) => !link.isExternal)

    for (const link of internalLinks) {
      expect(link.href.startsWith('/')).toBe(true)
    }
  })
})
